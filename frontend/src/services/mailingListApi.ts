import api from './api';

// Placeholder until we have a proper contact service/type
export interface Contact {
  id_contact: number;
  nom: string;
  prenom: string;
  numero_telephone: string;
}

export interface MailingList {
  id_liste: number;
  id_campagne: number;
  nom_liste: string;
  description: string | null;
  contacts: Contact[];
  created_at: string; // ISO 8601 date string
}

export const getMailingLists = async (): Promise<MailingList[]> => {
  const response = await api.get<MailingList[]>('/mailing-lists/');
  return response.data;
};

export interface MailingListCreationPayload {
  nom_liste: string;
  description?: string;
  id_campagne: number;
}

export const createMailingList = async (payload: MailingListCreationPayload): Promise<MailingList> => {
  const response = await api.post<MailingList>('/mailing-lists/', payload);
  return response.data;
};
