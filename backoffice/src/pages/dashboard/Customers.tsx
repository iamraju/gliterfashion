import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User as UserIcon, 
  Mail, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { customersApi, type Customer } from '../../api/customers';
import { Link } from 'react-router-dom';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage platform customers and their activity</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all border border-gray-200">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </button>
      </div>

      {/* Customers List/Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No customers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand-primary font-black text-xl shadow-lg shadow-brand-primary/10 group-hover:scale-110 transition-transform">
                    {customer.firstName.charAt(0)}
                  </div>
                  <Link 
                    to={`/customers/${customer.id}`}
                    className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-light rounded-xl transition-all"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                </div>
                
                <div className="space-y-1">
                   <h3 className="text-lg font-black text-gray-900 truncate">
                     {customer.firstName} {customer.lastName}
                   </h3>
                   <div className="flex items-center text-sm text-gray-500">
                     <Mail className="w-3.5 h-3.5 mr-1.5" />
                     {customer.email}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Join Date</span>
                      <span className="text-sm font-bold text-gray-700">
                        {new Date(customer.createdAt!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Total Orders</span>
                      <span className="text-sm font-bold text-gray-900">0 Items</span>
                   </div>
                </div>
              </div>
              
              <Link 
                to={`/customers/${customer.id}`}
                className="w-full py-4 bg-gray-50 text-brand-primary text-sm font-black flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-white transition-all border-t border-gray-100"
              >
                View Details
                <ChevronRight className="w-4 h-4 font-bold" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;
