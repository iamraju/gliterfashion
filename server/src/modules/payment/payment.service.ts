import prisma from '../../database/client';
import crypto from 'crypto';
import axios from 'axios';
import { createMollieClient } from '@mollie/api-client';

export class PaymentService {
  
  // --- eSewa Integration ---

  /**
   * Generates signature for eSewa payment
   */
  async generateEsewaSignature(amount: string, transactionUuid: string, productCode: string, secretKey: string) {
    const data = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(data);
    return hmac.digest('base64');
  }

  /**
   * get eSewa Config from DB
   */
  async getEsewaConfig() {
    const settings = await prisma.setting.findMany({
      where: { group: 'PAYMENT' }
    });

    // Helper to get config from ENV -> DB -> Default
    const getConfig = (envKey: string, dbKey: string, defaultValue: string) => {
        return process.env[envKey] || settings.find(s => s.key === dbKey)?.value || defaultValue;
    };

    return {
      merchantId: getConfig('ESEWA_MERCHANT_ID', 'ESEWA_MERCHANT_ID', 'EPAYTEST'),
      secretKey: getConfig('ESEWA_SECRET_KEY', 'ESEWA_SECRET_KEY', '8gBm/:&EnhH.1/q'),
      successUrl: getConfig('ESEWA_SUCCESS_URL', 'ESEWA_SUCCESS_URL', 'http://localhost:5173/checkout/esewa/success'),
      failureUrl: getConfig('ESEWA_FAILURE_URL', 'ESEWA_FAILURE_URL', 'http://localhost:5173/checkout/esewa/failure'),
      paymentUrl: getConfig('ESEWA_PAYMENT_URL', 'ESEWA_PAYMENT_URL', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form')
    };
  }


  // --- Khalti Integration ---

  /**
   * Verify Khalti Transaction
   * @param token Payment token from client
   * @param amount Amount in paisa
   */
  async verifyKhaltiPayment(token: string, amount: number) {
    const secretKeySetting = await prisma.setting.findUnique({ where: { key: 'KHALTI_SECRET_KEY' } });
    const KHALTI_SECRET_KEY = secretKeySetting?.value || 'test_secret_key_f13b320d7533429690d81023774635d3';

    try {
      const response = await axios.post(
        'https://khalti.com/api/v2/payment/verify/',
        { token, amount },
        {
          headers: {
            Authorization: `Key ${KHALTI_SECRET_KEY}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Khalti Verification Failed:', error.response?.data || error.message);
      throw new Error('Khalti payment verification failed');
    }
  }
  // --- PayPal Integration ---

  private getPayPalClient() {
    const { Client, Environment, LogLevel } = require('@paypal/paypal-server-sdk');
    
    console.log('PayPal Config Check:', {
      clientId: process.env.PAYPAL_CLIENT_ID ? 'Exists' : 'Missing',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET ? 'Exists' : 'Missing',
      mode: process.env.PAYMENT_MODE
    });

    return new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID || '',
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET || ''
      },
      environment: process.env.PAYMENT_MODE === 'production' ? Environment.Production : Environment.Sandbox,
      logLevel: LogLevel.Info
    });
  }
  
  async getPayPalConfig() {
    const mode = process.env.PAYMENT_MODE || 'sandbox';
    const isSandbox = mode === 'sandbox';

    return {
      mode,
      clientId: process.env.PAYPAL_CLIENT_ID,
      actionUrl: isSandbox 
        ? 'https://www.sandbox.paypal.com/checkout/now?token='
        : 'https://www.paypal.com/checkout/now?token='
    };
  }

  async createPayPalOrder(amount: number, orderId: string, returnUrl: string, cancelUrl: string) {
    const { OrdersController } = require('@paypal/paypal-server-sdk');
    const client = this.getPayPalClient();
    const ordersController = new OrdersController(client);

    // Convert NPR to USD (Approx 135)
    const amountUSD = (amount / 135).toFixed(2);

    try {
      const { result } = await ordersController.createOrder({
        body: {
          intent: "CAPTURE",
          purchaseUnits: [
            {
              referenceId: orderId,
              amount: {
                currencyCode: "USD",
                value: amountUSD
              },
              description: `Order #${orderId} - Glitter Fashion`
            }
          ],
          applicationContext: {
             returnUrl: returnUrl,
             cancelUrl: cancelUrl,
             userAction: "PAY_NOW"
          }
        }
      });
      
      const approvalLink = result.links.find((link: any) => link.rel === 'approve');
      return {
        id: result.id,
        approvalUrl: approvalLink?.href
      };
    } catch (error) {
      console.error('PayPal Create Order Error:', error);
      throw error;
    }
  }

  async capturePayPalOrder(paypalOrderId: string) {
    const { OrdersController } = require('@paypal/paypal-server-sdk');
    const client = this.getPayPalClient();
    const ordersController = new OrdersController(client);

    try {
      const { result } = await ordersController.captureOrder({
        id: paypalOrderId,
        prefer: "return=representation"
      });
      return result;
    } catch (error) {
      console.error('PayPal Capture Order Error:', error);
      throw error;
    }
  }

  // --- Mollie Integration ---

  async getMollieConfig() {
    const mode = process.env.PAYMENT_MODE || 'sandbox';
    const isSandbox = mode === 'sandbox';

    return {
      mode,
      apiKey: process.env.MOLLIE_API_KEY,
      actionUrl: isSandbox
        ? (process.env.MOLLIE_SANDBOX_URL || 'https://www.mollie.com/checkout/select-method/')
        : (process.env.MOLLIE_LIVE_URL || 'https://www.mollie.com/checkout/select-method/')
    };
  }

  async createMolliePayment(amount: number, orderId: string, redirectUrl: string, webhookUrl: string) {
    const apiKey = process.env.MOLLIE_API_KEY?.trim();

    if (!apiKey) {
      console.error('Mollie API Key is missing');
      throw new Error('Mollie Configuration Error: Missing API Key');
    }

    // console.log('Initializing Mollie with Key Prefix:', apiKey.substring(0, 4) + '...');
    const mollieClient = createMollieClient({ apiKey });
    
    // Convert NPR to EUR (Approx 145)
    // Mollie requires a supported currency (usually EUR)
    const amountEUR = (amount / 145).toFixed(2);

    try {
      const payment = await mollieClient.payments.create({
        amount: {
          currency: 'EUR', 
          value: amountEUR
        },
        description: `Order #${orderId}`,
        redirectUrl: redirectUrl,
        webhookUrl: webhookUrl,
        metadata: {
          order_id: orderId
        }
      });

      return {
        id: payment.id,
        approvalUrl: payment.getCheckoutUrl()
      };
    } catch (error: any) {
      console.error('Mollie Create Payment Error:', error.message);
      if (error.title) console.error('Mollie Error Title:', error.title);
      if (error.detail) console.error('Mollie Error Detail:', error.detail);
      if (error.links) console.error('Mollie Error Links:', JSON.stringify(error.links));
      throw error;
    }
  }

  async getMolliePayment(paymentId: string) {
    const apiKey = process.env.MOLLIE_API_KEY?.trim();
    if (!apiKey) throw new Error('Missing Mollie API Key');
    
    const mollieClient = createMollieClient({ apiKey });
    
    try {
      const payment = await mollieClient.payments.get(paymentId);
      return payment;
    } catch (error) {
       console.error('Mollie Get Payment Error:', error);
       throw error;
    }
  }
}
