import api from './api';

export interface TaskStatus {
  stats: any;
  active_tasks: any;
  scheduled_tasks: any;
}

export const getTaskStatus = async (): Promise<TaskStatus> => {
  const response = await api.get<TaskStatus>('/tasks/status');
  return response.data;
};
