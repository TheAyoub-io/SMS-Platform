import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Contact {
  id_contact: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get('/api/v1/contacts/');
        setContacts(response.data);
      } catch (err) {
        setError('Failed to fetch contacts.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
      <ul>
        {contacts.map((contact) => (
          <li key={contact.id_contact} className="mb-2 p-2 border rounded">
            <p>{contact.prenom} {contact.nom}</p>
            <p>{contact.email}</p>
            <p>{contact.telephone}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactsPage;
