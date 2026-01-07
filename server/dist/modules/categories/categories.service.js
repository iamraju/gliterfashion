"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const client_1 = __importDefault(require("../../database/client"));
const slug_1 = require("../../common/utils/slug");
class CategoriesService {
    async findAll() {
        const categories = await client_1.default.category.findMany({
            orderBy: {
                sortOrder: 'asc'
            }
        });
        return this.buildCategoryTree(categories);
    }
    buildCategoryTree(categories) {
        const categoryMap = new Map();
        const roots = [];
        // Initialize map and add children array to each category
        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });
        // Build tree
        categories.forEach(cat => {
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    parent.children.push(categoryMap.get(cat.id));
                }
            }
            else {
                roots.push(categoryMap.get(cat.id));
            }
        });
        return roots;
    }
    async findById(id) {
        const category = await client_1.default.category.findUnique({
            where: { id },
            include: {
                children: true,
                parent: true
            }
        });
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    }
    async create(data) {
        const slug = data.slug || (0, slug_1.generateSlug)(data.name);
        const existingCategory = await client_1.default.category.findUnique({ where: { slug } });
        if (existingCategory) {
            throw new Error(`Category with slug "${slug}" already exists`);
        }
        // Sanitize to remove undefined
        const createData = {
            ...data,
            slug
        };
        Object.keys(createData).forEach(key => createData[key] === undefined && delete createData[key]);
        return client_1.default.category.create({
            data: createData
        });
    }
    async update(id, data) {
        const existingCategory = await client_1.default.category.findUnique({ where: { id } });
        if (!existingCategory) {
            throw new Error('Category not found');
        }
        let slug = data.slug;
        if (data.name && !slug) {
            // If name is updated but slug is not provided, we could optionally update slug too
            // but usually it's better to keep slug stable unless explicitly changed.
            // For now, let's only update slug if explicitly provided in data or if it's a new category.
        }
        if (slug) {
            const slugCheck = await client_1.default.category.findUnique({ where: { slug } });
            if (slugCheck && slugCheck.id !== id) {
                throw new Error(`Category with slug "${slug}" already exists`);
            }
        }
        // Sanitize undefined
        const updateData = { ...data };
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        return client_1.default.category.update({
            where: { id },
            data: updateData
        });
    }
    async delete(id) {
        const category = await client_1.default.category.findUnique({ where: { id }, include: { children: true, products: true } });
        if (!category) {
            throw new Error('Category not found');
        }
        // Check for children or products?
        if (category.children.length > 0) {
            throw new Error('Cannot delete category with sub-categories');
        }
        if (category.products.length > 0) {
            throw new Error('Cannot delete category with associated products');
        }
        await client_1.default.category.delete({ where: { id } });
        return { message: 'Category deleted successfully' };
    }
}
exports.CategoriesService = CategoriesService;
//# sourceMappingURL=categories.service.js.map