
import dotenv from 'dotenv';
import path from 'path';
import { EmailService } from '../src/common/services/EmailService';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  console.log('Testing Email Service...');
  console.log('SMTP Config:', {
    host: process.env.ZOHO_SMTP_HOST,
    port: process.env.ZOHO_SMTP_PORT,
    user: process.env.ZOHO_EMAIL_USER,
    // pass: '***' 
  });

  const emailService = new EmailService();

  try {
    const info = await emailService.sendEmail({
      to: process.env.ZOHO_EMAIL_USER || 'test@example.com', // Send to self for testing
      subject: 'Test Email from Glitter Fashion',
      html: '<h1>It Works!</h1><p>This is a test email.</p>'
    });
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

main();
