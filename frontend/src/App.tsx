import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Layout from './components/layout/Layout';
import { Toaster } from 'react-hot-toast';

import DashboardPage from './pages/DashboardPage';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            {/* Add other protected routes here */}
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
