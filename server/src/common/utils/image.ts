
import { Request } from 'express';

export const getFullImageUrl = (req: Request, filename: string | null | undefined): string | null => {
  if (!filename) return null;
  
  // If it's already a full URL, return it
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
};

export const formatCategoryWithImage = (req: Request, category: any) => {
  if (!category) return category;
  
  const formatted = {
    ...category,
    imageUrl: getFullImageUrl(req, category.imageUrl)
  };

  if (category.children && Array.isArray(category.children)) {
    formatted.children = category.children.map((child: any) => formatCategoryWithImage(req, child));
  }

  return formatted;
};

export const formatProductWithImages = (req: Request, product: any) => {
  if (!product) return product;

  const formatted = {
    ...product,
    images: product.images?.map((img: any) => ({
      ...img,
      imageUrl: getFullImageUrl(req, img.imageUrl)
    })),
    category: formatCategoryWithImage(req, product.category),
    variants: product.variants?.map((v: any) => ({
      ...v,
      attributes: v.productVariantAttribute || []
    }))
  };

  return formatted;
};
