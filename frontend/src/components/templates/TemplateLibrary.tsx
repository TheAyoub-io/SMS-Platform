import React from 'react';
import { useTemplates } from '../../hooks/useTemplates';
import { MessageSquare, MoreVertical } from 'lucide-react';

const TemplateLibrary: React.FC = () => {
  const { data: templates, isLoading, isError } = useTemplates();

  if (isLoading) return <p>Loading templates...</p>;
  if (isError) return <p className="text-red-500">Error loading templates.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates?.map(template => (
        <div key={template.id_modele} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <MoreVertical size={16} />
              </button>
            </div>
            <h3 className="font-bold text-lg mt-2">{template.nom_modele}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">
              {template.contenu_modele}
            </p>
          </div>
          <div className="text-xs text-gray-400 mt-4">
            {/* Usage stats will go here */}
            <span>Used in 0 campaigns</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateLibrary;
