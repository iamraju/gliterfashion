import React from 'react';
import { User, Mail, Shield, Building2, MapPin, Globe, Calendar, Edit2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const infoItems = [
    { icon: User, label: 'First Name', value: user.firstName },
    { icon: User, label: 'Last Name', value: user.lastName },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Shield, label: 'Role', value: user.role, className: 'capitalize' },
  ];

  const sellerItems = user.role === 'SELLER' ? [
    { icon: Building2, label: 'Company Name', value: user.companyName },
    { icon: MapPin, label: 'Street Address', value: user.streetAddress || 'Not specified' },
    { icon: MapPin, label: 'City', value: user.city || 'Not specified' },
    { icon: Globe, label: 'Country', value: user.country || 'Not specified' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Profile Details</h1>
          <p className="text-gray-500 mt-1">Manage your account information and security settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/profile/edit"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-100"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
          <Link
            to="/profile/change-password"
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
          >
            <Lock className="w-4 h-4" />
            <span>Change Password</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-100 mb-6">
              {user.firstName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
            <p className="text-blue-600 font-medium mt-1 capitalize">{user.role.toLowerCase()}</p>
            
            <div className="w-full h-px bg-gray-100 my-6" />
            
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Joined
                </span>
                <span className="text-gray-900 font-medium">December 2023</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Status
                </span>
                <span className="px-2.5 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50">
              <h3 className="font-bold text-gray-900">Personal Information</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {infoItems.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </label>
                  <p className={`text-gray-900 font-medium ${item.className || ''}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {(user.role === 'SELLER' || user.companyName) && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50">
                <h3 className="font-bold text-gray-900">Company Details</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {sellerItems.map((item, index) => (
                  <div key={index} className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5" /> {item.label}
                    </label>
                    <p className="text-gray-900 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
