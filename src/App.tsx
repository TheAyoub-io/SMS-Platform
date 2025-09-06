import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, AuthContext } from './contexts/AuthContext';
import useAuth from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import DashboardPage from './pages/DashboardPage';

// Create a client
const queryClient = new QueryClient();

// A component to handle protected routes
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Optional: show a loading spinner while checking auth status
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  return children;
};


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        {/* Add other protected routes here, e.g. */}
                        {/* <Route path="/campaigns" element={<CampaignsPage />} /> */}
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        <Toaster position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
