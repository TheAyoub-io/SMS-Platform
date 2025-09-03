import pytest
from sqlalchemy.orm import Session
from app.services import contact_service
from app.db.models import Contact
from app.api.v1.schemas.mailing_list import ContactFilter

@pytest.fixture
def setup_contacts(db_session: Session):
    """Fixture to set up contacts for filtering and searching tests."""
    contacts = [
        Contact(nom="Doe", prenom="John", email="john.doe@example.com", segment="VIP", zone_geographique="NA", type_client="Premium", statut_opt_in=True, numero_telephone="111111111"),
        Contact(nom="Smith", prenom="Jane", email="jane.smith@example.com", segment="New", zone_geographique="EU", type_client="Standard", statut_opt_in=False, numero_telephone="222222222"),
        Contact(nom="Williams", prenom="Jake", email="jake.w@example.com", segment="VIP", zone_geographique="EU", type_client="Premium", statut_opt_in=True, numero_telephone="333333333"),
    ]
    db_session.add_all(contacts)
    db_session.commit()
    return contacts

def test_search_contacts_by_query(db_session: Session, setup_contacts):
    # Search by name
    results = contact_service.search_contacts_by_query(db_session, query="Doe")
    assert len(results) == 1
    assert results[0].nom == "Doe"

    # Search by email
    results = contact_service.search_contacts_by_query(db_session, query="jane.smith")
    assert len(results) == 1
    assert results[0].prenom == "Jane"

    # Search by partial query
    results = contact_service.search_contacts_by_query(db_session, query="ake")
    assert len(results) == 1
    assert results[0].nom == "Williams"

def test_filter_contacts_by_criteria(db_session: Session, setup_contacts):
    # Filter by segment
    filters = ContactFilter(segment="VIP")
    results = contact_service.filter_contacts_by_criteria(db_session, filters=filters)
    assert len(results) == 2
    assert all(c.segment == "VIP" for c in results)

    # Filter by opt-in status
    filters = ContactFilter(statut_opt_in=False)
    results = contact_service.filter_contacts_by_criteria(db_session, filters=filters)
    assert len(results) == 1
    assert results[0].nom == "Smith"

    # Filter by multiple criteria
    filters = ContactFilter(segment="VIP", zone_geographique="EU")
    results = contact_service.filter_contacts_by_criteria(db_session, filters=filters)
    assert len(results) == 1
    assert results[0].nom == "Williams"
