"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatProductWithImages = exports.formatCategoryWithImage = exports.getFullImageUrl = void 0;
const getFullImageUrl = (req, filename) => {
    if (!filename)
        return null;
    // If it's already a full URL, return it
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/uploads/${filename}`;
};
exports.getFullImageUrl = getFullImageUrl;
const formatCategoryWithImage = (req, category) => {
    if (!category)
        return category;
    const formatted = {
        ...category,
        imageUrl: (0, exports.getFullImageUrl)(req, category.imageUrl)
    };
    if (category.children && Array.isArray(category.children)) {
        formatted.children = category.children.map((child) => (0, exports.formatCategoryWithImage)(req, child));
    }
    return formatted;
};
exports.formatCategoryWithImage = formatCategoryWithImage;
const formatProductWithImages = (req, product) => {
    if (!product)
        return product;
    const formatted = {
        ...product,
        images: product.images?.map((img) => ({
            ...img,
            imageUrl: (0, exports.getFullImageUrl)(req, img.imageUrl)
        })),
        category: (0, exports.formatCategoryWithImage)(req, product.category),
        variants: product.variants?.map((v) => ({
            ...v,
            attributes: v.productVariantAttribute || []
        }))
    };
    return formatted;
};
exports.formatProductWithImages = formatProductWithImages;
//# sourceMappingURL=image.js.map