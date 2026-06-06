import prisma from '../../database/client';

export class BannersService {
  async findAll() {
    return prisma.banner.findMany({
      orderBy: {
        sortOrder: 'asc'
      }
    });
  }

  async findById(id: string) {
    const banner = await prisma.banner.findUnique({
      where: { id }
    });
    if (!banner) throw new Error('Banner not found');
    return banner;
  }

  async create(data: any) {
    return prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        link: data.link,
        buttonText: data.buttonText,
        align: data.align,
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: data.sortOrder !== undefined ? parseInt(data.sortOrder) : 0
      }
    });
  }

  async update(id: string, data: any) {
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new Error('Banner not found');

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.imageUrl) updateData.imageUrl = data.imageUrl;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.buttonText !== undefined) updateData.buttonText = data.buttonText;
    if (data.align) updateData.align = data.align;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = parseInt(data.sortOrder);

    return prisma.banner.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string) {
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new Error('Banner not found');
    return prisma.banner.delete({ where: { id } });
  }
}
