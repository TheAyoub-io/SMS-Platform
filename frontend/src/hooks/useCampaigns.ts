import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  previewCampaign,
  launchCampaign,
  getCampaignStatus,
  getCampaign,
  pauseCampaign,
  Campaign,
  CampaignCreationPayload
} from '../services/campaignApi';
import toast from 'react-hot-toast';


const CAMPAIGNS_QUERY_KEY = 'campaigns';

export const useCampaigns = () => {
  return useQuery<Campaign[], Error>(CAMPAIGNS_QUERY_KEY, getCampaigns);
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(createCampaign, {
    onSuccess: () => {
      queryClient.invalidateQueries(CAMPAIGNS_QUERY_KEY);
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCampaign, {
    onSuccess: () => {
      queryClient.invalidateQueries(CAMPAIGNS_QUERY_KEY);
    },
  });
};

export const usePreviewCampaign = (id: number) => {
    return useQuery(['campaignPreview', id], () => previewCampaign(id), {
        enabled: false,
        retry: false,
    });
}

export const useLaunchCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation(launchCampaign, {
        onSuccess: (data) => {
            queryClient.invalidateQueries(CAMPAIGNS_QUERY_KEY);
            toast.success(data.message || 'Campaign launched successfully!');
        },
        onError: (error: Error) => {
            toast.error(`Failed to launch campaign: ${error.message}`);
        },
    });
}

export const useCampaignStatus = (id: number, options: { enabled: boolean }) => {
    return useQuery(['campaignStatus', id], () => getCampaignStatus(id), {
        enabled: options.enabled,
        refetchInterval: options.enabled ? 5000 : false,
    });
}

export const useCampaign = (id: number) => {
    return useQuery<Campaign, Error>(['campaign', id], () => getCampaign(id));
}

export const usePauseCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation(pauseCampaign, {
        onSuccess: (data) => {
            queryClient.invalidateQueries(CAMPAIGNS_QUERY_KEY);
            queryClient.invalidateQueries(['campaign', data.id_campagne]);
            toast.success('Campaign paused successfully!');
        },
        onError: (error: Error) => {
            toast.error(`Failed to pause campaign: ${error.message}`);
        },
    });
}
