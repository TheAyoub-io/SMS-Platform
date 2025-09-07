import React from 'react';

const AVAILABLE_VARIABLES = [
  { name: 'First Name', value: '{prenom}' },
  { name: 'Last Name', value: '{nom}' },
  { name: 'Segment', value: '{segment}' },
  { name: 'Zone', value: '{zone_geographique}' },
];

interface VariableInserterProps {
  onInsert: (variable: string) => void;
}

const VariableInserter: React.FC<VariableInserterProps> = ({ onInsert }) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
      <span className="text-sm font-medium self-center mr-2">Insert Variable:</span>
      {AVAILABLE_VARIABLES.map(variable => (
        <button
          key={variable.name}
          onClick={() => onInsert(variable.value)}
          className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-mono rounded-md hover:bg-blue-300"
        >
          {variable.name}
        </button>
      ))}
    </div>
  );
};

export default VariableInserter;
