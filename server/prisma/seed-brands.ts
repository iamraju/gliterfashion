
import 'dotenv/config';
import prisma from '../src/database/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Reusing ensureImage logic
async function ensureImage(url: string, targetDir: string, filename: string): Promise<string> {
  const uploadDir = path.join(__dirname, '../uploads');
  const targetPath = path.join(uploadDir, targetDir);
  const filePath = path.join(targetPath, filename);
  const relativePath = path.join(targetDir, filename);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.log(`Image already exists: ${relativePath}`);
    return relativePath;
  }

  try {
    console.log(`Downloading: ${url} -> ${relativePath}`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error: Error | null = null;
      writer.on('error', (err: any) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve(relativePath);
        }
      });
    });
  } catch (error: any) {
    console.error(`Failed to download ${url}:`, error.message);
    return '';
  }
}

async function main() {
  console.log('Seeding Brands...');

  const brands = [
    {
      name: 'Nike',
      slug: 'nike',
      description: 'Just Do It.',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', // Using SVG might be tricky if backend expects images, but let's try or use PNG
      // Better to use PNG for consistency if resize/processing is involved, but usually direct serve is fine.
      // Let's use a reliable PNG source or Unsplash if possible, but for brands specific logos are needed.
      // Using Wikipedia/WorldVectorLogo usually returns SVGs. 
      // Let's us dummy clear logo placeholders from simple URLs if specific ones are hard to deep-link reliably.
      // Or use a placeholder service string if we can't reliably dl external brand logos without copyright or hotlink issues.
      // Actually, user asked for "sample logo".
      // I'll use some reliable placeholders or generic fashion logos if specific ones fail, but let's try standard ones.
      // Wikimedia requires User-Agent sometimes. 
      // Let's use simple logos.
      logoExternal: 'https://cdn.worldvectorlogo.com/logos/nike-4.svg',
      filename: 'nike.svg'
    },
    {
      name: 'The North Face',
      slug: 'the-north-face',
      description: 'Never Stop Exploring.',
      logoExternal: 'https://cdn.worldvectorlogo.com/logos/the-north-face-1.svg',
      filename: 'north_face.svg'
    },
    {
      name: 'Fila',
      slug: 'fila',
      description: 'Iconic Italian sports style.',
      logoExternal: 'https://cdn.worldvectorlogo.com/logos/fila-9.svg',
      filename: 'fila.svg'
    },
    {
      name: 'Adidas',
      slug: 'adidas',
      description: 'Impossible is Nothing.',
      logoExternal: 'https://cdn.worldvectorlogo.com/logos/adidas-9.svg',
      filename: 'adidas.svg'
    },
    {
      name: 'Puma',
      slug: 'puma',
      description: 'Forever Faster.',
      logoExternal: 'https://cdn.worldvectorlogo.com/logos/puma-logo.svg',
      filename: 'puma.svg'
    }
  ];

  for (const brand of brands) {
    const localPath = await ensureImage(brand.logoExternal, 'brands', brand.filename);
    
    // Check if brand exists
    const existing = await prisma.brand.findUnique({
        where: { slug: brand.slug }
    });

    if (existing) {
        console.log(`Brand already exists: ${brand.name}`);
        // Optional: update logo if needed, but skipping for idempotency speed
        continue;
    }

    if (localPath) {
        await prisma.brand.create({
            data: {
                name: brand.name,
                slug: brand.slug,
                description: brand.description,
                logoUrl: localPath,
                isActive: true
            }
        });
        console.log(`Created brand: ${brand.name}`);
    } else {
        console.warn(`Skipping brand ${brand.name} due to logo download failure.`);
         // Create without logo?
         await prisma.brand.create({
            data: {
                name: brand.name,
                slug: brand.slug,
                description: brand.description,
                isActive: true
            }
        });
        console.log(`Created brand (no logo): ${brand.name}`);
    }
  }

  console.log('Brands Seeding Done.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
