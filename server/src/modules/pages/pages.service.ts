import prisma from '../../database/client';

export class PagesService {
  async createPage(data: { title: string; slug: string; content: string; isActive?: boolean }) {
    // Check if slug exists
    const existing = await prisma.page.findUnique({ where: { slug: data.slug } });
    if (existing) throw new Error('Slug already exists');

    return prisma.page.create({ data });
  }

  async updatePage(id: string, data: { title?: string; slug?: string; content?: string; isActive?: boolean }) {
    if (data.slug) {
      const existing = await prisma.page.findFirst({ where: { slug: data.slug, NOT: { id } } });
      if (existing) throw new Error('Slug already exists');
    }
    return prisma.page.update({ where: { id }, data });
  }

  async getPageBySlug(slug: string) {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) throw new Error('Page not found');
    return page;
  }

  async getPageById(id: string) {
    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) throw new Error('Page not found');
    return page;
  }

  async getAllPages(onlyActive = false) {
    return prisma.page.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { createdAt: 'desc' }
    });
  }

  async deletePage(id: string) {
    return prisma.page.delete({ where: { id } });
  }
}
