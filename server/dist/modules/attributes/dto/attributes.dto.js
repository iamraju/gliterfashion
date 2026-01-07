"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAttributeSchema = exports.createAttributeSchema = void 0;
const zod_1 = require("zod");
exports.createAttributeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    values: zod_1.z.array(zod_1.z.string().min(1)).min(1)
});
exports.updateAttributeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    slug: zod_1.z.string().min(1).optional(),
    values: zod_1.z.array(zod_1.z.string().min(1)).optional()
});
//# sourceMappingURL=attributes.dto.js.map