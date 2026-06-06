import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Optimistic check: If we have tokens in localStorage, we can show the UI
  // while the background verification (isLoading) completes.
  const hasPersistentSession = !!localStorage.getItem('auth_token') && !!localStorage.getItem('auth_user');

  if (isLoading && !hasPersistentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  if (!isLoading && !isAuthenticated) {
    console.log('[ProtectedRoute] Redirecting to login: isLoading is false and isAuthenticated is false');
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
