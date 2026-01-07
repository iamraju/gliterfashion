import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  Edit,
  Trash2,
  Ticket,
  Percent,
  CircleDollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { couponsApi, type Coupon, CouponType } from '../../api/coupons';

const Promotions: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const data = await couponsApi.getAll();
      setCoupons(data);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await couponsApi.delete(id);
        setCoupons(prev => prev.filter(c => c.id !== id));
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete coupon');
      }
    }
  };

  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-sm text-gray-500">Manage discounts and coupon codes</p>
        </div>
        <Link
          to="/promotions/new"
          className="inline-flex items-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Promotion
        </Link>
      </div>

      {/* Stats/Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Coupons</p>
            <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Coupons</p>
            <p className="text-2xl font-bold text-gray-900">{coupons.filter(c => c.isActive).length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
            <p className="text-2xl font-bold text-gray-900">
                {coupons.filter(c => {
                    const expiry = new Date(c.expiresAt);
                    const now = new Date();
                    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return diffDays > 0 && diffDays <= 7;
                }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
          />
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 font-bold text-gray-900">Coupon</th>
                <th className="px-6 py-4 font-bold text-gray-900">Value</th>
                <th className="px-6 py-4 font-bold text-gray-900">Period</th>
                <th className="px-6 py-4 font-bold text-gray-900">Usage</th>
                <th className="px-6 py-4 font-bold text-gray-900">Status</th>
                <th className="px-6 py-4 text-right font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                      Loading promotions...
                    </div>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No promotions found.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg font-mono font-bold">
                          {coupon.code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-900 font-medium">
                        {coupon.type === CouponType.PERCENTAGE ? (
                          <><Percent className="w-4 h-4 mr-1 text-blue-500" /> {Number(coupon.value)}% Off</>
                        ) : (
                          <><CircleDollarSign className="w-4 h-4 mr-1 text-green-500" /> रु. {Number(coupon.value).toLocaleString()} Off</>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p className="flex items-center font-medium text-gray-700">
                           {new Date(coupon.startsAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400">to</p>
                        <p className="flex items-center font-medium text-gray-700">
                           {new Date(coupon.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center space-x-1.5 font-medium">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{coupon.usageCount} / {coupon.usageLimit || '∞'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        coupon.isActive 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/promotions/edit/${coupon.id}`}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-brand-primary transition-all border border-transparent hover:border-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-gray-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default Promotions;
