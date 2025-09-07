import { useQuery } from 'react-query';
import { getTaskStatus, TaskStatus } from '../services/taskApi';

const TASK_STATUS_QUERY_KEY = 'taskStatus';

export const useTaskStatus = () => {
  return useQuery<TaskStatus, Error>(TASK_STATUS_QUERY_KEY, getTaskStatus, {
    refetchInterval: 5000, // Poll every 5 seconds
  });
};
