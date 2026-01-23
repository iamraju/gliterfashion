import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Categories from './pages/Categories';
import { About, Contact } from './pages/ContentPages';
import { useEffect } from 'react';
import { useCartStore } from './store/cartStore';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Auth from './pages/Auth';
import VerifyEmail from './pages/auth/VerifyEmail';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Account from './pages/profile/Account';
import Orders from './pages/profile/Orders';
import OrderDetails from './pages/profile/OrderDetails';
import Addresses from './pages/profile/Addresses';
import PageDetail from './pages/PageDetail';
import FaqPage from './pages/Faq';
import EsewaSuccess from './pages/EsewaSuccess';
import EsewaFailure from './pages/EsewaFailure';
import Wishlist from './pages/Wishlist';
import PayPalSuccess from './pages/PayPalSuccess';
import PayPalCancel from './pages/PayPalCancel';
import TestimonialsPage from './pages/TestimonialsPage';

import { Helmet } from 'react-helmet-async';


function App() {
  const appName = import.meta.env.VITE_APP_NAME || 'Glitter Fashion';
  const { initCart } = useCartStore();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initCart();
    initAuth();
  }, [initCart, initAuth]);

  return (
    <Router>
      <Toaster position="bottom-right" />
      <Helmet>
        <title>{appName} | Premium Fashion Store</title>
        <meta name="description" content="Discover the latest trends in fashion. Shop premium clothing, accessories, and more at Glitter Fashion." />
        <meta name="keywords" content="fashion, clothing, premium, style, trends" />
      </Helmet>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Placeholder Routes */}
        <Route path="/products" element={<Shop />} />
        <Route path="/products/:parentSlug" element={<Shop />} />
        <Route path="/products/:parentSlug/:childSlug" element={<Shop />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/login" element={<Auth />} />
        <Route path="/auth/register" element={<Auth />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/checkout" element={<Checkout />} />
        
        <Route path="/checkout/esewa/success" element={<EsewaSuccess />} />
        <Route path="/checkout/esewa/failure" element={<EsewaFailure />} />
        <Route path="/checkout/paypal/success" element={<PayPalSuccess />} />
        <Route path="/checkout/paypal/cancel" element={<PayPalCancel />} />
        <Route path="/pages/:slug" element={<PageDetail />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Account />} />
          <Route path="/profile/orders" element={<Orders />} />
          <Route path="/profile/orders/:id" element={<OrderDetails />} />
          <Route path="/profile/addresses" element={<Addresses />} />
        </Route>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="*" element={<div className="p-20 text-center">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
