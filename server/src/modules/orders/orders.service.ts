
import prisma from '../../database/client';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class OrdersService {
  async findAll(role: string, userId: string, sellerId?: string) {
    if (role === 'SUPER_ADMIN') {
        const orders = await prisma.order.findMany({
            include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true } },
                orderItems: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return orders;
    } else if (role === 'SELLER') {
        // Sellers only see orders that contain their products
        // And they should arguably only see the items THEY sold.
        // For simplicity, finding orders where orderItems include sellerId = currentSellerId
        if (!sellerId) throw new Error("Seller ID required for seller access");
        
        const orders = await prisma.order.findMany({
            where: {
                orderItems: {
                    some: { sellerId: sellerId }
                }
            },
            include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true } },
                orderItems: {
                    where: { sellerId: sellerId } 
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return orders;
    } else {
        // Customer
        return prisma.order.findMany({
            where: { userId },
            include: {
                orderItems: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
  }

  async findById(id: string, role: string, userId: string, sellerId?: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },

            orderItems: {
                include: {
                    variant: {
                        include: {
                            product: {
                                include: {
                                    images: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });


    if (!order) {
        throw new Error('Order not found');
    }

    // Synthesize Address Objects from flat fields for frontend compatibility
    const orderWithAddresses = {
        ...order,
        shippingAddress: {
            fullName: order.shippingFullName,
            phone: order.shippingPhone,
            addressLine1: order.shippingAddressLine1,
            addressLine2: order.shippingAddressLine2,
            city: order.shippingCity,
            state: order.shippingState,
            postalCode: order.shippingPostalCode,
            country: order.shippingCountry,
        },
        billingAddress: {
             fullName: order.billingFullName,
             phone: order.billingPhone,
             addressLine1: order.billingAddressLine1,
             addressLine2: order.billingAddressLine2,
             city: order.billingCity,
             state: order.billingState,
             postalCode: order.billingPostalCode,
             country: order.billingCountry,
        }
    };

    // Access Control
    if (role === 'CUSTOMER' && order.userId !== userId) {
         throw new Error('Unauthorized access to order');
    }
    
    if (role === 'SELLER') {
         if (!sellerId) throw new Error("Seller ID required");
         // Check if this order contains any items from this seller
         const hasItems = order.orderItems.some(item => item.sellerId === sellerId);
         if (!hasItems) {
             throw new Error('Unauthorized access to order');
         }
         // Optional: Filter items to show only theirs? 
         // For now returning full order but aware that sensitive info might be visible.
         // Let's filter items in memory to be safe if strict seller isolation is needed.
         order.orderItems = order.orderItems.filter(item => item.sellerId === sellerId);
         // Filter for synthesized object too
         orderWithAddresses.orderItems = orderWithAddresses.orderItems.filter(item => item.sellerId === sellerId);
    }

    return orderWithAddresses;
  }

  async updateStatus(id: string, status: OrderStatus) {
    // Basic status update. 
    // In real app, might trigger emails, stock adjustments etc.
    return prisma.order.update({
        where: { id },
        data: { status }
    });
  }

  async cancelOrder(id: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { userId: true, status: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Unauthorized');
    }

    if (order.status !== 'PENDING') {
      throw new Error('Order cannot be cancelled as it is already ' + order.status.toLowerCase());
    }

    return prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
  }
}
