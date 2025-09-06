import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'; // Assuming a Card component exists
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Placeholder data for charts and stats
const stats = [
  { title: 'Total Campaigns', value: '12', change: '+2 since last month' },
  { title: 'Total Contacts', value: '1,204', change: '+50 this week' },
  { title: 'SMS Sent (24h)', value: '316', change: '-5% vs yesterday' },
  { title: 'Delivery Rate', value: '98.2%', change: '+0.1%' },
];

const chartData = [
  { name: 'Mon', sent: 40, delivered: 38 },
  { name: 'Tue', sent: 30, delivered: 29 },
  { name: 'Wed', sent: 20, delivered: 20 },
  { name: 'Thu', sent: 27, delivered: 26 },
  { name: 'Fri', sent: 18, delivered: 18 },
  { name: 'Sat', sent: 23, delivered: 22 },
  { name: 'Sun', sent: 34, delivered: 33 },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#8884d8" name="SMS Sent" />
                <Bar dataKey="delivered" fill="#82ca9d" name="Delivered" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
