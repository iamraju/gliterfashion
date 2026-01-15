
import prisma from '../../database/client';
import { AddressType } from '@prisma/client';

export class AddressesService {
  async findAll(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string, userId: string) {
    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address || address.userId !== userId) {
      throw new Error('Address not found');
    }

    return address;
  }

  async create(userId: string, data: any) {
    // If setting as default, unset other defaults of the same type for this user
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, type: data.type, isDefault: true },
        data: { isDefault: false }
      });
    }

    // Check if this is the first address of this type, if so, make it default
    const count = await prisma.address.count({
      where: { userId, type: data.type }
    });

    return prisma.address.create({
      data: {
        ...data,
        userId,
        isDefault: data.isDefault || count === 0
      }
    });
  }

  async update(id: string, userId: string, data: any) {
    const existingAddress = await this.findById(id, userId);

    if (data.isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { userId, type: existingAddress.type, isDefault: true },
        data: { isDefault: false }
      });
    }

    return prisma.address.update({
      where: { id },
      data
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);
    return prisma.address.delete({
      where: { id }
    });
  }

  async setDefault(id: string, userId: string) {
    const address = await this.findById(id, userId);

    await prisma.address.updateMany({
      where: { userId, type: address.type, isDefault: true },
      data: { isDefault: false }
    });

    return prisma.address.update({
      where: { id },
      data: { isDefault: true }
    });
  }
}
