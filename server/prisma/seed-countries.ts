import 'dotenv/config';
import axios from 'axios';
import prisma from '../src/database/client';

async function seedCountries() {
  console.log('🌍 Fetching countries from REST Countries API...');
  
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,ccn3');
    const countries = response.data;
    
    console.log(`📥 Fetched ${countries.length} countries`);
    console.log('💾 Seeding database...');
    
    let count = 0;
    for (const country of countries) {
      try {
        await prisma.country.upsert({
          where: { code: country.cca2 },
          update: {
            name: country.name.common,
            code3: country.cca3,
            numCode: country.ccn3 || null
          },
          create: {
            name: country.name.common,
            code: country.cca2,
            code3: country.cca3,
            numCode: country.ccn3 || null
          }
        });
        count++;
        if (count % 50 === 0) {
          console.log(`  ✓ Processed ${count}/${countries.length} countries`);
        }
      } catch (error: any) {
        console.error(`  ✗ Failed to seed ${country.name.common}:`, error.message);
      }
    }
    
    console.log(`✅ Successfully seeded ${count} countries`);
    
    // Verify
    const totalCountries = await prisma.country.count();
    console.log(`📊 Total countries in database: ${totalCountries}`);
    
  } catch (error: any) {
    console.error('❌ Error seeding countries:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCountries()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
