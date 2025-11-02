import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  LogOut, 
  DollarSign,
  Crown
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <DollarSign className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">FinanceSaaS</h1>
          </div>

          {/* Subscription Status */}
          <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-900 capitalize">
                {user?.subscription?.plan || 'Free'} Plan
              </span>
            </div>
            {user?.subscription?.status === 'free_trial' && (
              <p className="text-xs text-primary-700">
                {user?.transactionCount || 0}/50 transactions used
              </p>
            )}
            <Link 
              to="/pricing" 
              className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block"
            >
              Upgrade Plan →
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

