import { useQuery } from 'react-query';
import { getTemplates, Template } from '../services/templateApi';

const TEMPLATES_QUERY_KEY = 'templates';

export const useTemplates = () => {
  return useQuery<Template[], Error>(TEMPLATES_QUERY_KEY, getTemplates);
};
