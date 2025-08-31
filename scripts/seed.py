import sys
import os
from passlib.context import CryptContext

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.db.models import Agent, MessageTemplate, Contact

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_data():
    db = SessionLocal()
    try:
        # Create admin user
        admin_user = db.query(Agent).filter(Agent.identifiant == 'admin').first()
        if not admin_user:
            hashed_password = pwd_context.hash("admin_password")
            admin_user = Agent(
                nom_agent="Admin",
                identifiant="admin",
                mot_de_passe=hashed_password,
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("Admin user created.")
        else:
            print("Admin user already exists.")

        # Create message templates
        template1 = db.query(MessageTemplate).filter(MessageTemplate.nom_modele == 'Promotional Offer').first()
        if not template1:
            template1 = MessageTemplate(
                nom_modele="Promotional Offer",
                contenu_modele="Hi {nom}, don't miss our special offer! Get 50% off on all products. Offer valid until {date_fin}.",
                variables={"nom": "string", "date_fin": "string"},
                creator=admin_user
            )
            db.add(template1)
            print("Promotional template created.")
        else:
            print("Promotional template already exists.")

        template2 = db.query(MessageTemplate).filter(MessageTemplate.nom_modele == 'Appointment Reminder').first()
        if not template2:
            template2 = MessageTemplate(
                nom_modele="Appointment Reminder",
                contenu_modele="Hi {nom}, this is a reminder for your appointment on {date} at {heure}.",
                variables={"nom": "string", "date": "string", "heure": "string"},
                creator=admin_user
            )
            db.add(template2)
            print("Informational template created.")
        else:
            print("Informational template already exists.")

        template3 = db.query(MessageTemplate).filter(MessageTemplate.nom_modele == 'Follow-up').first()
        if not template3:
            template3 = MessageTemplate(
                nom_modele="Follow-up",
                contenu_modele="Hi {nom}, we hope you are satisfied with our service. Please let us know if you have any questions.",
                variables={"nom": "string"},
                creator=admin_user
            )
            db.add(template3)
            print("Follow-up template created.")
        else:
            print("Follow-up template already exists.")

        # Create test contacts
        contact1 = db.query(Contact).filter(Contact.numero_telephone == '+11234567890').first()
        if not contact1:
            contact1 = Contact(
                nom="John",
                prenom="Doe",
                numero_telephone="+11234567890",
                email="john.doe@example.com"
            )
            db.add(contact1)
            print("Test contact 1 created.")
        else:
            print("Test contact 1 already exists.")

        contact2 = db.query(Contact).filter(Contact.numero_telephone == '+10987654321').first()
        if not contact2:
            contact2 = Contact(
                nom="Jane",
                prenom="Smith",
                numero_telephone="+10987654321",
                email="jane.smith@example.com"
            )
            db.add(contact2)
            print("Test contact 2 created.")
        else:
            print("Test contact 2 already exists.")

        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    print("Seeding database...")
    seed_data()
    print("Database seeding finished.")
