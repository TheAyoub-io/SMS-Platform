import React, { useState, useEffect } from 'react';
import { Form, Input, Table, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import api from '../../services/api';

interface Contact {
  id_contact: number;
  nom: string;
  prenom: string;
  numero_telephone: string;
  email: string;
}

interface Step3AudienceProps {
  form: FormInstance;
}

const Step3_Audience: React.FC<Step3AudienceProps> = ({ form }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/contacts/');
        setContacts(response.data);
      } catch (error) {
        message.error('Failed to load contacts.');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    form.setFieldsValue({ contact_ids: newSelectedRowKeys });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    { title: 'First Name', dataIndex: 'prenom', key: 'prenom' },
    { title: 'Last Name', dataIndex: 'nom', key: 'nom' },
    { title: 'Phone Number', dataIndex: 'numero_telephone', key: 'numero_telephone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
  ];

  return (
    <div>
      <Form.Item
        label="Audience Name"
        name="nom_liste"
        rules={[{ required: true, message: 'Please input a name for your audience list!' }]}
      >
        <Input placeholder="e.g., VIP Clients June 2024" />
      </Form.Item>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={contacts}
        loading={loading}
        rowKey="id_contact"
      />
    </div>
  );
};

export default Step3_Audience;
