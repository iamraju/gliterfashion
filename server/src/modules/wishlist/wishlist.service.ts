import prisma from '../../database/client';

export class WishlistService {
  async addToWishlist(userId: string, productId: string) {
    return prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      update: {},
      create: {
        userId,
        productId
      },
      include: {
        product: {
          include: {
            images: true
          }
        }
      }
    });
  }

  async removeFromWishlist(userId: string, productId: string) {
    // Check if exists first to avoid error or use deleteMany
    const exists = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (exists) {
      return prisma.wishlist.delete({
        where: {
          userId_productId: {
            userId,
            productId
          }
        }
      });
    }
    return null;
  }

  async getWishlist(userId: string) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            variants: {
               take: 1
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
  
  async checkInWishlist(userId: string, productId: string) {
     const item = await prisma.wishlist.findUnique({
       where: {
         userId_productId: {
            userId,
             productId
         }
       }
     });
     return !!item;
  }
}
