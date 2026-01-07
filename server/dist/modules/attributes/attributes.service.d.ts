import { createAttributeSchema, updateAttributeSchema } from './dto/attributes.dto';
import { z } from 'zod';
export declare class AttributesService {
    findAll(): Promise<({
        values: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            value: string;
            attributeId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    })[]>;
    findById(id: string): Promise<{
        values: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            value: string;
            attributeId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    create(data: z.infer<typeof createAttributeSchema>): Promise<{
        values: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            value: string;
            attributeId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }>;
    update(id: string, data: z.infer<typeof updateAttributeSchema>): Promise<({
        values: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            value: string;
            attributeId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        slug: string;
    }) | null>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=attributes.service.d.ts.map