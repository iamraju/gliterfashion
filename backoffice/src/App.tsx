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
import OrderInvoice from './pages/dashboard/OrderInvoice';
import CustomersPage from './pages/dashboard/Customers';
import CustomerDetails from './pages/dashboard/CustomerDetails';
import Brands from './pages/dashboard/Brands';
import BrandForm from './pages/dashboard/BrandForm';
import ShippingMethods from './pages/dashboard/settings/ShippingMethods';
import ShippingMethodForm from './pages/dashboard/settings/ShippingMethodForm';
import PaymentMethods from './pages/dashboard/settings/PaymentMethods';
import PaymentMethodForm from './pages/dashboard/settings/PaymentMethodForm';
import Settings from './pages/dashboard/Settings';
import PagesManager from './pages/dashboard/Pages';
import PageForm from './pages/dashboard/PageForm';
import Faqs from './pages/dashboard/Faqs';
import FaqForm from './pages/dashboard/FaqForm';
import Testimonials from './pages/dashboard/Testimonials';
import TestimonialForm from './pages/dashboard/TestimonialForm';
import Banners from './pages/dashboard/Banners';
import BannerForm from './pages/dashboard/BannerForm';
import ContactSubmissions from './pages/dashboard/ContactSubmissions';

function App() {
  return (
    <AuthProvider>
      <Router basename='/backoffice'>
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
              <Route path="pages" element={<PagesManager />} />
              <Route path="pages/new" element={<PageForm />} />
              <Route path="pages/edit/:id" element={<PageForm />} />
              <Route path="banners" element={<Banners />} />
              <Route path="banners/new" element={<BannerForm />} />
              <Route path="banners/:id" element={<BannerForm />} />

              <Route path="pages/new" element={<PageForm />} />
              <Route path="pages/edit/:id" element={<PageForm />} />
              <Route path="faqs" element={<Faqs />} />
              <Route path="faqs/new" element={<FaqForm />} />
              <Route path="faqs/edit/:id" element={<FaqForm />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="testimonials/new" element={<TestimonialForm />} />
              <Route path="testimonials/edit/:id" element={<TestimonialForm />} />
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
              <Route path="orders/:id/invoice" element={<OrderInvoice />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="contact-submissions" element={<ContactSubmissions />} />
              <Route path="brands" element={<Brands />} />
              <Route path="brands/new" element={<BrandForm />} />
              <Route path="brands/:id" element={<BrandForm />} />
              <Route path="settings">
                <Route index element={<Settings />} />
                <Route path="shipping-methods" element={<ShippingMethods />} />
                <Route path="shipping-methods/new" element={<ShippingMethodForm />} />
                <Route path="shipping-methods/:id" element={<ShippingMethodForm />} />
                <Route path="payment-methods" element={<PaymentMethods />} />
                <Route path="payment-methods/new" element={<PaymentMethodForm />} />
                <Route path="payment-methods/:id" element={<PaymentMethodForm />} />
              </Route>
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
