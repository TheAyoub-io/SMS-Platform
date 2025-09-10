import api from './api';

export interface SMSQueueItem {
  id: number;
  campaign_id: number;
  contact_id: number;
  message_content: string;
  scheduled_at: string;
  status: string;
  attempts: number;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export const getSMSQueue = async (): Promise<SMSQueueItem[]> => {
  const response = await api.get<SMSQueueItem[]>('/queue/sms');
  return response.data;
};
