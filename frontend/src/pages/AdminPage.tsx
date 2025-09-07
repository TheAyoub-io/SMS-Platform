import React from 'react';
import TaskMonitor from '../components/admin/TaskMonitor';

const AdminPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <TaskMonitor />
    </div>
  );
};

export default AdminPage;
