import { createCategorySchema, updateCategorySchema } from './dto/categories.dto';
import { z } from 'zod';
export declare class CategoriesService {
    findAll(): Promise<any[]>;
    private buildCategoryTree;
    findById(id: string): Promise<{
        parent: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            gender: import(".prisma/client").$Enums.CategoryGender | null;
            name: string;
            slug: string;
            description: string | null;
            parentId: string | null;
            imageUrl: string | null;
            isActive: boolean;
            showInNavBar: boolean;
            showInHomePage: boolean;
            sortOrder: number;
        } | null;
        children: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            gender: import(".prisma/client").$Enums.CategoryGender | null;
            name: string;
            slug: string;
            description: string | null;
            parentId: string | null;
            imageUrl: string | null;
            isActive: boolean;
            showInNavBar: boolean;
            showInHomePage: boolean;
            sortOrder: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        gender: import(".prisma/client").$Enums.CategoryGender | null;
        name: string;
        slug: string;
        description: string | null;
        parentId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        showInNavBar: boolean;
        showInHomePage: boolean;
        sortOrder: number;
    }>;
    create(data: z.infer<typeof createCategorySchema>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        gender: import(".prisma/client").$Enums.CategoryGender | null;
        name: string;
        slug: string;
        description: string | null;
        parentId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        showInNavBar: boolean;
        showInHomePage: boolean;
        sortOrder: number;
    }>;
    update(id: string, data: z.infer<typeof updateCategorySchema>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        gender: import(".prisma/client").$Enums.CategoryGender | null;
        name: string;
        slug: string;
        description: string | null;
        parentId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        showInNavBar: boolean;
        showInHomePage: boolean;
        sortOrder: number;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=categories.service.d.ts.map