import React from 'react';
import { useTaskStatus } from '../../hooks/useTasks';

const TaskMonitor: React.FC = () => {
  const { data, isLoading, isError } = useTaskStatus();

  if (isLoading) return <p>Loading task status...</p>;
  if (isError) return <p className="text-red-500">Error loading task status.</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Background Task Monitor</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold">Worker Stats</h4>
          <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md text-xs overflow-x-auto">
            {JSON.stringify(data?.stats, null, 2)}
          </pre>
        </div>
        <div>
          <h4 className="font-semibold">Active Tasks</h4>
          <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md text-xs overflow-x-auto">
            {JSON.stringify(data?.active_tasks, null, 2)}
          </pre>
        </div>
        <div className="col-span-2">
          <h4 className="font-semibold">Scheduled Tasks</h4>
          <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md text-xs overflow-x-auto">
            {JSON.stringify(data?.scheduled_tasks, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TaskMonitor;
