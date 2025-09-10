import React from 'react';
import { useSMSQueue } from '../../hooks/useQueue';
import { format } from 'date-fns';

const SMSQueueTable: React.FC = () => {
  const { data: queueItems, isLoading, error } = useSMSQueue();

  if (isLoading) return <div>Loading SMS queue...</div>;
  if (error) return <div>Error loading SMS queue: {error.message}</div>;
  if (!queueItems || queueItems.length === 0) return <div>SMS queue is empty.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {queueItems.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(item.created_at), 'yyyy-MM-dd HH:mm')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.campaign_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.contact_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.attempts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SMSQueueTable;
