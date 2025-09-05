import { apiService } from './api';
import { Campaign } from '../pages/CampaignsPage';

export interface CampaignData {
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  template_id?: number;
  custom_message?: string;
  mailing_list_ids: number[];
}

export const campaignApi = {
  getCampaigns: (params?: object) =>
    apiService.get<{ data: Campaign[] }>('/campaigns', params),

  getCampaign: (id: number) =>
    apiService.get<Campaign>(`/campaigns/${id}`),

  createCampaign: (data: CampaignData) =>
    apiService.post<Campaign>('/campaigns', data),

  updateCampaign: (id: number, data: Partial<CampaignData>) =>
    apiService.put<Campaign>(`/campaigns/${id}`, data),

  deleteCampaign: (id: number) =>
    apiService.delete(`/campaigns/${id}`),

  launchCampaign: (id: number) =>
    apiService.post(`/campaigns/${id}/launch`, {}),

  pauseCampaign: (id: number) =>
    apiService.post(`/campaigns/${id}/pause`, {}),

  resumeCampaign: (id: number) =>
    apiService.post(`/campaigns/${id}/resume`, {}),

  getCampaignAnalytics: (id: number) =>
    apiService.get(`/campaigns/${id}/analytics`),
};
