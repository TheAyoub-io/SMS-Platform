import api from './api';

export interface Template {
  id_modele: number;
  nom_modele: str;
  contenu_modele: str;
  variables: Record<string, string> | null;
  created_by: number;
}

export const getTemplates = async (): Promise<Template[]> => {
  const response = await api.get<Template[]>('/templates/');
  return response.data;
};
