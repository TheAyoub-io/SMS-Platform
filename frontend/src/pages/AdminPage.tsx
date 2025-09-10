import React from 'react';
import TaskMonitor from '../components/admin/TaskMonitor';
import UserManagement from '../components/admin/UserManagement';
import AuditTrail from '../components/admin/AuditTrail';
import AdminDashboard from '../components/admin/AdminDashboard';
import SMSQueueTable from '../components/admin/SMSQueueTable';

const AdminPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">System Administration</h1>
      <AdminDashboard />
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">SMS Queue Monitor</h2>
        <SMSQueueTable />
      </div>
      <UserManagement />
      <AuditTrail />
      <TaskMonitor />
    </div>
  );
};

export default AdminPage;
