import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '../layout/Layout';
import ProfileSidebar from './ProfileSidebar';

import Breadcrumbs from '../common/Breadcrumbs';

import { useAuthStore } from '../../store/authStore';

interface ProfileLayoutProps {
  children: ReactNode;
  breadcrumbs?: { label: string; path?: string }[];
}

const ProfileLayout = ({ children, breadcrumbs }: ProfileLayoutProps) => {
  const { user } = useAuthStore();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50 py-12 lg:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">Hello, {user?.firstName}</h1>
              <p className="text-gray-500">Welcome back to your personal wardrobe hub.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-4">
               <ProfileSidebar />

               <div className="bg-accent/10 p-8 rounded-[32px] border border-accent/10 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Glitter Insider</p>
                  <h4 className="text-lg font-serif font-bold mb-4">You have 0 points</h4>
                  <Link to="/loyalty" className="text-xs font-black border-b-2 border-accent pb-1 flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Rewards <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-10">
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
