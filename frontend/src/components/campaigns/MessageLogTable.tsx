import React from 'react';
import { useMessagesByCampaign } from '../../hooks/useMessages';
import { format } from 'date-fns';
import { Message } from '../../services/messageApi';

interface MessageLogTableProps {
  campaignId: number;
}

const MessageLogTable: React.FC<MessageLogTableProps> = ({ campaignId }) => {
  const { data: messages, isLoading, error } = useMessagesByCampaign(campaignId);

  if (isLoading) return <div>Loading message logs...</div>;
  if (error) return <div>Error loading message logs: {error.message}</div>;
  if (!messages || messages.length === 0) return <div>No messages found for this campaign.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">External ID</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {messages.map((message) => (
            <tr key={message.id_message}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(message.date_envoi), 'yyyy-MM-dd HH:mm')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{message.id_contact}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{message.contenu}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{message.statut_livraison}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{message.external_message_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MessageLogTable;
