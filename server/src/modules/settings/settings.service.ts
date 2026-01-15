import prisma from '../../database/client';
import { CreateShippingMethodDto, UpdateShippingMethodDto } from './dto/shipping-method.dto';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-method.dto';

export class SettingsService {
  // Shipping Methods
  async getAllShippingMethods() {
    return prisma.shippingMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getShippingMethodById(id: string) {
    return prisma.shippingMethod.findUnique({
      where: { id },
    });
  }

  async createShippingMethod(data: any) {
    return prisma.shippingMethod.create({
      data,
    });
  }

  async updateShippingMethod(id: string, data: any) {
    return prisma.shippingMethod.update({
      where: { id },
      data,
    });
  }

  async deleteShippingMethod(id: string) {
    return prisma.shippingMethod.delete({
      where: { id },
    });
  }

  // Payment Methods
  async getAllPaymentMethods() {
    return prisma.paymentMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentMethodById(id: string) {
    return prisma.paymentMethod.findUnique({
      where: { id },
    });
  }

  async createPaymentMethod(data: any) {
    return prisma.paymentMethod.create({
      data,
    });
  }

  async updatePaymentMethod(id: string, data: any) {
    return prisma.paymentMethod.update({
      where: { id },
      data,
    });
  }

  async deletePaymentMethod(id: string) {
    return prisma.paymentMethod.delete({
      where: { id },
    });
  }

  // Site Settings
  async getAllSettings() {
    return prisma.setting.findMany({
      orderBy: { key: 'asc' }
    });
  }

  async updateSettings(settings: { key: string; value: string; group?: string; label?: string; type?: string }[]) {
    const promises = settings.map((setting) => {
      return prisma.setting.upsert({
        where: { key: setting.key },
        update: { 
          value: setting.value,
          ...(setting.group && { group: setting.group }),
          ...(setting.label && { label: setting.label }),
          ...(setting.type && { type: setting.type })
        },
        create: { 
          key: setting.key, 
          value: setting.value,
          group: setting.group || 'GENERAL',
          label: setting.label || setting.key, // Default label to key if not provided
          type: setting.type || 'text'
        }
      });
    });
    
    return Promise.all(promises);
  }
}
