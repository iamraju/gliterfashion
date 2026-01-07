"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const products_service_1 = require("./products.service");
const products_dto_1 = require("./dto/products.dto");
const client_1 = __importDefault(require("../../database/client"));
const image_1 = require("../../common/utils/image");
const productsService = new products_service_1.ProductsService();
class ProductsController {
    async getAllProducts(req, res) {
        try {
            const products = await productsService.findAll();
            const formattedProducts = products.map(product => (0, image_1.formatProductWithImages)(req, product));
            res.json(formattedProducts);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getProduct(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Product ID required');
            const product = await productsService.findById(id);
            res.json((0, image_1.formatProductWithImages)(req, product));
        }
        catch (error) {
            if (error.message === 'Product not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
    async createProduct(req, res) {
        try {
            // 1. Get User
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const bodyData = { ...req.body };
            // 2. Inject Seller ID if user has a seller profile
            const seller = await client_1.default.seller.findUnique({ where: { userId: user.id } });
            if (seller) {
                bodyData.sellerId = seller.id;
            }
            else {
                // Super admin or user without seller profile - sellerId will be null
                bodyData.sellerId = null;
            }
            // 3. Auto-generate Slug from Name if missing
            if (!bodyData.slug && bodyData.name) {
                bodyData.slug = bodyData.name
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }
            // 4. Parse numeric fields from multipart body
            if (bodyData.basePrice)
                bodyData.basePrice = parseFloat(bodyData.basePrice);
            if (bodyData.salePrice)
                bodyData.salePrice = parseFloat(bodyData.salePrice);
            // Handle weight: allow empty string to be null
            if (bodyData.weight === '' || bodyData.weight === null || bodyData.weight === undefined || bodyData.weight === 'null') {
                bodyData.weight = null;
            }
            else {
                bodyData.weight = parseFloat(bodyData.weight);
            }
            // 5. Handle variants if sent as JSON string
            if (typeof bodyData.variants === 'string') {
                try {
                    bodyData.variants = JSON.parse(bodyData.variants);
                }
                catch (e) {
                    res.status(400).json({ error: 'Invalid variants JSON format', details: e });
                    return;
                }
            }
            // 6. Handle images from req.files and combined metadata
            let images = [];
            if (typeof bodyData.images === 'string') {
                images = JSON.parse(bodyData.images);
            }
            const files = req.files;
            const imageMetadata = bodyData.imageMetadata ? JSON.parse(bodyData.imageMetadata) : [];
            if (files && files.length > 0) {
                const newImages = files.map((file, index) => {
                    const metadata = imageMetadata[index] || {};
                    return {
                        imageUrl: file.filename,
                        isPrimary: metadata.isPrimary ?? (images.length === 0 && index === 0),
                        sortOrder: images.length + index,
                        attributeValueId: metadata.attributeValueId || null
                    };
                });
                images = [...images, ...newImages];
            }
            bodyData.images = images;
            const data = products_dto_1.createProductSchema.parse(bodyData);
            const product = await productsService.create(data);
            res.status(201).json((0, image_1.formatProductWithImages)(req, product));
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                // Return structured validation errors
                const formattedErrors = error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message
                }));
                res.status(400).json({ error: 'Validation Error', details: formattedErrors });
                return;
            }
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
                return;
            }
            console.error('Create Product Error:', error);
            res.status(400).json({ message: error.message, error: error.message });
        }
    }
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Product ID required');
            const bodyData = { ...req.body };
            // Parse numeric fields
            if (bodyData.basePrice)
                bodyData.basePrice = parseFloat(bodyData.basePrice);
            if (bodyData.salePrice)
                bodyData.salePrice = parseFloat(bodyData.salePrice);
            if (bodyData.weight)
                bodyData.weight = parseFloat(bodyData.weight);
            // Handle variants if sent as JSON string
            if (typeof bodyData.variants === 'string') {
                try {
                    bodyData.variants = JSON.parse(bodyData.variants);
                }
                catch (e) {
                    res.status(400).json({ error: 'Invalid variants JSON format', details: e });
                    return;
                }
            }
            // Handle images if any
            let images = [];
            if (typeof bodyData.images === 'string') {
                images = JSON.parse(bodyData.images);
            }
            const files = req.files;
            const imageMetadata = bodyData.imageMetadata ? JSON.parse(bodyData.imageMetadata) : [];
            if (files && files.length > 0) {
                const newImages = files.map((file, index) => {
                    const metadata = imageMetadata[index] || {};
                    return {
                        imageUrl: file.filename,
                        isPrimary: metadata.isPrimary ?? (images.length === 0 && index === 0),
                        sortOrder: images.length + index,
                        attributeValueId: metadata.attributeValueId || null
                    };
                });
                images = [...images, ...newImages];
            }
            bodyData.images = images;
            const data = products_dto_1.updateProductSchema.parse(bodyData);
            const product = await productsService.update(id, data);
            res.json((0, image_1.formatProductWithImages)(req, product));
        }
        catch (error) {
            if (error.constructor.name === 'ZodError') {
                res.status(400).json({ error: 'Validation Error', details: error.errors });
                return;
            }
            if (error.message === 'Product not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message.includes('Duplicate')) {
                res.status(400).json({ error: error.message });
                return;
            }
            console.error('Update Product Error:', error);
            res.status(400).json({ message: error.message, error: error.message });
        }
    }
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Product ID required');
            await productsService.delete(id);
            res.status(200).json({ message: 'Product deleted successfully' });
        }
        catch (error) {
            if (error.message === 'Product not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
}
exports.ProductsController = ProductsController;
//# sourceMappingURL=products.controller.js.map