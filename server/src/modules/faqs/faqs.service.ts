
import prisma from '../../database/client';

export class FaqsService {
  async getAll(onlyActive = false) {
    return prisma.faq.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { sortOrder: 'asc' }
    });
  }

  async getById(id: string) {
    return prisma.faq.findUnique({ where: { id } });
  }

  async create(data: { question: string; answer: string; isActive?: boolean; sortOrder?: number }) {
    return prisma.faq.create({ data });
  }

  async update(id: string, data: { question?: string; answer?: string; isActive?: boolean; sortOrder?: number }) {
    return prisma.faq.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.faq.delete({ where: { id } });
  }
}
