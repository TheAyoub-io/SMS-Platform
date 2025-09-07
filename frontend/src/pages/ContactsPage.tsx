import React, { useState } from 'react';
import ContactList from '../components/contacts/ContactList';
import ContactFilters from '../components/contacts/ContactFilters';
import { useContacts, useCreateContact } from '../hooks/useContacts';
import { Plus, Upload, X } from 'lucide-react';
import { ContactFilters as IContactFilters, Contact } from '../services/contactApi';
import ContactForm, { ContactFormInputs } from '../components/contacts/ContactForm';
import ContactImportWizard from '../components/contacts/ContactImportWizard';
import BulkOperations from '../components/contacts/BulkOperations';

const PAGE_SIZE = 15;

const ContactsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Partial<IContactFilters>>({});
  const [isAddContactModalOpen, setAddContactModalOpen] = useState(false);
  const [isImportWizardOpen, setImportWizardOpen] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);

  const createContactMutation = useCreateContact();

  const { data: contacts, isLoading, isError, isPreviousData } = useContacts(filters, {
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  const handleFilterChange = (newFilters: Partial<IContactFilters>) => {
    setPage(0);
    setFilters(newFilters);
  }

  const handleCreateContact = (data: ContactFormInputs) => {
    createContactMutation.mutate(data, {
      onSuccess: () => setAddContactModalOpen(false),
    });
  };

  return (
    <div className="flex h-full">
      <aside className="w-1/4 p-4 border-r dark:border-gray-700 h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <ContactFilters filters={filters} onFilterChange={handleFilterChange} />
      </aside>

      <main className="w-3/4 p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Contact Database</h1>
          <div>
            <button onClick={() => setImportWizardOpen(true)} className="inline-flex items-center px-4 py-2 mr-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">
              <Upload size={20} className="mr-2" />
              Import Contacts
            </button>
            <button onClick={() => setAddContactModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
              <Plus size={20} className="mr-2" />
              Add Contact
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ContactList
            contacts={contacts || []}
            isLoading={isLoading}
            isError={isError}
            onSelectionChange={setSelectedContactIds}
          />
        </div>

        <div className="mt-4 flex justify-between items-center">
          {/* Pagination controls */}
        </div>
      </main>

      {isAddContactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold">Add New Contact</h3>
               <button onClick={() => setAddContactModalOpen(false)}><X/></button>
             </div>
             <ContactForm
               onSubmit={handleCreateContact}
               isSubmitting={createContactMutation.isLoading}
             />
          </div>
        </div>
      )}

      <ContactImportWizard
        isOpen={isImportWizardOpen}
        onClose={() => setImportWizardOpen(false)}
      />

      <BulkOperations
        selectedIds={selectedContactIds}
        onClearSelection={() => setSelectedContactIds([])}
      />
    </div>
  );
};

export default ContactsPage;
