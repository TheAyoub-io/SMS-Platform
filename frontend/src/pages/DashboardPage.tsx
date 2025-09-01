import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const { Title } = Typography;

interface DashboardStats {
  total_campaigns: number;
  total_contacts: number;
  total_sms_sent: number;
  total_cost: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reports/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = stats ? [
    { name: 'Campaigns', value: stats.total_campaigns },
    { name: 'Contacts', value: stats.total_contacts },
    { name: 'SMS Sent', value: stats.total_sms_sent },
  ] : [];

  return (
    <>
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
        </Col>
      </Row>
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Campaigns" value={stats?.total_campaigns} loading={loading} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Contacts" value={stats?.total_contacts} loading={loading} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total SMS Sent" value={stats?.total_sms_sent} loading={loading} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Cost" prefix="$" value={stats ? stats.total_cost.toFixed(2) : 0} loading={loading} />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 32 }}>
        <Title level={4} style={{ marginBottom: 16 }}>Summary</Title>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
};

export default DashboardPage;
