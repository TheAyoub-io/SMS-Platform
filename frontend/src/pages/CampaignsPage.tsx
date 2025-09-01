import { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, message, Popconfirm } from 'antd';
import type { TableProps } from 'antd';
import api from '../services/api';

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
          <a>Edit</a>
          <Popconfirm title="Delete this campaign?" onConfirm={() => handleDelete(record.id_campagne)}>
            <a>Delete</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Campaigns</Title>
        <Button type="primary">
          Create Campaign
        </Button>
      </div>
      <Table columns={columns} dataSource={campaigns} rowKey="id_campagne" loading={loading} />
    </div>
  );
};

export default CampaignsPage;
