import { useQuery, useMutation, useQueryClient } from 'react-query';
import { campaignApi, CampaignData } from '../services/campaignApi';
import { toast } from 'react-hot-toast';

export const useCampaigns = (params?: object) => {
  return useQuery(['campaigns', params], () => campaignApi.getCampaigns(params), {
    select: (data) => data.data,
  });
};

export const useCampaign = (id: number) => {
  return useQuery(['campaigns', id], () => campaignApi.getCampaign(id), {
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(campaignApi.createCampaign, {
    onSuccess: () => {
      queryClient.invalidateQueries('campaigns');
      toast.success('Campaign created successfully!');
    },
    onError: () => {
      toast.error('Failed to create campaign.');
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { id: number; campaignData: Partial<CampaignData> }) =>
      campaignApi.updateCampaign(data.id, data.campaignData),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('campaigns');
        queryClient.invalidateQueries(['campaigns', variables.id]);
        toast.success('Campaign updated successfully!');
      },
      onError: () => {
        toast.error('Failed to update campaign.');
      },
    }
  );
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation(campaignApi.deleteCampaign, {
    onSuccess: () => {
      queryClient.invalidateQueries('campaigns');
      toast.success('Campaign deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete campaign.');
    },
  });
};

export const useLaunchCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation(campaignApi.launchCampaign, {
        onSuccess: () => {
            queryClient.invalidateQueries('campaigns');
            toast.success('Campaign launched successfully!');
        },
        onError: () => {
            toast.error('Failed to launch campaign.');
        },
    });
};

export const usePauseCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation(campaignApi.pauseCampaign, {
        onSuccess: () => {
            queryClient.invalidateQueries('campaigns');
            toast.success('Campaign paused successfully!');
        },
        onError: () => {
            toast.error('Failed to pause campaign.');
        },
    });
};

export const useResumeCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation(campaignApi.resumeCampaign, {
        onSuccess: () => {
            queryClient.invalidateQueries('campaigns');
            toast.success('Campaign resumed successfully!');
        },
        onError: () => {
            toast.error('Failed to resume campaign.');
        },
    });
};

export const useCampaignAnalytics = (id: number) => {
    return useQuery(['campaignAnalytics', id], () => campaignApi.getCampaignAnalytics(id), {
        enabled: !!id,
    });
};
