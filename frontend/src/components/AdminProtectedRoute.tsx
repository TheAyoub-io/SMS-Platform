import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminProtectedRoute: React.FC = () => {
  const { isAdmin, isSupervisor, isLoading, token } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (isAdmin || isSupervisor) ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminProtectedRoute;
