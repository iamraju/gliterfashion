
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/authStore';
import { User, Package, MapPin, Heart, ArrowRight, Settings, ShoppingBag, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuthStore();

  const stats = [
    { label: 'Total Orders', value: '0', icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Saved Addresses', value: user?.addresses?.length || '0', icon: MapPin, color: 'bg-purple-50 text-purple-600' },
    { label: 'Wishlist Items', value: '0', icon: Heart, color: 'bg-red-50 text-red-600' },
    { label: 'Store Credit', value: 'रु. 0', icon: ShoppingBag, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50 py-12 lg:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">Hello, {user?.firstName}</h1>
              <p className="text-gray-500">Welcome back to your personal wardrobe hub.</p>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all shadow-sm"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Sidebar / Quick Links */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
                <nav className="space-y-1">
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-black text-white rounded-2xl text-sm font-bold transition-all">
                    <User size={18} />
                    Overview
                  </Link>
                  <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-2xl text-sm font-bold transition-all hover:text-black">
                    <Package size={18} />
                    My Orders
                  </Link>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-2xl text-sm font-bold transition-all hover:text-black">
                    <Settings size={18} />
                    Account Settings
                  </Link>
                  <Link to="/addresses" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-2xl text-sm font-bold transition-all hover:text-black">
                    <MapPin size={18} />
                    Saved Addresses
                  </Link>
                </nav>
              </div>

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
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100/50">
                    <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                      <stat.icon size={24} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Orders Placeholder */}
              <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-gray-200/30 border border-gray-100">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-serif font-bold">Recent Orders</h3>
                  <Link to="/orders" className="text-xs font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-2">
                    View All <ArrowRight size={14} />
                  </Link>
                </div>
                
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={32} className="text-gray-200" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">No orders yet</h4>
                  <p className="text-gray-400 max-w-xs mb-8">Ready to start your style journey? Browse our latest collections and find your perfect fit.</p>
                  <Link 
                    to="/products" 
                    className="bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-black/10 hover:bg-accent transition-all flex items-center gap-2 group"
                  >
                    Start Shopping
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Account Details Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/30 border border-gray-100">
                    <h4 className="text-lg font-serif font-bold mb-6 flex items-center gap-3">
                      <User size={20} className="text-accent" />
                      Personal Profile
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Full Name</p>
                        <p className="font-bold">{user?.firstName} {user?.lastName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email Address</p>
                        <p className="font-bold">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="inline-block text-xs font-bold uppercase tracking-widest text-accent mt-4">Edit Profile</Link>
                    </div>
                 </div>
                 <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/30 border border-gray-100">
                    <h4 className="text-lg font-serif font-bold mb-6 flex items-center gap-3">
                      <MapPin size={20} className="text-accent" />
                      Default Address
                    </h4>
                    {user?.addresses && user.addresses.length > 0 ? (
                      <div className="space-y-4">
                        <p className="font-medium text-gray-600 italic">
                          {user.addresses[0].addressLine1}, {user.addresses[0].city}
                        </p>
                        <Link to="/addresses" className="inline-block text-xs font-bold uppercase tracking-widest text-accent mt-4">Manage Addresses</Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-400">No addresses saved yet.</p>
                        <Link to="/addresses" className="bg-gray-50 text-gray-900 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest inline-block hover:bg-gray-100 transition-all">Add Address</Link>
                      </div>
                    )}
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
