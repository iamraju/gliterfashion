import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  ChevronDown,
  User as UserIcon,
  Shield,
  Key,
  FolderTree,
  Tag,
  Ticket
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ isOpen, toggle, logout, user }: { isOpen: boolean; toggle: () => void; logout: () => void; user: any }) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: FolderTree, label: 'Categories', path: '/categories' },
    { icon: Tag, label: 'Attributes', path: '/attributes' },
    { icon: Ticket, label: 'Promotions', path: '/promotions' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: Users, label: 'Users', path: '/users', adminOnly: true },
    { icon: ShoppingCart, label: 'Customers', path: '/customers' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || user?.role === 'SUPER_ADMIN');

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggle}
      />
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 w-72 bg-brand-dark border-r border-white/5 z-50 transition-transform duration-300 transform lg:translate-x-0 outline-none",
        !isOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-8 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
                <Package className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {import.meta.env.VITE_APP_NAME || 'Glitter Admin'}
              </span>
            </Link>
            <button onClick={toggle} className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 space-y-2 mt-4 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-white/10 text-brand-primary" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive ? "text-brand-primary" : "text-gray-500"
                  )} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="p-6 border-t border-white/5">
            <button 
              onClick={logout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ toggleSidebar, user, logout }: { toggleSidebar: () => void; user: any; logout: () => void }) => {
  return (
    <header className="h-20 bg-brand-dark sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-lg shadow-black/20">
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:bg-white/10 rounded-lg lg:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative hidden md:block w-72 lg:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search products, orders..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border-transparent border border-white/10 focus:bg-white/10 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10 rounded-xl outline-none transition-all text-sm text-white placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 lg:space-x-6">
        <button className="p-2 text-gray-400 hover:bg-white/10 rounded-xl relative transition-all group">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        
        <div className="h-8 w-px bg-white/10 hidden sm:block" />

        <div className="relative group">
          <button className="flex items-center space-x-3 p-1.5 hover:bg-white/10 rounded-xl transition-all">
            <div className="w-9 h-9 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-brand-primary/10">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-white leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase() || 'User'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform" />
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 z-50">
            <div className="px-4 py-3 border-b border-gray-50 mb-1">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            
            <Link 
              to="/profile" 
              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-brand-light hover:text-brand-primary transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              <span className="font-medium">My Profile</span>
            </Link>
            
            <Link 
              to="/profile/edit" 
              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-brand-light hover:text-brand-primary transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="font-medium">Update Info</span>
            </Link>

            <Link 
              to="/profile/change-password" 
              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-brand-light hover:text-brand-primary transition-colors"
            >
              <Key className="w-4 h-4" />
              <span className="font-medium">Change Password</span>
            </Link>

            <div className="h-px bg-gray-50 my-1" />
            
            <button 
              onClick={logout}
              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} logout={logout} user={user} />
      
      <main className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} user={user} logout={logout} />
        <div className="p-4 lg:p-8 flex-1">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};


export default AdminLayout;
