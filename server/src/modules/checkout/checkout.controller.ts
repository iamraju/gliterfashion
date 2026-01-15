
import { Request, Response } from 'express';
import prisma from '../../database/client';
import { v4 as uuidv4 } from 'uuid';

export class CheckoutController {
  async placeOrder(req: Request, res: Response) {
    try {
      const {
        shippingAddress,
        billingAddress,
        paymentMethodId,
        shippingMethodId,
        guestEmail,
        guestPhone,
        cartId, // From frontend if guest, or we find it for user
        notes
      } = req.body;

      const userId = (req as any).user?.userId;

      // 1. Find the cart
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

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty or not found' });
      }

      // 2. Fetch selected methods
      const [shippingMethod, paymentMethod] = await Promise.all([
        prisma.shippingMethod.findUnique({ where: { id: shippingMethodId } }),
        prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } })
      ]);

      if (!shippingMethod) return res.status(400).json({ message: 'Invalid shipping method' });
      if (!paymentMethod) return res.status(400).json({ message: 'Invalid payment method' });

      // 3. Calculate totals
      let subtotal = 0;
      cart.items.forEach(item => {
        const itemPrice = parseFloat(item.variant.price?.toString() || item.priceAtAdd.toString());
        subtotal += itemPrice * item.quantity;
      });

      const shippingAmount = parseFloat(shippingMethod.charge?.toString() || '0');
      const paymentCharge = parseFloat(paymentMethod.charge?.toString() || '0');
      const taxAmount = (subtotal + shippingAmount + paymentCharge) * 0.13; // 13% VAT example
      const totalAmount = subtotal + shippingAmount + taxAmount + paymentCharge;

      // 3. Create Order in Transaction
      const order = await prisma.$transaction(async (tx) => {
        // Create addresses
        const sAddr = await tx.address.create({
          data: {
            ...shippingAddress,
            userId: userId || null,
            type: 'SHIPPING'
          }
        });

        const bAddr = billingAddress ? await tx.address.create({
          data: {
            ...billingAddress,
            userId: userId || null,
            type: 'BILLING'
          }
        }) : sAddr;

        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: userId || null,
            guestEmail: userId ? null : guestEmail,
            guestPhone: userId ? null : guestPhone,
            subtotal,
            shippingAmount,
            taxAmount,
            discountAmount: 0,
            totalAmount,
            paymentMethod: paymentMethod.title,
            shippingAddressId: sAddr.id,
            billingAddressId: bAddr.id,
            notes,
            orderItems: {
              create: cart.items.map(item => ({
                sellerId: item.variant.product.sellerId || '', // Handle missing sellerId if necessary
                productVariantId: item.productVariantId,
                productName: item.variant.product.name,
                variantDetails: {}, // Could store attributes here
                quantity: item.quantity,
                unitPrice: item.variant.price || item.priceAtAdd,
                totalPrice: (parseFloat(item.variant.price?.toString() || item.priceAtAdd.toString()) * item.quantity),
                commissionRate: 10, // Example 10%
                commissionAmount: (parseFloat(item.variant.price?.toString() || item.priceAtAdd.toString()) * item.quantity) * 0.1
              }))
            }
          }
        });

        // 4. Clear Cart
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id }
        });

        return newOrder;
      });

      res.status(201).json(order);
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(500).json({ message: error.message || 'Failed to place order' });
    }
  }
}
