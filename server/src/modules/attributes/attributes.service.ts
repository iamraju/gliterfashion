
import prisma from '../../database/client';
import { createAttributeSchema, updateAttributeSchema } from './dto/attributes.dto';
import { z } from 'zod';

export class AttributesService {
  async findAll() {
    return prisma.attribute.findMany({
      include: {
        values: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async findById(id: string) {
    const attribute = await prisma.attribute.findUnique({
      where: { id },
      include: {
        values: true
      }
    });

    if (!attribute) {
      throw new Error('Attribute not found');
    }
    return attribute;
  }

  async create(data: z.infer<typeof createAttributeSchema>) {
    const existingAttribute = await prisma.attribute.findUnique({ where: { slug: data.slug } });
    if (existingAttribute) {
      throw new Error('Attribute with this slug already exists');
    }

    return prisma.attribute.create({
      data: {
        name: data.name,
        slug: data.slug,
        values: {
          create: data.values.map(value => ({ value }))
        }
      },
      include: {
        values: true
      }
    });
  }

  async update(id: string, data: z.infer<typeof updateAttributeSchema>) {
    const existingAttribute = await prisma.attribute.findUnique({ where: { id } });
    if (!existingAttribute) {
      throw new Error('Attribute not found');
    }

    // Handle slug uniqueness
    if (data.slug) {
        const slugCheck = await prisma.attribute.findUnique({ where: { slug: data.slug } });
        if (slugCheck && slugCheck.id !== id) {
             throw new Error('Attribute with this slug already exists');
        }
    }

    // Transaction to update attribute and sync values if provided
    return prisma.$transaction(async (tx) => {
        // Update main attribute fields
        // Update main attribute fields
       const updateData: any = {};
       if (data.name) updateData.name = data.name;
       if (data.slug) updateData.slug = data.slug;

       const updatedAttribute = await tx.attribute.update({
            where: { id },
            data: updateData
        });

        // Check if values need to be updated
        // For simplicity, if values are provided, we delete old distinct ones or add new ones?
        // Actually simplest for now is: add new values, don't delete old usage? 
        // Or "sync" approach - delete all and recreate? -> Dangerous if used in products.
        // Requirement "CRUD for attributes and attribute keys" - let's assume partial updates just add/update is complex.
        
        // Strategy: append new values? Re-write all? 
        // User probably wants to Manage values. 
        // Let's implement a 'replace values' strategy or 'add' ?
        // For E-commerce, usually you Add. Deleting used values is bad.
        // But the input is a list of strings "values". 
        
        // Let's allow ADDING new values. And maybe separate endpoints for deleting specific value.
        // But sticking to the requested `create/update` flow.
        
        if (data.values) {
              // Only create non-existing values for this attribute
              // Or just delete all unused ones and re-create? Safer to just create missing.
              
              // Let's assume the user sends the Full List of desired values.
              // We find existing values, delete the ones NOT in the new list (check usage?), add new ones.
              
              // Too complex for first pass without checking usage.
              // Let's simplified: If values provided, we delete all and recreate (Caveat: Usage constraint). 
              // Prisma will throw error if value is used and we try to delete it?
              // "onDelete: Cascade" in Schema for AttributeValue -> references [id].
              // But ProductVariantAttribute references AttributeValue.
              // So we cannot delete used values.
              
              // Revised Strategy for Update: Ignore deletion for now, just Add new ones. 
              // Or better: AttributesService usually handles Attributes only, and maybe add/remove value methods.
              // But the DTO has "values".
              
              // Safest: Delete all current values for this attribute, recreate. 
              // If fails due to foreign key constraint (Variant usage), we let it fail and tell user "Cannot remove used values".
              
             // Retrieve current values
             const currentValues = await tx.attributeValue.findMany({ where: { attributeId: id } });
             const currentValuesMap = new Set(currentValues.map(v => v.value));
             
             // Values to add
             const valuesToAdd = data.values.filter(v => !currentValuesMap.has(v));
             
             if (valuesToAdd.length > 0) {
                 await tx.attributeValue.createMany({
                     data: valuesToAdd.map(value => ({ attributeId: id, value }))
                 });
             }
             
             // Values to delete (present in DB but not in new list)
             // This supports "removing" a value from the list logic.
             const inputValuesSet = new Set(data.values);
             const valuesToDeleteIds = currentValues
                .filter(v => !inputValuesSet.has(v.value))
                .map(v => v.id);
                
             if (valuesToDeleteIds.length > 0) {
                 // Try delete. If used, it will throw.
                 // We can catch and ignore? Or throw.
                 // Let's try/catch individually or just let it fail for now to enforce integrity.
                 await tx.attributeValue.deleteMany({
                     where: { id: { in: valuesToDeleteIds } }
                 });
             }
        }
        
        return tx.attribute.findUnique({ where: { id }, include: { values: true } });
    });
  }

  async delete(id: string) {
    const attribute = await prisma.attribute.findUnique({ where: { id } });
    if (!attribute) {
      throw new Error('Attribute not found');
    }
    // Delete - will fail if used in variants via ProductVariantAttribute due to FK
    await prisma.attribute.delete({ where: { id } });
    return { message: 'Attribute deleted successfully' };
  }
}
