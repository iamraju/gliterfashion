"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCartWithImages = exports.formatBrandWithLogo = exports.formatProductWithImages = exports.formatCategoryWithImage = exports.getFullImageUrl = void 0;
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
            attributes: v.productVariantAttribute || v.attributes || []
        }))
    };
    return formatted;
};
exports.formatProductWithImages = formatProductWithImages;
const formatBrandWithLogo = (req, brand) => {
    if (!brand)
        return brand;
    return {
        ...brand,
        logoUrl: (0, exports.getFullImageUrl)(req, brand.logoUrl)
    };
};
exports.formatBrandWithLogo = formatBrandWithLogo;
const formatCartWithImages = (req, cart) => {
    if (!cart)
        return cart;
    return {
        ...cart,
        items: cart.items?.map((item) => ({
            ...item,
            variant: item.variant ? {
                ...item.variant,
                product: (0, exports.formatProductWithImages)(req, item.variant.product)
            } : null
        }))
    };
};
exports.formatCartWithImages = formatCartWithImages;
//# sourceMappingURL=image.js.map