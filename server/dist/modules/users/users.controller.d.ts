import { Request, Response } from 'express';
export declare class UsersController {
    getAllUsers(req: Request, res: Response): Promise<void>;
    getUser(req: Request, res: Response): Promise<void>;
    createUser(req: Request, res: Response): Promise<void>;
    updateUser(req: Request, res: Response): Promise<void>;
    deleteUser(req: Request, res: Response): Promise<void>;
    getMe(req: Request, res: Response): Promise<void>;
    updateMe(req: Request, res: Response): Promise<void>;
    changePassword(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=users.controller.d.ts.map