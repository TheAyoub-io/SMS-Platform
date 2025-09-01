import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, message, Popconfirm } from 'antd';
import type { TableProps } from 'antd';
import api from '../services/api';
import ContactForm from '../components/ContactForm';
import ImportModal from '../components/ImportModal';

const { Title } = Typography;

export interface Contact {
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<Contact> | null>(null);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);

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

  const handleCreate = () => {
    setEditingContact(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Contact) => {
    setEditingContact(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
        await api.delete(`/contacts/${id}`);
        message.success('Contact deleted successfully');
        fetchContacts(); // Refresh the table
    } catch (error) {
        console.error('Failed to delete contact:', error);
        message.error('Failed to delete contact');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalFinish = async (values: any) => {
    try {
      if (editingContact && 'id_contact' in editingContact) {
        await api.put(`/contacts/${editingContact.id_contact}`, values);
        message.success('Contact updated successfully');
      } else {
        await api.post('/contacts/', values);
        message.success('Contact created successfully');
      }
      setIsModalVisible(false);
      fetchContacts(); // Refresh the table
    } catch (error) {
      console.error('Failed to save contact:', error);
      message.error('Failed to save contact');
    }
  };

  const handleImportSuccess = () => {
    setIsImportModalVisible(false);
    fetchContacts();
  };

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
          <a onClick={() => handleEdit(record)}>Edit</a>
          <Popconfirm
            title="Delete the contact"
            description="Are you sure to delete this contact?"
            onConfirm={() => handleDelete(record.id_contact)}
            okText="Yes"
            cancelText="No"
          >
            <a>Delete</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Contacts</Title>
        <Space>
          <Button type="primary" onClick={handleCreate}>Create Contact</Button>
          <Button onClick={() => setIsImportModalVisible(true)}>Import Contacts</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={contacts} rowKey="id_contact" loading={loading} />
      <ContactForm
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onFinish={handleModalFinish}
        initialValues={editingContact}
      />
      <ImportModal
        visible={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default ContactsPage;
