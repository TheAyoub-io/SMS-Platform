import api from './api';

// Based on app/api/v1/schemas/campaign.py
export interface Campaign {
  id_campagne: number;
  id_agent: number;
  nom_campagne: string;
  date_debut: string; // ISO 8601 date string
  date_fin: string;   // ISO 8601 date string
  statut: 'draft' | 'scheduled' | 'active' | 'paused' | 'finished' | 'archived';
  type_campagne: string;
  id_modele: number | null;
  created_at: string;
  updated_at: string;
}

export const getCampaigns = async (): Promise<Campaign[]> => {
  const response = await api.get<Campaign[]>('/campaigns/');
  return response.data;
};

// Based on CampaignCreate schema in the backend
export interface CampaignCreationPayload {
  nom_campagne: string;
  date_debut: string;
  date_fin: string;
  statut: 'draft' | 'scheduled' | 'active' | 'paused' | 'finished' | 'archived';
  type_campagne: string;
  id_modele?: number | null;
}

export const createCampaign = async (campaignData: CampaignCreationPayload): Promise<Campaign> => {
  const response = await api.post<Campaign>('/campaigns/', campaignData);
  return response.data;
};

export const updateCampaign = async ({ id, payload }: { id: number, payload: Partial<CampaignCreationPayload> }): Promise<Campaign> => {
  const response = await api.put<Campaign>(`/campaigns/${id}`, payload);
  return response.data;
};

// This type is also defined in mailingListApi.ts, consider moving to a central types file later
export interface PreviewContact {
  contact_name: string;
  phone_number: string;
  personalized_message: string;
}

export interface CampaignPreviewResponse {
  preview_count: number;
  items: PreviewContact[];
}

export const previewCampaign = async (id: number): Promise<CampaignPreviewResponse> => {
  const response = await api.get<CampaignPreviewResponse>(`/campaigns/${id}/preview`);
  return response.data;
};

export interface LaunchResponse {
  success: boolean;
  message: string;
  queued_count: number;
}

export const launchCampaign = async (id: number): Promise<LaunchResponse> => {
  const response = await api.post<LaunchResponse>(`/campaigns/${id}/launch`);
  return response.data;
};

export interface CampaignStatus {
  total_messages: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
}

export const getCampaignStatus = async (id: number): Promise<CampaignStatus> => {
  const response = await api.get<CampaignStatus>(`/campaigns/${id}/status`);
  return response.data;
};

export const getCampaign = async (id: number): Promise<Campaign> => {
  const response = await api.get<Campaign>(`/campaigns/${id}`);
  return response.data;
}

export const pauseCampaign = async (id: number): Promise<Campaign> => {
  const response = await api.post<Campaign>(`/campaigns/${id}/pause`);
  return response.data;
}
