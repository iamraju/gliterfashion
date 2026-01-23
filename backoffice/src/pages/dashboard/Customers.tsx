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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Customer</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Join Date</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Orders</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center text-brand-primary font-bold shadow-sm">
                          {customer.firstName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{customer.firstName} {customer.lastName}</h4>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(customer.createdAt!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">
                      0 Items
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        to={`/customers/${customer.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-brand-primary hover:text-white transition-all text-gray-400"
                        title="View Details"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
