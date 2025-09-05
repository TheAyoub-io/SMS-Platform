import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';

// Placeholder pages for other routes
const CampaignsPage = () => <div>Campaigns Page</div>;
const ContactsPage = () => <div>Contacts Page</div>;
const UsersPage = () => <div>Users Page</div>;
const SettingsPage = () => <div>Settings Page</div>;

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'campaigns',
            element: <CampaignsPage />,
          },
          {
            path: 'contacts',
            element: <ContactsPage />,
          },
          {
            path: 'users',
            element: <ProtectedRoute allowedRoles={['admin']} />,
            children: [
              {
                path: '',
                element: <UsersPage />,
              },
            ],
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: '',
            element: <Navigate to="/dashboard" replace />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
