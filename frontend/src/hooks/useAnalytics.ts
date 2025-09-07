import { useQuery } from 'react-query';
import {
  getCampaignRoi,
  getTrends,
  getSegmentPerformance,
} from '../services/analyticsApi';

export const useCampaignRoi = (campaignId: number) => {
  return useQuery(['roi', campaignId], () => getCampaignRoi(campaignId));
};

export const useTrends = () => {
  return useQuery('trends', getTrends);
};

export const useSegmentPerformance = () => {
  return useQuery('segmentPerformance', getSegmentPerformance);
};
