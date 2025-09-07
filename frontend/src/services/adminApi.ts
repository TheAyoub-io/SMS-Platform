import api from './api';
import { User } from './authService';

// This is the payload for creating a user, based on user_schema.UserCreate
export interface UserCreatePayload {
  nom_agent: string;
  identifiant: string;
  role: 'admin' | 'agent' | 'supervisor';
  password: string;
  is_active?: boolean;
}

// This is the payload for updating a user
export interface UserUpdatePayload extends Partial<Omit<UserCreatePayload, 'password'>> {}


export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/admin/users');
  return response.data;
};

export const createUser = async (payload: UserCreatePayload): Promise<User> => {
  const response = await api.post<User>('/admin/users', payload);
  return response.data;
};

export const updateUser = async ({ id, payload }: { id: number, payload: UserUpdatePayload }): Promise<User> => {
  const response = await api.put<User>(`/admin/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: number): Promise<User> => {
  const response = await api.delete<User>(`/admin/users/${id}`);
  return response.data;
};

export interface ActivityLog {
  id_log: number;
  user_id: number;
  action: string;
  table_affected: string | null;
  record_id: number | null;
  timestamp: string;
}

export const getAuditLogs = async (): Promise<ActivityLog[]> => {
    const response = await api.get<ActivityLog[]>('/admin/audit-trail');
    return response.data;
}

export interface HealthStatus {
    overall_status: 'ok' | 'error';
    checks: {
        status: 'ok' | 'error';
        service: string;
        details?: string;
    }[];
}

export const getHealthStatus = async (): Promise<HealthStatus> => {
    const response = await api.get<HealthStatus>('/health');
    return response.data;
}
