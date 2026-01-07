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
            name: string;
            slug: string;
            description: string | null;
            parentId: string | null;
            imageUrl: string | null;
            isActive: boolean;
            sortOrder: number;
            gender: import(".prisma/client").$Enums.CategoryGender | null;
        } | null;
        children: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string | null;
            parentId: string | null;
            imageUrl: string | null;
            isActive: boolean;
            sortOrder: number;
            gender: import(".prisma/client").$Enums.CategoryGender | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        description: string | null;
        parentId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        sortOrder: number;
        gender: import(".prisma/client").$Enums.CategoryGender | null;
    }>;
    create(data: z.infer<typeof createCategorySchema>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        description: string | null;
        parentId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        sortOrder: number;
        gender: import(".prisma/client").$Enums.CategoryGender | null;
    }>;
    update(id: string, data: z.infer<typeof updateCategorySchema>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
        description: string | null;
        parentId: string | null;
        imageUrl: string | null;
        isActive: boolean;
        sortOrder: number;
        gender: import(".prisma/client").$Enums.CategoryGender | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=categories.service.d.ts.map