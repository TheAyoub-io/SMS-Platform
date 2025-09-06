import React, { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut } from 'lucide-react';

const Sidebar = () => {
  // In the future, navigation items will be rendered here based on user role
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">SMS Platform</h2>
      <nav>
        <ul>
          <li className="p-2 hover:bg-gray-700 rounded">Dashboard</li>
          <li className="p-2 hover:bg-gray-700 rounded">Campaigns</li>
          <li className="p-2 hover:bg-gray-700 rounded">Contacts</li>
          <li className="p-2 hover:bg-gray-700 rounded">Templates</li>
        </ul>
      </nav>
    </aside>
  );
};

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <header className="flex-1 flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div>
        {/* Can add breadcrumbs or page title here */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-900 dark:text-white">Welcome, {user?.sub}</span>
        <button
          onClick={logout}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
};


const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
