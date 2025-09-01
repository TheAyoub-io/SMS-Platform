import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, message } from 'antd';
import type { TableProps } from 'antd';
import api from '../services/api';

const { Title } = Typography;

interface Contact {
  id_contact: number;
  nom: string;
  prenom: string;
  numero_telephone: string;
  email: string;
  segment: string;
}

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      message.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const columns: TableProps<Contact>['columns'] = [
    { title: 'First Name', dataIndex: 'prenom', key: 'prenom' },
    { title: 'Last Name', dataIndex: 'nom', key: 'nom' },
    { title: 'Phone Number', dataIndex: 'numero_telephone', key: 'numero_telephone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Segment', dataIndex: 'segment', key: 'segment' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a>Edit</a>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Contacts</Title>
        <Space>
          <Button type="primary">Create Contact</Button>
          <Button>Import Contacts</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={contacts} rowKey="id_contact" loading={loading} />
    </div>
  );
};

export default ContactsPage;
