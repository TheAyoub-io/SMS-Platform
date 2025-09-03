import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import Table from "../components/common/Table";
import Modal from "../components/common/Modal";
import ContactForm from "../components/ContactForm";
import { toast } from "react-hot-toast";

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.get<Contact[]>("/contacts");
      setContacts(data);
    } catch (error) {
      toast.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreate = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await apiService.delete(`/contacts/${id}`);
        toast.success("Contact deleted successfully");
        fetchContacts();
      } catch (error) {
        toast.error("Failed to delete contact");
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingContact) {
        await apiService.put(`/contacts/${editingContact.id}`, data);
        toast.success("Contact updated successfully");
      } else {
        await apiService.post("/contacts", data);
        toast.success("Contact created successfully");
      }
      setIsModalOpen(false);
      fetchContacts();
    } catch (error) {
      toast.error("Failed to save contact");
    }
  };

  const columns = [
    { header: "First Name", accessor: "first_name" as const },
    { header: "Last Name", accessor: "last_name" as const },
    { header: "Phone Number", accessor: "phone_number" as const },
    { header: "Email", accessor: "email" as const },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create Contact
        </button>
      </div>

      {loading ? (
        <p>Loading contacts...</p>
      ) : (
        <Table<Contact>
          columns={columns}
          data={contacts}
          renderActions={(contact) => (
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(contact)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(contact.id)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </div>
          )}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? "Edit Contact" : "Create Contact"}
      >
        <ContactForm
          onSubmit={handleFormSubmit}
          initialValues={editingContact || {}}
        />
      </Modal>
    </div>
  );
};

export default ContactsPage;
