import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import ContactsPage from './pages/ContactsPage';
import MailingListsPage from './pages/MailingListsPage';
import NewCampaignPage from './pages/NewCampaignPage';
import NewContactPage from './pages/NewContactPage';
import NewMailingListPage from './pages/NewMailingListPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Layout from './components/layout/Layout';
import { useAuth } from './hooks/useAuth';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function App() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading application...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/mailing-lists" element={<MailingListsPage />} />

              <Route element={<AdminProtectedRoute />}>
                <Route path="/campaigns/new" element={<NewCampaignPage />} />
                <Route path="/contacts/new" element={<NewContactPage />} />
                <Route path="/mailing-lists/new" element={<NewMailingListPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
