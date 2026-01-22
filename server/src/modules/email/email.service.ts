import nodemailer from 'nodemailer';
import { Order, OrderItem } from '@prisma/client';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST,
      port: Number(process.env.ZOHO_SMTP_PORT),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.ZOHO_EMAIL_USER,
        pass: process.env.ZOHO_EMAIL_PASS,
      },
    });
  }

  async sendOrderConfirmation(email: string, order: any, orderItems: any[]) {
    try {
      const mailOptions = {
        from: `"${process.env.SENDER_NAME}" <${process.env.ZOHO_EMAIL_USER}>`,
        to: email, // Use the provided email (user or guest)
        subject: `Order Confirmation #${order.orderNumber}`,
        html: this.generateOrderEmailTemplate(order, orderItems),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw to prevent blocking the order process
      return null;
    }
  }

  private generateOrderEmailTemplate(order: any, orderItems: any[]) {
    const itemsHtml = orderItems.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.productName}</strong><br>
          <small>Qty: ${item.quantity}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${order.currency || 'NPR'} ${Number(item.totalPrice).toFixed(2)}
        </td>
      </tr>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your order!</h2>
        <p>Hi ${order.shippingFullName || 'Customer'},</p>
        <p>Your order <strong>${order.orderNumber}</strong> has been successfully placed.</p>
        
        <h3>Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Subtotal</td>
              <td style="padding: 10px; text-align: right;">${Number(order.subtotal).toFixed(2)}</td>
            </tr>
             <tr>
              <td style="padding: 10px; font-weight: bold;">Shipping</td>
              <td style="padding: 10px; text-align: right;">${Number(order.shippingAmount).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Total</td>
              <td style="padding: 10px; text-align: right; font-weight: bold;">${order.currency || 'NPR'} ${Number(order.totalAmount).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <p>We will notify you when your order is shipped.</p>
        
        <p>Best regards,<br>Glitter Fashion Team</p>
      </div>
    `;
  }
  async sendOrderStatusUpdate(email: string, order: any) {
    try {
      const mailOptions = {
        from: `"${process.env.SENDER_NAME}" <${process.env.ZOHO_EMAIL_USER}>`,
        to: email,
        subject: `Order Update #${order.orderNumber} - ${order.status}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Order Status Update!</h2>
            <p>Hi ${order.shippingFullName || 'Customer'},</p>
            <p>The status of your order <strong>${order.orderNumber}</strong> has been updated to <strong>${order.status}</strong>.</p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>Glitter Fashion Team</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Status update email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending status update email:', error);
      return null;
    }
  }
}
