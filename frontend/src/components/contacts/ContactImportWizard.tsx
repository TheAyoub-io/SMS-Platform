import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { X, UploadCloud, File as FileIcon } from 'lucide-react';

interface ContactImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactImportWizard: React.FC<ContactImportWizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      // Parse headers to prepare for column mapping
      Papa.parse(uploadedFile, {
        header: true,
        preview: 1, // Only parse the first row to get headers
        complete: (results) => {
          setHeaders(results.meta.fields || []);
          setStep(2); // Move to column mapping
        },
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Import Contacts (Step {step})</h2>
          <button onClick={onClose}><X/></button>
        </div>
        <div className="p-6">
          {step === 1 && (
            <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">Drag & drop a CSV file here, or click to select a file</p>
              {file && <p className="mt-2 text-sm text-gray-500"><FileIcon className="inline mr-1" />{file.name}</p>}
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="font-medium text-lg mb-4">Map Columns</h3>
              <p className="text-sm text-gray-500 mb-4">Match the columns from your file to the required contact fields.</p>
              <div className="space-y-2">
                {headers.map(header => (
                  <div key={header} className="flex items-center justify-between">
                    <span>{header}</span>
                    {/* Placeholder for select mapping */}
                    <select className="p-1 border rounded-md"><option>Select Field</option></select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactImportWizard;
