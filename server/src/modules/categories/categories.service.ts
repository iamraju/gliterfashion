
import prisma from '../../database/client';
import { createCategorySchema, updateCategorySchema } from './dto/categories.dto';
import { z } from 'zod';
import { generateSlug } from '../../common/utils/slug';

export class CategoriesService {
  async findAll() {
    const categories = await prisma.category.findMany({
      orderBy: {
        sortOrder: 'asc'
      }
    });
    return this.buildCategoryTree(categories);
  }

  private buildCategoryTree(categories: any[]) {
    const categoryMap = new Map();
    const roots: any[] = [];

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
      } else {
        roots.push(categoryMap.get(cat.id));
      }
    });

    return roots;
  }

  async findById(id: string) {
    const category = await prisma.category.findUnique({
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

  async create(data: z.infer<typeof createCategorySchema>) {
    const slug = data.slug || generateSlug(data.name);
    
    const existingCategory = await prisma.category.findUnique({ where: { slug } });
    if (existingCategory) {
      throw new Error(`Category with slug "${slug}" already exists`);
    }
    
    // Sanitize to remove undefined
    const createData: any = { 
      ...data,
      slug 
    };
    Object.keys(createData).forEach(key => createData[key] === undefined && delete createData[key]);
 
    return prisma.category.create({
      data: createData
    });
  }

  async update(id: string, data: z.infer<typeof updateCategorySchema>) {
    const existingCategory = await prisma.category.findUnique({ where: { id } });
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
        const slugCheck = await prisma.category.findUnique({ where: { slug } });
        if (slugCheck && slugCheck.id !== id) {
             throw new Error(`Category with slug "${slug}" already exists`);
        }
    }

    // Sanitize undefined
    const updateData: any = { ...data };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    return prisma.category.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({ where: { id }, include: { children: true, products: true } });
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

    await prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  }
}
