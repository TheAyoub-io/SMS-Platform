import React, { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LogOut, LayoutDashboard, MessageSquare, List, Settings } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

interface LayoutProps {
  children?: ReactNode;
}

const Sidebar: React.FC = () => {
    const { logout, user } = useAuth();

    const navItems = [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/campaigns', icon: MessageSquare, label: 'Campaigns' },
      { to: '/lists', icon: List, label: 'Mailing Lists' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="flex flex-col h-full w-64 bg-gray-800 text-white">
            <div className="p-4 text-2xl font-bold border-b border-gray-700">
                SMS Platform
            </div>
            <nav className="flex-grow p-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 mt-2 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
                                isActive ? 'bg-gray-900 text-white' : ''
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="ml-4">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <div className="text-sm">Signed in as:</div>
                <div className="font-semibold">{user?.sub}</div>
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 mt-4 text-left text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="ml-4">Logout</span>
                </button>
            </div>
        </div>
    );
};


const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default Layout;
