import prisma from '../../database/client';

export class StoreService {
  async getProducts(query: any) {
    const { category, brand, minPrice, maxPrice, search, sort, limit, page } = query;
    const take = limit ? Number(limit) : 20;
    const skip = page ? (Number(page) - 1) * take : 0;

    const where: any = { status: 'ACTIVE' }; // Only direct public products

    if (category && category !== 'All' && category !== 'new' && category !== 'sale') {
      const categoryRecord = await prisma.category.findFirst({
        where: { OR: [{ slug: category }, { name: category }] },
        include: {
          children: {
            select: {
              id: true,
              children: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      });
      
      if (categoryRecord) {
        const categoryIds = [categoryRecord.id];
        
        // Add children IDs
        categoryRecord.children.forEach(child => {
          categoryIds.push(child.id);
          // Add grandchildren IDs (assuming max depth of 2 for now, which is common)
          if (child.children) {
            child.children.forEach(grandChild => {
              categoryIds.push(grandChild.id);
            });
          }
        });
        
        where.categoryId = { in: categoryIds };
      }
    }
    
    // Simple mock logic for 'new' and 'sale' if they are passed as categories
    if (category === 'new') {
       // logic for new arrivals (e.g. created recently)
    }
    if (category === 'sale') {
       // logic for sale items
       where.salePrice = { not: null };
    }

    if (brand) {
      const brandRecord = await prisma.brand.findFirst({
        where: { OR: [{ slug: brand }, { name: brand }] }
      });
      if (brandRecord) {
        where.brandId = brandRecord.id;
      }
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { basePrice: 'asc' };
    if (sort === 'price-desc') orderBy = { basePrice: 'desc' };
    
    // Featured filter
    if (page === 'featured' || (query.featured === 'true')) {
        where.isFeatured = true;
    }

    // Attribute Filtering
    // Expects parameters like ?color=Red,Blue&size=XL
    const filterableKeys = ['category', 'brand', 'minPrice', 'maxPrice', 'search', 'sort', 'limit', 'page', 'featured'];
    const attributeQueries: any[] = [];

    Object.keys(query).forEach(key => {
      if (!filterableKeys.includes(key)) {
        const values = query[key].split(',').filter(Boolean);
        if (values.length > 0) {
          attributeQueries.push({
            variants: {
              some: {
                productVariantAttribute: {
                  some: {
                    attribute: { slug: key },
                    attributeValue: { value: { in: values } }
                  }
                }
              }
            }
          });
        }
      }
    });

    if (attributeQueries.length > 0) {
      if (where.AND) {
        where.AND = [...where.AND, ...attributeQueries];
      } else {
        where.AND = attributeQueries;
      }
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          category: true,
          variants: true,
          images: true
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      data: products,
      pagination: {
        total,
        page: page || 1,
        limit: take,
        pages: Math.ceil(total / take)
      }
    };
  }

  async getProduct(idOrSlug: string) {
     const product = await prisma.product.findFirst({
       where: {
         OR: [{ id: idOrSlug }, { slug: idOrSlug }],
         status: { not: 'DRAFT' } // Allow OUT_OF_STOCK but not draft
       },
       include: {
         category: true,
         images: true,
         variants: {
           include: {
             productVariantAttribute: {
               include: {
                 attribute: true,
                 attributeValue: true
               }
             }
           }
         }
       }
     });
     return product;
  }

  async getCategories(query: any = {}) {
    const where: any = { isActive: true };
    
    if (query.showInNavBar === 'true') where.showInNavBar = true;
    if (query.showInHomePage === 'true') where.showInHomePage = true;

    return prisma.category.findMany({
      where,
      include: {
        children: {
          where: { isActive: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async getBrands() {
    return prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }
  
  async getAttributes() {
    return prisma.attribute.findMany({
      include: {
        values: true
      },
      orderBy: { name: 'asc' }
    });
  }

  async getShippingMethods() {
    return prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { charge: 'asc' }
    });
  }

  async getPaymentMethods() {
    return prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });
  }
}

export const storeService = new StoreService();
