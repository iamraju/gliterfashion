
import 'dotenv/config';
const { createMollieClient } = require('@mollie/api-client');

async function testMollie() {
  console.log('Testing Mollie Connection...');
  const key = process.env.MOLLIE_API_KEY;
  console.log('Key available:', !!key);
  console.log('Key prefix:', key ? key.substring(0, 5) : 'N/A');

  if (!key) {
    console.error('No MOLLIE_API_KEY found');
    return;
  }

  try {
    const mollieClient = createMollieClient({ apiKey: key });
    // Try to list payments or something simple to verify auth
    // API client doesn't have a verify method, but creating a payment with invalid data might throw a different error,
    // or listing payments.
    console.log('Client created. Attempting to list payments (limit 1)...');
    const payments = await mollieClient.payments.page({ limit: 1 });
    console.log('Success! Connection valid.');
    console.log('Payments found:', payments.length);
  } catch (error: any) {
    console.error('Mollie Error:', error.message);
    if (error.title) console.error('Error Title:', error.title);
    if (error.detail) console.error('Error Detail:', error.detail);
  }
}

testMollie();
