import { z } from 'zod';
export declare const createAttributeSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    values: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const updateAttributeSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    values: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=attributes.dto.d.ts.map