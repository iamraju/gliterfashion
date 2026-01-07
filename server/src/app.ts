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
import reviewsRoutes from './modules/reviews/reviews.routes';

app.use('/api/backoffice/auth', authRoutes);
app.use('/api/backoffice/seller', sellerRoutes);
app.use('/api/backoffice/users', userRoutes);
app.use('/api/backoffice/categories', categoriesRoutes);
app.use('/api/backoffice/attributes', attributesRoutes);
app.use('/api/backoffice/products', productsRoutes);
app.use('/api/backoffice/coupons', couponsRoutes);
app.use('/api/backoffice/orders', ordersRoutes);
app.use('/api/backoffice/reviews', reviewsRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to E-commerce Backend API" });
});

export default app;
