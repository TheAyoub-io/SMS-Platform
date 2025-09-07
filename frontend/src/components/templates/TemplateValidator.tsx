import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const AVAILABLE_VARIABLE_KEYS = ['prenom', 'nom', 'segment', 'zone_geographique'];

interface TemplateValidatorProps {
  content: string;
}

const TemplateValidator: React.FC<TemplateValidatorProps> = ({ content }) => {
  const validations = useMemo(() => {
    const issues = [];

    // Check for unmatched brackets
    if ((content.match(/{/g) || []).length !== (content.match(/}/g) || []).length) {
      issues.push({ type: 'error', message: 'Unmatched curly braces found.' });
    }

    // Check for unknown variables
    const variables = content.match(/{[a-zA-Z_]+}/g) || [];
    for (const variable of variables) {
      const key = variable.replace(/[{}]/g, '');
      if (!AVAILABLE_VARIABLE_KEYS.includes(key)) {
        issues.push({ type: 'warning', message: `Unknown variable: ${variable}` });
      }
    }

    // SMS Length Warning
    if (content.length > 160) {
        issues.push({ type: 'warning', message: 'Message is longer than 160 characters and may be split into multiple SMS.' });
    }

    return issues;
  }, [content]);

  if (validations.length === 0) {
    return (
      <div className="mt-4 p-2 flex items-center text-sm text-green-700 bg-green-100 rounded-md">
        <CheckCircle size={16} className="mr-2" />
        All checks passed!
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {validations.map((issue, index) => (
        <div key={index} className={`p-2 flex items-center text-sm rounded-md ${issue.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
          <AlertTriangle size={16} className="mr-2" />
          {issue.message}
        </div>
      ))}
    </div>
  );
};

export default TemplateValidator;
