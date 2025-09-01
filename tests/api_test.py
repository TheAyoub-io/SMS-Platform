import requests
import json
import time
import subprocess
import os

# Start the FastAPI application
p = subprocess.Popen(
    ["uvicorn", "--env-file", ".env", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
    cwd=os.path.join(os.path.dirname(__file__), "..")
)

# Wait for the server to start
time.sleep(5)

BASE_URL = "http://localhost:8000"

def main():
    try:
        # 1. Create a user and get a token
        print("Creating user...")
        user_payload = {"nom_agent": "testuser", "identifiant": "testuser", "mot_de_passe": "password", "role": "agent"}
        # This endpoint does not exist, so I will skip authentication for now
        # I will assume the endpoints are not protected for this test.
        # This is a limitation of this test script.

        headers = {"Content-Type": "application/json"}

        # 2. Create a contact
        print("Creating contact...")
        contact_payload = {
            "nom": "Test",
            "prenom": "Contact",
            "numero_telephone": "+15559876543",
            "email": "test.contact2@example.com",
        }
        contact_response = requests.post(f"{BASE_URL}/contacts/", data=json.dumps(contact_payload), headers=headers)
        contact_response.raise_for_status()
        contact_data = contact_response.json()
        contact_id = contact_data["id_contact"]
        print(f"Contact created with ID: {contact_id}")

        # 3. Create a mailing list
        print("Creating mailing list...")
        mailing_list_payload = {
            "nom_liste": "My Test List",
            "contact_ids": [contact_id]
        }
        mailing_list_response = requests.post(f"{BASE_URL}/mailing-lists/", data=json.dumps(mailing_list_payload), headers=headers)
        mailing_list_response.raise_for_status()
        mailing_list_data = mailing_list_response.json()
        mailing_list_id = mailing_list_data["id_liste"]
        print(f"Mailing list created with ID: {mailing_list_id}")

        # 4. Create a campaign
        print("Creating campaign...")
        campaign_payload = {
            "nom_campagne": "My Test Campaign",
            "date_debut": "2025-09-01T12:00:00Z",
            "date_fin": "2025-09-10T12:00:00Z",
            "statut": "draft",
            "type_campagne": "promotional",
        }
        campaign_response = requests.post(f"{BASE_URL}/campaigns/", data=json.dumps(campaign_payload), headers=headers)
        campaign_response.raise_for_status()
        campaign_data = campaign_response.json()
        campaign_id = campaign_data["id_campagne"]
        print(f"Campaign created with ID: {campaign_id}")

        # 5. Update the mailing list with the campaign ID
        print("Updating mailing list...")
        update_payload = {"id_campagne": campaign_id}
        update_response = requests.put(f"{BASE_URL}/mailing-lists/{mailing_list_id}", data=json.dumps(update_payload), headers=headers)
        update_response.raise_for_status()
        print("Mailing list updated successfully")

        # 6. Update the campaign status
        print("Updating campaign status...")
        campaign_update_payload = {**campaign_payload, "statut": "scheduled"}
        campaign_update_response = requests.put(f"{BASE_URL}/campaigns/{campaign_id}", data=json.dumps(campaign_update_payload), headers=headers)
        campaign_update_response.raise_for_status()
        print("Campaign status updated successfully")

        print("\nAll tests passed!")

    except requests.exceptions.RequestException as e:
        print(f"\nAn error occurred: {e}")
        if e.response:
            print(f"Response content: {e.response.content}")
    finally:
        # Stop the server
        p.terminate()

if __name__ == "__main__":
    main()
