import api from './api';

// Define types for the mock data
export interface RoiData {
  campaign_id: number;
  cost: number;
  revenue: number;
  roi_percent: number;
}

export interface TrendData {
  week_over_week_change: number;
  month_over_month_change: number;
  last_updated: string;
}

export interface SegmentPerformance {
  [segmentName: string]: number;
}

export const getCampaignRoi = async (campaignId: number): Promise<RoiData> => {
  const response = await api.get(`/analytics/roi/${campaignId}`);
  return response.data;
};

export const getTrends = async (): Promise<TrendData> => {
  const response = await api.get('/analytics/trends');
  return response.data;
};

export const getSegmentPerformance = async (): Promise<SegmentPerformance> => {
  const response = await api.get('/analytics/segment-performance');
  return response.data;
};
