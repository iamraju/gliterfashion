
import 'dotenv/config';
import { createMollieClient } from '@mollie/api-client';

async function testCurrency() {
  const apiKey = process.env.MOLLIE_API_KEY?.trim();
  if (!apiKey) {
    console.error('No API key');
    return;
  }
  
  const mollieClient = createMollieClient({ apiKey });
  
  console.log('Testing EUR Payment...');
  try {
    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: '10.00'
      },
      description: 'Test EUR Payment',
      redirectUrl: 'https://example.com/redirect',
      webhookUrl: 'https://example.com/webhook' 
    });
    console.log('EUR Payment Created:', payment.id, payment.getCheckoutUrl());
  } catch (e: any) {
    console.error('EUR Failed:', e.message);
  }

  console.log('Testing NPR Payment...');
  try {
    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'NPR',
        value: '1000.00'
      },
      description: 'Test NPR Payment',
      redirectUrl: 'https://example.com/redirect',
      webhookUrl: 'https://example.com/webhook'
    });
    console.log('NPR Payment Created:', payment.id, payment.getCheckoutUrl());
  } catch (e: any) {
    console.error('NPR Failed:', e.message);
  }
}

testCurrency();
