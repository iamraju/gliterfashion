"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false, // Allow cross-origin images
}));
app.use((0, morgan_1.default)("dev"));
// Static Folder for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const seller_routes_1 = __importDefault(require("./modules/seller/seller.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const categories_routes_1 = __importDefault(require("./modules/categories/categories.routes"));
const attributes_routes_1 = __importDefault(require("./modules/attributes/attributes.routes"));
const products_routes_1 = __importDefault(require("./modules/products/products.routes"));
const coupons_routes_1 = __importDefault(require("./modules/coupons/coupons.routes"));
const orders_routes_1 = __importDefault(require("./modules/orders/orders.routes"));
const store_routes_1 = __importDefault(require("./modules/store/store.routes"));
const brands_routes_1 = __importDefault(require("./modules/brands/brands.routes"));
const reviews_routes_1 = __importDefault(require("./modules/reviews/reviews.routes"));
const cart_routes_1 = __importDefault(require("./modules/cart/cart.routes"));
const checkout_routes_1 = __importDefault(require("./modules/checkout/checkout.routes"));
const user_store_routes_1 = __importDefault(require("./modules/users/user_store.routes"));
const settings_routes_1 = __importDefault(require("./modules/settings/settings.routes"));
const countries_routes_1 = __importDefault(require("./routes/countries.routes"));
const pages_routes_1 = __importDefault(require("./modules/pages/pages.routes"));
const faqs_routes_1 = __importDefault(require("./modules/faqs/faqs.routes"));
const testimonials_routes_1 = __importDefault(require("./modules/testimonials/testimonials.routes"));
app.use('/api/backoffice/auth', auth_routes_1.default);
app.use('/api/store/auth', auth_routes_1.default);
app.use('/api/backoffice/seller', seller_routes_1.default);
app.use('/api/backoffice/users', users_routes_1.default);
app.use('/api/store/users', user_store_routes_1.default);
app.use('/api/backoffice/settings', settings_routes_1.default);
app.use('/api/backoffice/categories', categories_routes_1.default);
app.use('/api/backoffice/attributes', attributes_routes_1.default);
app.use('/api/backoffice/products', products_routes_1.default);
app.use('/api/backoffice/coupons', coupons_routes_1.default);
app.use('/api/backoffice/orders', orders_routes_1.default);
app.use('/api/store/cart', cart_routes_1.default);
app.use('/api/store/checkout', checkout_routes_1.default);
app.use('/api/store', store_routes_1.default);
app.use('/api/backoffice/brands', brands_routes_1.default);
app.use('/api/backoffice/reviews', reviews_routes_1.default);
app.use('/api/store/countries', countries_routes_1.default);
app.use('/api/backoffice/countries', countries_routes_1.default);
app.use('/api/backoffice/pages', pages_routes_1.default);
app.use('/api/store/pages', pages_routes_1.default);
app.use('/api/backoffice/faqs', faqs_routes_1.default);
app.use('/api/store/faqs', faqs_routes_1.default);
app.use('/api/backoffice/testimonials', testimonials_routes_1.default);
app.use('/api/store/testimonials', testimonials_routes_1.default);
app.use('/api/store/settings', settings_routes_1.default);
const banners_routes_1 = __importDefault(require("./modules/banners/banners.routes"));
app.use('/api/backoffice/banners', banners_routes_1.default); // Protected (POST/PUT/DELETE)
app.use('/api/store/banners', banners_routes_1.default); // Public (GET)
const wishlist_routes_1 = __importDefault(require("./modules/wishlist/wishlist.routes"));
app.use('/api/store/wishlist', wishlist_routes_1.default);
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
app.use('/api/backoffice/upload', upload_routes_1.default);
// Basic Route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to E-commerce Backend API" });
});
exports.default = app;
//# sourceMappingURL=app.js.map