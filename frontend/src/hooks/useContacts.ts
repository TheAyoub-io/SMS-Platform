import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getContacts,
  getContactSegments,
  createContact,
  updateContact,
  bulkUpdateOptStatus,
  Contact,
  ContactFilters,
  Pagination
} from '../services/contactApi';
import toast from 'react-hot-toast';


const CONTACTS_QUERY_KEY = 'contacts';
const CONTACT_SEGMENTS_QUERY_KEY = 'contactSegments';

export const useContacts = (filters: ContactFilters, pagination: Pagination) => {
  return useQuery<Contact[], Error>(
    [CONTACTS_QUERY_KEY, filters, pagination],
    () => getContacts({ filters, pagination }),
    {
      keepPreviousData: true,
    }
  );
};

export const useContactSegments = () => {
  return useQuery<string[], Error>(CONTACT_SEGMENTS_QUERY_KEY, getContactSegments);
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation(createContact, {
    onSuccess: () => {
      queryClient.invalidateQueries(CONTACTS_QUERY_KEY);
      toast.success('Contact created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create contact: ${error.message}`);
    }
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation(updateContact, {
    onSuccess: () => {
      queryClient.invalidateQueries(CONTACTS_QUERY_KEY);
      toast.success('Contact updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update contact: ${error.message}`);
    }
  });
};

export const useBulkUpdateOptStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(bulkUpdateOptStatus, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(CONTACTS_QUERY_KEY);
      toast.success(data.message || 'Contacts updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update contacts: ${error.message}`);
    }
  });
};
