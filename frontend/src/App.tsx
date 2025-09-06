import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import ContactsPage from './pages/ContactsPage';
import MailingListsPage from './pages/MailingListsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { token } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/mailing-lists" element={<MailingListsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
