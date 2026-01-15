
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import Layout from '../layout/Layout';
import { User, Package, MapPin, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface ProfileLayoutProps {
  children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'My Orders', path: '/profile/orders', icon: Package },
    { label: 'Addresses', path: '/profile/addresses', icon: MapPin },
  ];

  return (
    <Layout>
      <div className="bg-gray-50/50 min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-80">
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white text-2xl font-serif font-bold italic">
                    {user?.firstName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-xl">{user?.firstName} {user?.lastName}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/profile'}
                      className={({ isActive }) =>
                        `flex items-center justify-between p-4 rounded-2xl transition-all ${
                          isActive
                            ? 'bg-black text-white shadow-lg shadow-black/10'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span className="font-bold text-sm tracking-wide uppercase">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className="opacity-50" />
                    </NavLink>
                  ))}
                  
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all text-sm font-bold tracking-wide uppercase mt-4"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 md:p-12 shadow-sm min-h-[600px]">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileLayout;
