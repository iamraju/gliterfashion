import { Request, Response } from 'express';
export declare class OrdersController {
    getAllOrders(req: Request, res: Response): Promise<void>;
    getOrder(req: Request, res: Response): Promise<void>;
    updateOrderStatus(req: Request, res: Response): Promise<void>;
    cancelOrder(req: Request, res: Response): Promise<void>;
    verifyPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getDashboardStats(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=orders.controller.d.ts.map