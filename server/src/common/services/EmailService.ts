import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST,
      port: Number(process.env.ZOHO_SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.ZOHO_EMAIL_USER,
        pass: process.env.ZOHO_EMAIL_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.SENDER_NAME || 'Glitter Fashion'}" <${process.env.ZOHO_EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  generateVerificationTemplate(verificationLink: string) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">Welcome to Glitter Fashion!</h2>
        <p>Please verify your email address to activate your account and start shopping.</p>
        <p style="margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </p>
        <p>Or click this link: <a href="${verificationLink}">${verificationLink}</a></p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `;
  }
}
