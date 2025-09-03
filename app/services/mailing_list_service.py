import logging
from datetime import datetime
from sqlalchemy.orm import Session
from typing import List

from app.db.models import MailingList, Contact, MessageTemplate
from app.api.v1.schemas.mailing_list import MailingListCreate, MailingListUpdate, ListStatistics, BulkFilter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MailingListService:
    def __init__(self, db: Session):
        self.db = db

    def get_list(self, list_id: int) -> MailingList | None:
        return self.db.query(MailingList).filter(
            MailingList.id_liste == list_id,
            MailingList.deleted_at.is_(None)
        ).first()

    def get_all_lists(self, skip: int = 0, limit: int = 100) -> List[MailingList]:
        return self.db.query(MailingList).filter(MailingList.deleted_at.is_(None)).offset(skip).limit(limit).all()

    def create_list(self, list_data: MailingListCreate) -> MailingList:
        new_list = MailingList(**list_data.model_dump())
        self.db.add(new_list)
        self.db.commit()
        self.db.refresh(new_list)
        return new_list

    def update_list(self, list_id: int, list_data: MailingListUpdate) -> MailingList | None:
        db_list = self.get_list(list_id)
        if not db_list:
            return None

        update_data = list_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_list, key, value)

        self.db.commit()
        self.db.refresh(db_list)
        return db_list

    def soft_delete_list(self, list_id: int) -> MailingList | None:
        db_list = self.get_list(list_id)
        if not db_list:
            return None

        db_list.deleted_at = datetime.utcnow()
        self.db.commit()
        return db_list

    def add_contacts_to_list(self, list_id: int, contact_ids: List[int]) -> dict | None:
        db_list = self.get_list(list_id)
        if not db_list:
            return None

        # Validate that all provided contact IDs exist
        valid_contacts_query = self.db.query(Contact).filter(Contact.id_contact.in_(contact_ids))
        valid_contacts = valid_contacts_query.all()
        valid_contact_ids = {c.id_contact for c in valid_contacts}

        invalid_ids = set(contact_ids) - valid_contact_ids
        if invalid_ids:
            # The test expects a 400 or 404. Let's treat it as a client error (400)
            # as the client is sending non-existent IDs.
            # In a real app, you might log this or handle it differently.
            # For the test to pass, we must not return 200 OK.
            # We can't raise an HTTPException here, so we return a specific dict
            # that the endpoint can check for. Or we modify the endpoint to handle it.
            # For now, let's just not add them and the test should be updated.
            # Let's reconsider. The test expects an exception. So we should raise it.
            # The service layer can raise HTTPExceptions that the framework will catch.
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail=f"Contacts not found: {list(invalid_ids)}")


        contacts_to_add_query = self.db.query(Contact).filter(
            Contact.id_contact.in_(contact_ids),
            Contact.statut_opt_in == True
        )
        contacts_to_add = contacts_to_add_query.all()

        # Deduplication
        existing_contact_ids = {contact.id_contact for contact in db_list.contacts}
        new_contacts = [c for c in contacts_to_add if c.id_contact not in existing_contact_ids]

        if not new_contacts:
            return {"success": True, "contacts_added": 0, "message": "No new contacts to add or contacts have opted out."}

        for contact in new_contacts:
            db_list.contacts.append(contact)

        self.db.commit()
        return {"success": True, "contacts_added": len(new_contacts)}

    def get_list_contacts(self, list_id: int) -> List[Contact] | None:
        """
        Retrieves all contacts associated with a specific mailing list.
        """
        db_list = self.get_list(list_id)
        if not db_list:
            return None
        return db_list.contacts

    def remove_contacts_from_list(self, list_id: int, contact_ids: List[int]) -> dict | None:
        db_list = self.get_list(list_id)
        if not db_list:
            return None

        initial_count = len(db_list.contacts)
        ids_to_remove = set(contact_ids)
        db_list.contacts = [c for c in db_list.contacts if c.id_contact not in ids_to_remove]

        contacts_removed_count = initial_count - len(db_list.contacts)

        self.db.commit()
        return {"success": True, "contacts_removed": contacts_removed_count}

    def get_list_statistics(self, list_id: int) -> ListStatistics | None:
        from collections import Counter

        db_list = self.get_list(list_id)
        if not db_list:
            return None

        contacts = db_list.contacts
        total_contacts = len(contacts)

        if total_contacts == 0:
            return ListStatistics(
                total_contacts=0,
                opt_in_contacts=0,
                opt_out_contacts=0,
                segments={},
                zones={},
                contact_types={}
            )

        opt_in_contacts = sum(1 for c in contacts if c.statut_opt_in)
        opt_out_contacts = total_contacts - opt_in_contacts

        # Calculate segment and zone distributions
        segment_counts = Counter(c.segment for c in contacts if c.segment)
        zone_counts = Counter(c.zone_geographique for c in contacts if c.zone_geographique)
        type_counts = Counter(c.type_client for c in contacts if c.type_client)

        return ListStatistics(
            total_contacts=total_contacts,
            opt_in_contacts=opt_in_contacts,
            opt_out_contacts=opt_out_contacts,
            segments=dict(segment_counts),
            zones=dict(zone_counts),
            contact_types=dict(type_counts)
        )

    def preview_campaign_for_list(self, list_id: int, message_template: str, sample_size: int) -> dict | None:
        db_list = self.get_list(list_id)
        if not db_list:
            return None

        # Filter for opt-in contacts only for the preview
        opt_in_contacts = [c for c in db_list.contacts if c.statut_opt_in]

        # Get a sample of contacts
        sample_contacts = opt_in_contacts[:sample_size]

        previews = []
        for contact in sample_contacts:
            personalized_content = self._personalize_message(message_template, contact)
            previews.append({
                "contact_name": f"{contact.prenom} {contact.nom}",
                "phone_number": contact.numero_telephone,
                "personalized_message": personalized_content
            })

        # The test expects a dict that can be parsed by PreviewResponse schema
        return {
            "previews": previews,
            "total_contacts": len(opt_in_contacts),
            "estimated_cost": 0.0 # Placeholder for now
        }

    def _personalize_message(self, template_content: str, contact: Contact) -> str:
        """
        Replaces placeholders in a message template with contact data.
        Handles missing keys gracefully by leaving the placeholder as is.
        """
        # Create a dictionary from the contact's attributes
        contact_data = {key: getattr(contact, key, '') for key in contact.__table__.columns.keys()}

        # A custom dictionary to handle missing keys in .format_map
        class SafeDict(dict):
            def __missing__(self, key):
                return f'{{{key}}}' # Return the placeholder itself if key is not found

        return template_content.format_map(SafeDict(contact_data))

    def bulk_add_contacts_by_filter(self, list_id: int, filters: BulkFilter) -> dict | None:
        db_list = self.get_list(list_id)
        if not db_list:
            return None

        # Start with a base query for contacts
        query = self.db.query(Contact)

        # Apply filters from the payload
        filter_data = filters.model_dump(exclude_none=True)
        for key, value in filter_data.items():
            query = query.filter(getattr(Contact, key) == value)

        # Ensure we only add contacts who have opted in
        query = query.filter(Contact.statut_opt_in == True)

        contacts_to_add = query.all()

        if not contacts_to_add:
            return {"success": True, "contacts_added": 0, "message": "No matching contacts found."}

        # Deduplication: get IDs of contacts already in the list
        existing_contact_ids = {c.id_contact for c in db_list.contacts}

        # Filter out contacts that are already in the list
        new_contacts = [c for c in contacts_to_add if c.id_contact not in existing_contact_ids]

        if not new_contacts:
            return {"success": True, "contacts_added": 0, "message": "All matching contacts are already in the list."}

        # Add the new contacts to the list
        for contact in new_contacts:
            db_list.contacts.append(contact)

        self.db.commit()

        return {"success": True, "contacts_added": len(new_contacts)}

    def bulk_remove_contacts_by_filter(self, list_id: int, filters: BulkFilter) -> dict | None:
        db_list = self.get_list(list_id)
        if not db_list:
            return None

        # Find contacts to remove based on filters
        query = self.db.query(Contact.id_contact) # Only select IDs
        filter_data = filters.model_dump(exclude_none=True)
        for key, value in filter_data.items():
            query = query.filter(getattr(Contact, key) == value)

        contact_ids_to_remove = {id_tuple[0] for id_tuple in query.all()}

        if not contact_ids_to_remove:
            return {"success": True, "contacts_removed": 0, "message": "No matching contacts found to remove."}

        initial_count = len(db_list.contacts)

        # Filter the list's contacts, keeping only those whose IDs are NOT in the removal set
        db_list.contacts = [c for c in db_list.contacts if c.id_contact not in contact_ids_to_remove]

        contacts_removed_count = initial_count - len(db_list.contacts)

        self.db.commit()

        return {"success": True, "contacts_removed": contacts_removed_count}
