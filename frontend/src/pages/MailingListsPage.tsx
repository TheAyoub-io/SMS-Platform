import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface MailingList {
  id_liste: number;
  nom_liste: string;
}

const MailingListsPage: React.FC = () => {
  const [mailingLists, setMailingLists] = useState<MailingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMailingLists = async () => {
      try {
        const response = await api.get('/api/v1/mailing_lists/');
        setMailingLists(response.data);
      } catch (err) {
        setError('Failed to fetch mailing lists.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMailingLists();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mailing Lists</h1>
      <ul>
        {mailingLists.map((list) => (
          <li key={list.id_liste} className="mb-2 p-2 border rounded">
            {list.nom_liste}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MailingListsPage;
