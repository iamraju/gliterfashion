import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl transition-colors", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn(
          "flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-lg",
          trend === 'up' ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
        )}>
          <span>{trendValue}</span>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
};

const DashboardHome: React.FC = () => {
  const stats = [
    { 
      title: 'Total Revenue', 
      value: '$128,430', 
      icon: DollarSign, 
      trend: 'up', 
      trendValue: '+12.5%',
      color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
    },
    { 
      title: 'Total Orders', 
      value: '2,845', 
      icon: ShoppingCart, 
      trend: 'up', 
      trendValue: '+8.2%',
      color: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
    },
    { 
      title: 'Active Products', 
      value: '1,420', 
      icon: Package, 
      trend: 'down', 
      trendValue: '-2.4%',
      color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
    },
    { 
      title: 'New Customers', 
      value: '450', 
      icon: Users, 
      trend: 'up', 
      trendValue: '+18.7%',
      color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-1">Good morning, here is what's happening today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Download Report
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Create Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm border-b border-gray-50 pb-4">
                  <th className="font-semibold text-gray-500 pb-4">Customer</th>
                  <th className="font-semibold text-gray-500 pb-4">Product</th>
                  <th className="font-semibold text-gray-500 pb-4">Amount</th>
                  <th className="font-semibold text-gray-500 pb-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                          JD
                        </div>
                        <span className="font-medium text-gray-900">John Doe</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-600">Premium Leather bag</td>
                    <td className="py-4 text-sm font-semibold text-gray-900">$240.00</td>
                    <td className="py-4 text-right">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600">
                        Delivered
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products Placeholder */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4 group">
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 leading-tight">Glittery Jacket</p>
                  <p className="text-xs text-gray-500">Luxury Collection</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">$450</p>
                  <p className="text-xs text-emerald-600">+12%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
