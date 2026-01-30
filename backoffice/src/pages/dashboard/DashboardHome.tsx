
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/backoffice';

// Helper for formatting currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0
  }).format(amount);
};

interface DashboardStats {
  totalOrders: number;
  totalSales: number;
  avgOrderValue: number;
  totalCustomers: number;
  dailySales: { date: string; sales: number }[];
  monthlySales: { month: string; sales: number }[];
}

const DashboardHome = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [statsRes, ordersRes] = await Promise.all([
                axios.get(`${API_URL}/orders/stats`, config),
                axios.get(`${API_URL}/orders`, config)
            ]);

            setStats(statsRes.data);
            setRecentOrders(ordersRes.data.slice(0, 5)); // Get first 5 only
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Overview of your store's performance.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                        <DollarSign />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Sales</p>
                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalSales || 0)}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                        <ShoppingBag />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                        <TrendingUp />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Avg. Order Value</p>
                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.avgOrderValue || 0)}</h3>
                    </div>
                </div>
                 {/* Placeholder for now */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                        <Users />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Customers</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Daily Sales Bar Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Sales (Last 7 Days)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.dailySales || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `Rs.${val}`} />
                                <Tooltip 
                                    cursor={{fill: '#f3f4f6'}}
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                                />
                                <Bar dataKey="sales" fill="#111827" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Sales Pie Chart */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Sales</h3>
                    <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.monthlySales || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="sales"
                                    nameKey="month"
                                >
                                    {(stats?.monthlySales || []).map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                    <Link to="/orders" className="text-sm font-bold text-brand-primary hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No orders found.</td></tr>
                            ) : (
                                recentOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6 font-bold text-gray-900">#{order.orderNumber}</td>
                                        <td className="p-6 text-gray-600">{order.guestEmail || 'Registered User'}</td>
                                        <td className="p-6 text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="p-6 font-bold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
