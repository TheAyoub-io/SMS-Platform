import api from './api';
import { ContactFormInputs } from '../components/contacts/ContactForm';

export interface Contact {
  id_contact: number;
  nom: string;
  prenom: string;
  numero_telephone: string;
  email: string | null;
  statut_opt_in: boolean;
  segment: string | null;
  zone_geographique: string | null;
  type_client: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactFilters {
  segments?: string[];
  zone_geographique?: string;
  statut_opt_in?: boolean;
}

export interface Pagination {
  skip?: number;
  limit?: number;
}

export const getContacts = async ({ filters, pagination }: { filters: ContactFilters, pagination: Pagination }): Promise<Contact[]> => {
  const params = new URLSearchParams();

  if (pagination.skip) params.append('skip', pagination.skip.toString());
  if (pagination.limit) params.append('limit', pagination.limit.toString());

  if (filters.segments && filters.segments.length > 0) {
    params.append('segments', filters.segments.join(','));
  }
  if (filters.zone_geographique) {
    params.append('zone_geographique', filters.zone_geographique);
  }
  if (filters.statut_opt_in !== undefined) {
    params.append('statut_opt_in', String(filters.statut_opt_in));
  }

  const response = await api.get<Contact[]>('/contacts/', { params });
  return response.data;
};

export const getContactSegments = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/contacts/segments');
  return response.data;
};

export const createContact = async (payload: ContactFormInputs): Promise<Contact> => {
    const response = await api.post<Contact>('/contacts/', payload);
    return response.data;
}

export const updateContact = async ({ id, payload }: { id: number, payload: ContactFormInputs }): Promise<Contact> => {
    const response = await api.put<Contact>(`/contacts/${id}`, payload);
    return response.data;
}

export interface BulkOptInPayload {
    contact_ids: number[];
    opt_in_status: boolean;
}

export const bulkUpdateOptStatus = async (payload: BulkOptInPayload): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/contacts/bulk-opt-status', payload);
    return response.data;
}
