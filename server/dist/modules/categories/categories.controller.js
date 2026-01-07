"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesController = void 0;
const zod_1 = require("zod");
const categories_service_1 = require("./categories.service");
const categories_dto_1 = require("./dto/categories.dto");
const image_1 = require("../../common/utils/image");
const categoriesService = new categories_service_1.CategoriesService();
class CategoriesController {
    async getAllCategories(req, res) {
        try {
            const categories = await categoriesService.findAll();
            const formattedCategories = categories.map(cat => (0, image_1.formatCategoryWithImage)(req, cat));
            res.json(formattedCategories);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getCategory(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Category ID required');
            const category = await categoriesService.findById(id);
            res.json((0, image_1.formatCategoryWithImage)(req, category));
        }
        catch (error) {
            if (error.message === 'Category not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
    async createCategory(req, res) {
        try {
            const bodyData = { ...req.body };
            if (req.file) {
                bodyData.imageUrl = req.file.filename;
            }
            const data = categories_dto_1.createCategorySchema.parse(bodyData);
            const category = await categoriesService.create(data);
            res.status(201).json((0, image_1.formatCategoryWithImage)(req, category));
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = (error.issues || []).map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                res.status(400).json({
                    error: 'Validation failed',
                    details: formattedErrors
                });
                return;
            }
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Category ID required');
            const bodyData = { ...req.body };
            if (req.file) {
                bodyData.imageUrl = req.file.filename;
            }
            const data = categories_dto_1.updateCategorySchema.parse(bodyData);
            const category = await categoriesService.update(id, data);
            res.json((0, image_1.formatCategoryWithImage)(req, category));
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = (error.issues || []).map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                res.status(400).json({
                    error: 'Validation failed',
                    details: formattedErrors
                });
                return;
            }
            if (error.message === 'Category not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Category ID required');
            await categoriesService.delete(id);
            res.status(200).json({ message: 'Category deleted successfully' });
        }
        catch (error) {
            if (error.message === 'Category not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            // Conflict if has children/products
            if (error.message.includes('Cannot delete')) {
                res.status(409).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
}
exports.CategoriesController = CategoriesController;
//# sourceMappingURL=categories.controller.js.map