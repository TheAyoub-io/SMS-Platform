import React from 'react';
import { useContactSegments } from '../../hooks/useContacts';
import { ContactFilters as IContactFilters } from '../../services/contactApi';

interface ContactFiltersProps {
  filters: Partial<IContactFilters>;
  onFilterChange: (filters: Partial<IContactFilters>) => void;
}

const ContactFilters: React.FC<ContactFiltersProps> = ({ filters, onFilterChange }) => {
  const { data: segments, isLoading: isLoadingSegments } = useContactSegments();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    // For multi-select, you would handle an array. Here we assume single select for simplicity.
    onFilterChange({ ...filters, segments: value ? [value] : [] });
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
        <input
          type="text"
          id="search"
          name="search" // Will need to add search logic based on this
          placeholder="By name, email, phone..."
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="statut_opt_in" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opt-In Status</label>
        <select
          id="statut_opt_in"
          name="statut_opt_in"
          value={filters.statut_opt_in === undefined ? '' : String(filters.statut_opt_in)}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
        >
          <option value="">All</option>
          <option value="true">Opted-In</option>
          <option value="false">Opted-Out</option>
        </select>
      </div>
      <div>
        <label htmlFor="segments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Segment</label>
        <select
          id="segments"
          name="segments"
          value={filters.segments?.[0] || ''}
          onChange={handleSegmentChange}
          disabled={isLoadingSegments}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
        >
          <option value="">All Segments</option>
          {segments?.map(segment => (
            <option key={segment} value={segment}>{segment}</option>
          ))}
        </select>
      </div>
      {/* Add more filters for zone, etc. later */}
    </div>
  );
};

export default ContactFilters;
