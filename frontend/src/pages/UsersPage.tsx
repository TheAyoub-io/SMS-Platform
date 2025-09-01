import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, message, Popconfirm } from 'antd';
import type { TableProps } from 'antd';
import api from '../services/api';
import UserForm from '../components/UserForm';

const { Title } = Typography;

export interface User {
  id_agent: number;
  nom_agent: string;
  identifiant: string;
  role: string;
  is_active: boolean;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Failed to fetch users. You must be an admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
        await api.delete(`/users/${id}`);
        message.success('User deleted successfully');
        fetchUsers(); // Refresh the table
    } catch (error) {
        console.error('Failed to delete user:', error);
        message.error('Failed to delete user');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalFinish = async (values: any) => {
    try {
      if (editingUser && 'id_agent' in editingUser) {
        await api.put(`/users/${editingUser.id_agent}`, values);
        message.success('User updated successfully');
      } else {
        await api.post('/users/', values);
        message.success('User created successfully');
      }
      setIsModalVisible(false);
      fetchUsers(); // Refresh the table
    } catch (error) {
      console.error('Failed to save user:', error);
      message.error('Failed to save user');
    }
  };

  const columns: TableProps<User>['columns'] = [
    { title: 'Name', dataIndex: 'nom_agent', key: 'nom_agent' },
    { title: 'Username', dataIndex: 'identifiant', key: 'identifiant' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Active', dataIndex: 'is_active', key: 'is_active', render: (active) => (active ? 'Yes' : 'No') },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>Edit</a>
          <Popconfirm
            title="Delete this user?"
            description="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.id_agent)}
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
        <Title level={2}>User Management</Title>
        <Button type="primary" onClick={handleCreate}>Create User</Button>
      </div>
      <Table columns={columns} dataSource={users} rowKey="id_agent" loading={loading} />
      <UserForm
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onFinish={handleModalFinish}
        initialValues={editingUser}
      />
    </div>
  );
};

export default UsersPage;
