import React from 'react';
import { useAuditLogs } from '../../hooks/useAdmin';
import { format } from 'date-fns';

const AuditTrail: React.FC = () => {
  const { data: logs, isLoading, isError } = useAuditLogs();

  if (isLoading) return <p>Loading audit trail...</p>;
  if (isError) return <p className="text-red-500">Error loading audit trail.</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Audit Trail</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs?.map(log => (
              <tr key={log.id_log}>
                <td className="px-6 py-4 whitespace-nowrap">{format(new Date(log.timestamp), 'PPpp')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{log.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono">{log.action}</td>
                <td className="px-6 py-4 whitespace-nowrap">{log.table_affected}:{log.record_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrail;
