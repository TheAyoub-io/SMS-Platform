import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, message } from 'antd';
import type { TableProps } from 'antd';
import api from '../services/api';
import CampaignForm from '../components/CampaignForm';

const { Title } = Typography;

export interface Campaign {
  id_campagne: number;
  nom_campagne: string;
  statut: string;
  type_campagne: string;
  date_debut: string;
  date_fin: string;
}

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign> | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      message.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = () => {
    setEditingCampaign(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Campaign) => {
    setEditingCampaign(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
        await api.delete(`/campaigns/${id}`);
        message.success('Campaign deleted successfully');
        fetchCampaigns(); // Refresh the table
    } catch (error) {
        console.error('Failed to delete campaign:', error);
        message.error('Failed to delete campaign');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalFinish = async (values: any) => {
    try {
      if (editingCampaign && 'id_campagne' in editingCampaign) {
        await api.put(`/campaigns/${editingCampaign.id_campagne}`, values);
        message.success('Campaign updated successfully');
      } else {
        await api.post('/campaigns/', values);
        message.success('Campaign created successfully');
      }
      setIsModalVisible(false);
      fetchCampaigns(); // Refresh the table
    } catch (error) {
      console.error('Failed to save campaign:', error);
      message.error('Failed to save campaign');
    }
  };

  const columns: TableProps<Campaign>['columns'] = [
    { title: 'Name', dataIndex: 'nom_campagne', key: 'name' },
    { title: 'Status', dataIndex: 'statut', key: 'status' },
    { title: 'Type', dataIndex: 'type_campagne', key: 'type' },
    { title: 'Start Date', dataIndex: 'date_debut', key: 'startDate', render: (text) => new Date(text).toLocaleDateString() },
    { title: 'End Date', dataIndex: 'date_fin', key: 'endDate', render: (text) => new Date(text).toLocaleDateString() },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>Edit</a>
          <a onClick={() => handleDelete(record.id_campagne)}>Delete</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Campaigns</Title>
        <Button type="primary" onClick={handleCreate}>
          Create Campaign
        </Button>
      </div>
      <Table columns={columns} dataSource={campaigns} rowKey="id_campagne" loading={loading} />
      <CampaignForm
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onFinish={handleModalFinish}
        initialValues={editingCampaign}
      />
    </div>
  );
};

export default CampaignsPage;
