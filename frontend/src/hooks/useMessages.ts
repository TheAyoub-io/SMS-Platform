import { useQuery } from 'react-query';
import { getMessagesByCampaign, Message } from '../services/messageApi';

const MESSAGES_QUERY_KEY = 'messages';

export const useMessagesByCampaign = (campaignId: number) => {
  return useQuery<Message[], Error>(
    [MESSAGES_QUERY_KEY, campaignId],
    () => getMessagesByCampaign(campaignId),
    {
      enabled: !!campaignId, // Only run the query if campaignId is truthy
    }
  );
};
