import prisma from '../../database/client';

export class ContactService {
  async submitContactForm(data: { fullName: string; email: string; phone?: string | null; message?: string | null }) {
    return prisma.contactSubmission.create({
      data,
    });
  }

  async getAllSubmissions() {
    return prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSubmission(id: string) {
    return prisma.contactSubmission.delete({
      where: { id },
    });
  }
}
