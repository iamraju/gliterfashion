import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin images
}));
app.use(morgan("dev"));

// Static Folder for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

import authRoutes from './modules/auth/auth.routes';
import sellerRoutes from './modules/seller/seller.routes';
import userRoutes from './modules/users/users.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import attributesRoutes from './modules/attributes/attributes.routes';

import productsRoutes from './modules/products/products.routes';
import couponsRoutes from './modules/coupons/coupons.routes';
import ordersRoutes from './modules/orders/orders.routes';
import storeRoutes from './modules/store/store.routes';
import brandsRoutes from './modules/brands/brands.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import cartRoutes from './modules/cart/cart.routes';
import checkoutRoutes from './modules/checkout/checkout.routes';
import userStoreRoutes from './modules/users/user_store.routes';
import settingsRoutes from './modules/settings/settings.routes';
import countriesRoutes from './routes/countries.routes';
import pagesRoutes from './modules/pages/pages.routes';
import faqsRoutes from './modules/faqs/faqs.routes';
import testimonialsRoutes from './modules/testimonials/testimonials.routes';

app.use('/api/backoffice/auth', authRoutes);
app.use('/api/store/auth', authRoutes);
app.use('/api/backoffice/seller', sellerRoutes);
app.use('/api/backoffice/users', userRoutes);
app.use('/api/store/users', userStoreRoutes);
app.use('/api/backoffice/settings', settingsRoutes);
app.use('/api/backoffice/categories', categoriesRoutes);
app.use('/api/backoffice/attributes', attributesRoutes);
app.use('/api/backoffice/products', productsRoutes);
app.use('/api/backoffice/coupons', couponsRoutes);
app.use('/api/backoffice/orders', ordersRoutes);
app.use('/api/store/cart', cartRoutes);
app.use('/api/store/checkout', checkoutRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/backoffice/brands', brandsRoutes);
app.use('/api/backoffice/reviews', reviewsRoutes);
app.use('/api/store/countries', countriesRoutes);
app.use('/api/backoffice/countries', countriesRoutes);
app.use('/api/backoffice/pages', pagesRoutes);
app.use('/api/store/pages', pagesRoutes);
app.use('/api/backoffice/faqs', faqsRoutes);
app.use('/api/store/faqs', faqsRoutes);
app.use('/api/backoffice/testimonials', testimonialsRoutes);
app.use('/api/store/testimonials', testimonialsRoutes);
app.use('/api/store/settings', settingsRoutes);

import bannersRoutes from './modules/banners/banners.routes';
app.use('/api/backoffice/banners', bannersRoutes); // Protected (POST/PUT/DELETE)
app.use('/api/store/banners', bannersRoutes);      // Public (GET)

import wishlistRoutes from './modules/wishlist/wishlist.routes';
app.use('/api/store/wishlist', wishlistRoutes);

import uploadRoutes from './routes/upload.routes';
app.use('/api/backoffice/upload', uploadRoutes);

import contactRoutes from './modules/contact/contact.routes';
app.use('/api/store/contact', contactRoutes); // Public POST
app.use('/api/backoffice/contact', contactRoutes); // Admin GET/DELETE

// Basic Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to E-commerce Backend API" });
});

export default app;
