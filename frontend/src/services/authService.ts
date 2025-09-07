// In a real app, login/logout functions from AuthContext might live here
// For now, we just use it to share the User type.

export interface User {
  id_agent: number;
  nom_agent: string;
  identifiant: string;
  role: 'admin' | 'agent' | 'supervisor';
  is_active: boolean;
}
