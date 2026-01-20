
import prisma from '../../database/client';

export class TestimonialsService {
  async getAll(onlyActive = false) {
    return prisma.testimonial.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { createdAt: 'desc' }
    });
  }

  async getById(id: string) {
    return prisma.testimonial.findUnique({ where: { id } });
  }

  async create(data: any) {
    return prisma.testimonial.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.testimonial.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.testimonial.delete({ where: { id } });
  }
}
