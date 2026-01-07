"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    parentId: zod_1.z.string().uuid().optional().or(zod_1.z.literal('')).transform(val => val === '' ? null : val),
    imageUrl: zod_1.z.string().optional(),
    isActive: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            if (val === 'true')
                return true;
            if (val === 'false')
                return false;
        }
        return val;
    }, zod_1.z.boolean().optional()),
    sortOrder: zod_1.z.preprocess((val) => {
        if (val === '' || val === null)
            return undefined;
        if (typeof val === 'string')
            return Number(val);
        return val;
    }, zod_1.z.number().int().optional()),
    gender: zod_1.z.enum(['MEN', 'WOMEN', 'UNISEX']).nullish()
});
exports.updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').optional(),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    parentId: zod_1.z.string().uuid().optional().or(zod_1.z.literal('')).transform(val => val === '' ? null : val).nullable(),
    imageUrl: zod_1.z.string().optional(),
    isActive: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            if (val === 'true')
                return true;
            if (val === 'false')
                return false;
        }
        return val;
    }, zod_1.z.boolean().optional()),
    sortOrder: zod_1.z.preprocess((val) => {
        if (val === '' || val === null)
            return undefined;
        if (typeof val === 'string')
            return Number(val);
        return val;
    }, zod_1.z.number().int().optional()),
    gender: zod_1.z.enum(['MEN', 'WOMEN', 'UNISEX']).nullish()
});
//# sourceMappingURL=categories.dto.js.map