import React from 'react';
import TaskMonitor from '../components/admin/TaskMonitor';
import UserManagement from '../components/admin/UserManagement';
import AuditTrail from '../components/admin/AuditTrail';
import AdminDashboard from '../components/admin/AdminDashboard';

const AdminPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">System Administration</h1>
      <AdminDashboard />
      <UserManagement />
      <AuditTrail />
      <TaskMonitor />
    </div>
  );
};

export default AdminPage;
