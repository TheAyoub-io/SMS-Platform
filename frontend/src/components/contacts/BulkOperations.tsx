import React from 'react';
import { useBulkUpdateOptStatus } from '../../hooks/useContacts';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface BulkOperationsProps {
  selectedIds: number[];
  onClearSelection: () => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({ selectedIds, onClearSelection }) => {
  const bulkUpdateStatusMutation = useBulkUpdateOptStatus();

  if (selectedIds.length === 0) {
    return null;
  }

  const handleOptIn = () => {
    bulkUpdateStatusMutation.mutate({ contact_ids: selectedIds, opt_in_status: true }, {
      onSuccess: onClearSelection,
    });
  };

  const handleOptOut = () => {
    bulkUpdateStatusMutation.mutate({ contact_ids: selectedIds, opt_in_status: false }, {
      onSuccess: onClearSelection,
    });
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex items-center space-x-4 border dark:border-gray-700">
      <span className="font-semibold">{selectedIds.length} selected</span>
      <button onClick={handleOptIn} className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200">
        <CheckCircle size={16} className="mr-1" /> Opt-In
      </button>
      <button onClick={handleOptOut} className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200">
        <XCircle size={16} className="mr-1" /> Opt-Out
      </button>
      <button className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
        <Trash2 size={16} className="mr-1" /> Delete
      </button>
      <button onClick={onClearSelection} className="text-sm text-gray-500 hover:underline">Clear</button>
    </div>
  );
};

export default BulkOperations;
