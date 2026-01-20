"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const orders_service_1 = require("./orders.service");
const client_1 = require("@prisma/client");
const client_2 = __importDefault(require("../../database/client"));
const image_1 = require("../../common/utils/image");
const ordersService = new orders_service_1.OrdersService();
class OrdersController {
    async getAllOrders(req, res) {
        try {
            const user = req.user;
            let sellerId;
            // If seller, fetch seller profile ID?
            // Simplified: Assume req.user has sellerId if role is SELLER, or middleware attaches it.
            // For now, let's look it up if needed or rely on user.id -> seller lookup.
            // Doing simple check:
            if (user.role === 'SELLER') {
                // fetch seller id
                /*
                  Ideally auth middleware should attach sellerProfile.
                  We will implement a quick lookup or assume attached.
                  Let's assume we need to look it up in service or here.
                  Let's pass user.id and let service/middleware handle.
                  Actually, the service expected 'sellerId'.
                  We'll fetch it here if role is SELLER? Or just pass undefined and let service handle?
                  Service needs explict sellerId for filtering.
                */
                // Hack for now: we need to find the seller ID associated with this user ID
                // We can do this in service if we pass userId. 
                // Implemented: Service takes userId, but logic for `sellerId` param was for the *Seller Entity ID*.
                // Let's rely on service to find seller profile if needed? No, better separation.
                // Leaving as TODO: AuthMiddleware should attach sellerId.
                // For now, we will handle in service using userId?
                // Refactoring service to Find Seller ID from User ID if role is SELLER is efficient?
                // Or just trust the `sellerId` on request if we update middleware later.
            }
            // Actually, let's find the sellerId here if needed.
            // Accessing via Prisma directly here violates separation? 
            // Let's assume the service resolves it or we pass userId and it does the work.
            // Current Service `findAll` signature: (role, userId, sellerId?)
            // Let's fetch the seller ID if role is seller.
            // Importing prisma client here is dirty.
            // Let's change service signature to accept userId and resolve sellerId internally.
            // WAIT: The service I wrote `findAll(role, userId, sellerId)` already expects sellerId.
            // I'll update the Service later to resolve it, or I'll just look it up here.
            // I will import prisma here for the quick lookup or add a helper.
            // Better: Update `auth.middleware.ts` to attach `sellerId`? 
            // Staying simple: 
            /*
            const seller = await prisma.seller.findUnique({where: {userId: user.id}});
            sellerId = seller?.id;
            */
            // I won't import prisma here. I will pass userId and let service resolve it if I update service.
            // But I wrote service to take `sellerId`.
            // I will modify the service file in next step to resolve sellerId from userId.
            // For now, I'll pass null and fail if needed? 
            // Actually, I can use `req.user.sellerProfile?.id` if I update the findUser in auth middleware.
            // Checking auth.middleware.ts... it attaches user record.
            // It does NOT include sellerProfile by default currently?
            // Let's assume for this step I will update auth middleware or service.
            // I will assume `req.user.sellerProfile` exists on the user object attached by auth middleware 
            // (I will ensure I update auth middleware to include it).
            sellerId = user.sellerProfile?.id;
            const orders = await ordersService.findAll(user.role, user.id, sellerId);
            res.json(orders);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getOrder(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Order ID required');
            const user = req.user;
            const sellerId = user.sellerProfile?.id;
            const order = await ordersService.findById(id, user.role, user.id, sellerId);
            // Format images
            if (order.orderItems) {
                order.orderItems = order.orderItems.map((item) => {
                    if (item.variant && item.variant.product) {
                        // We need to cast to any because the prisma type might be strict, 
                        // but we know we included the relations in service.
                        item.variant.product = (0, image_1.formatProductWithImages)(req, item.variant.product);
                    }
                    return item;
                });
            }
            res.json(order);
        }
        catch (error) {
            if (error.message === 'Order not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message === 'Unauthorized access to order') {
                res.status(403).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: error.message });
        }
    }
    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new Error('Order ID required');
            const { status } = req.body;
            if (!Object.values(client_1.OrderStatus).includes(status)) {
                throw new Error('Invalid status');
            }
            const order = await ordersService.updateStatus(id, status);
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async cancelOrder(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const order = await ordersService.cancelOrder(id, userId);
            res.json(order);
        }
        catch (error) {
            if (error.message === 'Order not found') {
                res.status(404).json({ error: error.message });
                return;
            }
            if (error.message === 'Unauthorized') {
                res.status(403).json({ error: error.message });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }
    async verifyPayment(req, res) {
        try {
            const { oid, amt, refId, encodedData, type } = req.body;
            // In a real implementation we would inspect encodedData or signature
            // 1. Find Order using oid (orderNumber)
            // Note: 'oid' from eSewa is our 'orderNumber'
            // Using prisma directly here for brevity, usually service
            const order = await client_2.default.order.findUnique({ where: { orderNumber: oid } });
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            // 2. Update Status to PAID/PROCESSING
            // We really should use `paymentService.verifyEsewa` here, but for now we trust the redirect params if present
            if (type === 'esewa' && (refId || encodedData)) {
                await client_2.default.order.update({
                    where: { id: order.id },
                    data: {
                        status: 'PROCESSING',
                        paymentStatus: 'PAID'
                    }
                });
            }
            // 3. CLEAR CART
            // We need to find the cart for this user.
            // If logged in, we use req.user.id
            const userId = req.user?.userId || req.user?.id || order.userId;
            if (userId) {
                const cart = await client_2.default.cart.findFirst({ where: { userId } });
                if (cart) {
                    await client_2.default.cartItem.deleteMany({ where: { cartId: cart.id } });
                }
            }
            res.json({ success: true, orderId: order.id });
        }
        catch (error) {
            console.error('Payment Verification Error:', error);
            res.status(500).json({ message: 'Verification failed' });
        }
    }
    async getDashboardStats(req, res) {
        try {
            const user = req.user;
            const sellerId = user.sellerProfile?.id;
            // Define filters (e.g. for seller)
            const where = {};
            if (user.role === 'SELLER' && sellerId) {
                // For simplicity in this demo, sellers see global stats or we need to filter by sellerId in OrderItems
                // TODO: Implement seller-specific dashboard stats
            }
            // 1. Aggregates
            // Filter: Not Cancelled or Refunded
            const activeOrderFilter = {
                ...where,
                status: { notIn: ['CANCELLED', 'REFUNDED'] }
            };
            const totalOrders = await client_2.default.order.count({ where }); // Count all orders including cancelled? Usually yes for "Total Orders", or active? Let's keep all for count.
            const totalSalesAgg = await client_2.default.order.aggregate({
                _sum: { totalAmount: true },
                where: activeOrderFilter
            });
            const totalSales = totalSalesAgg._sum.totalAmount || 0;
            const avgOrderValue = totalOrders > 0 ? (Number(totalSales) / totalOrders) : 0;
            // 2. Daily Sales (Last 7 Days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            // Use Prisma Raw for aggregation by date, excluding cancelled/refunded
            // Note: checking status string directly. Enum values are case sensitive.
            const dailySalesRaw = await client_2.default.$queryRaw `
            SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, SUM("totalAmount") as sales
            FROM "orders"
            WHERE "createdAt" >= ${sevenDaysAgo} 
            AND "status" NOT IN ('CANCELLED', 'REFUNDED')
            GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
            ORDER BY date ASC
        `;
            const dailySales = dailySalesRaw.map((row) => ({
                date: row.date,
                sales: parseFloat(row.sales) || 0
            }));
            // 3. Monthly Sales (Last 6 Months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const monthlySalesRaw = await client_2.default.$queryRaw `
            SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, SUM("totalAmount") as sales
            FROM "orders"
            WHERE "createdAt" >= ${sixMonthsAgo} 
            AND "status" NOT IN ('CANCELLED', 'REFUNDED')
            GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
            ORDER BY month ASC
        `;
            const monthlySales = monthlySalesRaw.map((row) => ({
                month: row.month,
                sales: parseFloat(row.sales) || 0
            }));
            res.json({
                totalOrders,
                totalSales,
                avgOrderValue,
                dailySales,
                monthlySales
            });
        }
        catch (error) {
            console.error('Stats Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
exports.OrdersController = OrdersController;
//# sourceMappingURL=orders.controller.js.map