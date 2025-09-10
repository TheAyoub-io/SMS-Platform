import api from './api';

export interface Message {
  id_message: number;
  contenu: string;
  date_envoi: string;
  statut_livraison: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  identifiant_expediteur: string;
  external_message_id: string | null;
  error_message: string | null;
  cost: number | null;
  id_liste: number;
  id_contact: number;
  id_campagne: number;
  created_at: string;
}

export const getMessagesByCampaign = async (campaignId: number): Promise<Message[]> => {
  const response = await api.get<Message[]>(`/messages/campaign/${campaignId}`);
  return response.data;
};
