import { NavLink } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ChevronRight, LayoutGrid } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const ProfileSidebar = () => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutGrid },
    { label: 'My Orders', path: '/profile/orders', icon: Package },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Addresses', path: '/profile/addresses', icon: MapPin },
  ];

  return (
    <div className="bg-white p-6 lg:p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white text-2xl font-serif font-bold italic shadow-lg shadow-black/20">
          {user?.firstName?.charAt(0)}
        </div>
        <div className="overflow-hidden">
          <h2 className="font-serif font-bold text-xl truncate">{user?.firstName} {user?.lastName}</h2>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard' || item.path === '/profile'}
            className={({ isActive }) =>
              `flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? 'bg-black text-white shadow-lg shadow-black/10'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-black'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className="transition-transform group-hover:scale-110" />
              <span className="font-bold text-sm tracking-wide uppercase">{item.label}</span>
            </div>
            <ChevronRight size={16} className={`transition-all ${item.path === location.pathname ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
          </NavLink>
        ))}
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all text-sm font-bold tracking-wide uppercase mt-6 border border-transparent hover:border-red-100"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default ProfileSidebar;
