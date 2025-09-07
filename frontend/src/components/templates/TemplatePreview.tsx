import React from 'react';
import { useContacts } from '../../hooks/useContacts';
import { Smartphone } from 'lucide-react';

interface TemplatePreviewProps {
  templateContent: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ templateContent }) => {
  const { data: contacts, isLoading } = useContacts({}, { limit: 3 }); // Fetch 3 sample contacts

  const renderPreview = (contact: any) => {
    let personalizedMessage = templateContent;
    const variables = templateContent.match(/{[a-zA-Z_]+}/g) || [];

    variables.forEach(variable => {
      const key = variable.replace(/[{}]/g, '');
      const value = contact[key] || `[${key}]`; // Use contact data or a placeholder
      personalizedMessage = personalizedMessage.replace(variable, value);
    });

    return personalizedMessage;
  };

  return (
    <div className="mt-4 p-4 border-t">
      <h4 className="font-semibold mb-2">Live Preview</h4>
      <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-900 p-4 rounded-lg">
        <div className="relative w-64 h-[480px] bg-black rounded-3xl border-8 border-gray-800 shadow-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-800 rounded-b-lg"></div>
          <div className="p-4 text-white text-sm">
            {isLoading && <p>Loading preview...</p>}
            {contacts && contacts.length > 0 ? (
              renderPreview(contacts[0])
            ) : (
              <p>No contact data to show preview.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
