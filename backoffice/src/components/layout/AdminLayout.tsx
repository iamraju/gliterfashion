import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  ChevronDown,
  ChevronRight,
  User as UserIcon,
  Shield,
  Key,
  FolderTree,
  Tag,
  Ticket,
  Truck,
  CreditCard,
  BookOpen,
  Settings,
  MessageSquare
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ isOpen, toggle, logout, user }: { isOpen: boolean; toggle: () => void; logout: () => void; user: any }) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const menuGroups = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      items: []
    },
    {
      title: 'Catalog',
      icon: Package,
      items: [
        { name: 'Categories', path: '/categories', icon: FolderTree },
        { name: 'Products', path: '/products', icon: Package },
        { name: 'Promotions', path: '/promotions', icon: Ticket },
        { name: 'Attributes', path: '/attributes', icon: Tag },
        { name: 'Brands', path: '/brands', icon: Ticket },
      ]
    },
    {
      title: 'Sales',
      icon: ShoppingCart,
      items: [
        { name: 'Orders', path: '/orders', icon: ShoppingCart }
      ]
    },
    {
      title: 'Contents',
      icon: BookOpen,
      items: [
        { name: 'Pages', path: '/pages', icon: BookOpen },
        { name: 'Banners', path: '/banners', icon: FolderTree }, // Using FolderTree/Image as placeholder
        { name: 'FAQs', path: '/faqs', icon: BookOpen },
        { name: 'Testimonials', path: '/testimonials', icon: Users },
      ]
    },
    {
      title: 'Customers',
      icon: Users,
      path: '/customers',
      items: []
    },
    {
      title: 'Contact Form',
      icon: MessageSquare,
      path: '/contact-submissions',
      items: []
    },
    {
      title: 'System',
      icon: Settings, 
      items: [
        { name: 'Settings', path: '/settings', icon: Settings },
        { name: 'Shipping Methods', path: '/settings/shipping-methods', icon: Truck },
        { name: 'Payment Methods', path: '/settings/payment-methods', icon: CreditCard }
      ]
    },
    {
      title: 'Users',
      icon: Users,
      path: '/users',
      items: [] // Admin only check might be needed here but user didn't specify strictly
    }
  ];

  // Set initial expanded group based on active route or default to Catalog
  React.useEffect(() => {
    const activeGroup = menuGroups.find(group => 
      group.items.some(item => isActive(item.path))
    );
    
    if (activeGroup) {
      setExpandedGroups(prev => prev.includes(activeGroup.title) ? prev : [...prev, activeGroup.title]);
    } else {
      // Default to Catalog if no other group is active and seemingly on first load/dashboard
      // checking if we are not in any specific sub-route that might be handled elsewise
      // But user asked simply: "expand by default Catalog menu"
      // We should only add it if it's not already there? Or just set it?
      // To behave consistently: if no active group found (e.g. dashboard home), expand Catalog?
      // Or simply ensure Catalog is expanded on mount if nothing else matches?
      // Let's just add 'Catalog' if no active group is determined from URL.
       setExpandedGroups(prev => {
           if (prev.length === 0) return ['Catalog'];
           return prev;
       });
    }
  }, [location.pathname]); // Re-run when path changes to auto-expand? User said "page is refreshed", implying mount.
  // If we assume user navigates within app, do we want auto-expand? "if a sub menu is clicked ... expand that menu group"
  // The user interaction expands it. The requirement "active sub menu... page refresh... expand" means on mount.
  // The "Expand by default Catalog" means on mount if nothing else.
  // So maybe `useEffect` with empty dependency or just rely on location check on mount?
  // UseEffect with [location.pathname] is safer to keep UI in sync with URL.


  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggle}
      />
      
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 w-72 bg-brand-dark border-r border-white/5 z-50 transition-transform duration-300 transform lg:translate-x-0 outline-none flex flex-col",
        !isOpen && "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src="/logo.png" alt="Glitter logo" className="h-14 w-auto object-contain" />
            </Link>
            <button onClick={toggle} className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-2">
              {group.items.length > 0 ? (
                <>
                  <button 
                    onClick={() => toggleGroup(group.title)}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                        expandedGroups.includes(group.title) || group.items.some(i => isActive(i.path))
                            ? "bg-white/10 text-brand-primary" 
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <group.icon className={cn(
                        "w-5 h-5 transition-transform group-hover:scale-110",
                        (expandedGroups.includes(group.title) || group.items.some(i => isActive(i.path))) ? "text-brand-primary" : "text-gray-500"
                      )} />
                      <span>{group.title}</span>
                    </div>
                    {expandedGroups.includes(group.title) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  
                  {expandedGroups.includes(group.title) && (
                    <div className="mt-1 ml-4 space-y-1 pl-3 border-l border-white/10">
                      {group.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-all duration-200",
                            isActive(item.path) 
                              ? "text-brand-primary font-medium bg-white/5" 
                              : "text-gray-500 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={group.path!}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                    isActive(group.path!) 
                      ? "bg-white/10 text-brand-primary" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <group.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive(group.path!) ? "text-brand-primary" : "text-gray-500"
                  )} />
                  <span className="font-medium">{group.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 shrink-0">
            <button 
              onClick={logout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
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
      <div className="print:hidden">
        <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} logout={logout} user={user} />
      </div>
      
      <main className="flex-1 lg:ml-72 flex flex-col min-w-0 print:ml-0">
        <div className="print:hidden">
          <Header toggleSidebar={toggleSidebar} user={user} logout={logout} />
        </div>
        <div className="p-4 lg:p-8 flex-1 print:p-0">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};


export default AdminLayout;
