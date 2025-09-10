import { useQuery } from 'react-query';
import { getSMSQueue, SMSQueueItem } from '../services/queueApi';

const QUEUE_QUERY_KEY = 'smsQueue';

export const useSMSQueue = () => {
  return useQuery<SMSQueueItem[], Error>(QUEUE_QUERY_KEY, getSMSQueue);
};
