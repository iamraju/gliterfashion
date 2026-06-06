import prisma from '../../database/client';
import { formatCurrency } from '../../common/utils/currency';

export class CartService {
  async getCart(userId?: string, sessionId?: string): Promise<any> {
    if (!userId && !sessionId) return null;

    const where: any = {};
    if (userId) where.userId = userId;
    else if (sessionId) where.sessionId = sessionId;

    return prisma.cart.findFirst({
      where,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true
                  }
                },
                productVariantAttribute: {
                  include: {
                    attribute: true,
                    attributeValue: true
                  }
                }
              }
            }
          }
        },
        appliedCoupon: true
      }
    });
  }

  async createCart(userId?: string, sessionId?: string): Promise<any> {
    const data: any = {};
    if (userId) data.userId = userId;
    if (sessionId) data.sessionId = sessionId;

    return prisma.cart.create({
      data
    });
  }

  async addItem(cartId: string, variantId: string, quantity: number): Promise<any> {
    // Check if item already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId, productVariantId: variantId }
    });

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true }
    });

    if (!variant) throw new Error('Variant not found');

    // Determine price using Product Sale Price if available and valid
    // We assume if salePrice is set on Product, it applies. 
    // Ideally we should check if salePrice < price, but user said "take the sale price".
    let finalPrice = variant.price;
    if (variant.product.salePrice && Number(variant.product.salePrice) > 0) {
        finalPrice = variant.product.salePrice;
    }

    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: existingItem.quantity + quantity,
          priceAtAdd: finalPrice // Update price to current effective price
        }
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId,
        productVariantId: variantId,
        quantity,
        priceAtAdd: finalPrice
      }
    });
  }

  async updateItem(cartItemId: string, quantity: number): Promise<any> {
    if (quantity <= 0) {
      return prisma.cartItem.delete({ where: { id: cartItemId } });
    }
    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    });
  }

  async removeItem(cartItemId: string): Promise<any> {
    return prisma.cartItem.delete({
      where: { id: cartItemId }
    });
  }

  async mergeCarts(sessionId: string, userId: string): Promise<any> {
    const sessionCart = await this.getCart(undefined, sessionId);
    const userCart = await this.getCart(userId);

    if (!sessionCart) return userCart;

    let targetCart = userCart;
    if (!targetCart) {
      targetCart = await prisma.cart.create({ data: { userId } });
    }

    if (!targetCart) return null;

    // Move items from session cart to user cart
    const items = (sessionCart as any).items || [];
    for (const item of items) {
      await this.addItem(targetCart.id, item.productVariantId, item.quantity);
    }

    // Delete session cart
    await prisma.cart.delete({ where: { id: sessionCart.id } });

    return this.getCart(userId);
  }
  
  async applyCoupon(cartId: string, couponCode: string): Promise<any> {
    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (!coupon) throw new Error('Invalid coupon code');
    if (!coupon.isActive) throw new Error('Coupon is no longer active');
    
    // Check date/time validity
    const now = new Date();
    if (now < coupon.startsAt) throw new Error('Coupon is not yet active');
    if (now > coupon.expiresAt) throw new Error('Coupon has expired');
    
    // Check global usage limit (0 or null = no limit)
    if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit reached');
    }

    // Get cart with items to check minimum order amount
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!cart) throw new Error('Cart not found');

    // Calculate cart subtotal
    const subtotal = cart.items.reduce((acc, item) => {
      let price = parseFloat(item.variant?.price?.toString() || item.priceAtAdd.toString());
      
      // Check for product sale price
      if (item.variant?.product?.salePrice && Number(item.variant.product.salePrice) > 0) {
          price = parseFloat(item.variant.product.salePrice.toString());
      }
      
      return acc + (price * item.quantity);
    }, 0);

    // Check minimum order amount (0 or null = no limit)
    if (coupon.minOrderAmount && parseFloat(coupon.minOrderAmount.toString()) > 0) {
      if (subtotal < parseFloat(coupon.minOrderAmount.toString())) {
        const amount = typeof coupon.minOrderAmount === 'number' ? coupon.minOrderAmount : parseFloat(coupon.minOrderAmount.toString());
        throw new Error(`Minimum order amount of ${formatCurrency(amount)} required`);
      }
    }

    // Update cart with applied coupon
    await prisma.cart.update({
      where: { id: cartId },
      data: { appliedCouponId: coupon.id }
    });

    return coupon;
  }

  async removeCoupon(cartId: string): Promise<any> {
    return prisma.cart.update({
      where: { id: cartId },
      data: { appliedCouponId: null }
    });
  }
}

export const cartService = new CartService();
