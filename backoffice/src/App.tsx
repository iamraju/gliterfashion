import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardHome from './pages/dashboard/DashboardHome';
import UsersPage from './pages/dashboard/Users';
import Profile from './pages/profile/Profile';
import UpdateProfile from './pages/profile/UpdateProfile';
import ChangePassword from './pages/profile/ChangePassword';
import CategoriesPage from './pages/dashboard/Categories';
import AttributesPage from './pages/dashboard/Attributes';
import ProductsPage from './pages/dashboard/Products';
import ProductForm from './pages/dashboard/ProductForm';
import PromotionsPage from './pages/dashboard/Promotions';
import PromotionForm from './pages/dashboard/PromotionForm';
import OrdersPage from './pages/dashboard/Orders';
import OrderDetails from './pages/dashboard/OrderDetails';
import CustomersPage from './pages/dashboard/Customers';
import CustomerDetails from './pages/dashboard/CustomerDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route index element={<Navigate to="/auth/login" replace />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="attributes" element={<AttributesPage />} />
              <Route path="profile">
                <Route index element={<Profile />} />
                <Route path="edit" element={<UpdateProfile />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="promotions" element={<PromotionsPage />} />
              <Route path="promotions/new" element={<PromotionForm />} />
              <Route path="promotions/edit/:id" element={<PromotionForm />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="settings" element={<div className="p-8"><h2 className="text-2xl font-bold">Settings Page</h2><p className="mt-4 text-gray-500">Feature coming soon...</p></div>} />
            </Route>
          </Route>

          {/* Catch all - Redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
