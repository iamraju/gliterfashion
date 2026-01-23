import { Request, Response } from "express";
import prisma from "../../database/client";
import { v4 as uuidv4 } from "uuid";

import { PaymentService } from "../payment/payment.service";
import { EmailService } from "../email/email.service";

const paymentService = new PaymentService();
const emailService = new EmailService();

export class CheckoutController {
  async placeOrder(req: Request, res: Response) {
    try {
      const {
        shippingAddress,
        billingAddress,
        paymentMethodId,
        shippingMethodId,
        guestEmail,
        guestPhone,
        cartId,
        notes,
      } = req.body;

      const userId = (req as any).user?.userId;

      // Check Email Verification for logged-in users
      if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && user.role === 'CUSTOMER' && !user.isEmailVerified) {
           return res.status(403).json({ 
             message: "Please verify your email address to place an order. Check your inbox for the verification link." 
           });
        }
      }

      // ... (existing validation logic for cart, methods) ...
      // 1. Find the cart
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: { include: { variant: { include: { product: true } } } },
        },
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty or not found" });
      }

      // 2. Fetch selected methods
      const [shippingMethod, paymentMethod] = await Promise.all([
        prisma.shippingMethod.findUnique({ where: { id: shippingMethodId } }),
        prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } }),
      ]);

      if (!shippingMethod)
        return res.status(400).json({ message: "Invalid shipping method" });
      if (!paymentMethod)
        return res.status(400).json({ message: "Invalid payment method" });

      // 3. Calculate totals
      let subtotal = 0;
      cart.items.forEach((item) => {
        // Determine effective price: Price At Add > Product Sale Price (if not set in cart) > Variant Price
        // Since we now update priceAtAdd on cart interactions, we should trust it first.
        let itemPrice = parseFloat(item.priceAtAdd?.toString() || item.variant.price?.toString());
        
        subtotal += itemPrice * item.quantity;
      });

      const shippingAmount = parseFloat(
        shippingMethod.charge?.toString() || "0"
      );
      const paymentCharge = parseFloat(paymentMethod.charge?.toString() || "0");
      const taxAmount = (subtotal + shippingAmount + paymentCharge) * 0.13; // 13% VAT
      const totalAmount = subtotal + shippingAmount + taxAmount + paymentCharge;

      // 4. Create Order in Transaction
      const order = await prisma.$transaction(async (tx) => {
        const orderNumber = `ORD-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`;

        // Prepare billing address (default to shipping if not provided)
        const finalBillingAddress = billingAddress || shippingAddress;

        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: userId || null,
            guestEmail: userId ? null : guestEmail,
            guestPhone: userId ? null : guestPhone,
            subtotal,
            shippingAmount,
            taxAmount,
            discountAmount: 0,
            totalAmount,
            paymentMethod: paymentMethod.title,
            
            // Shipping Address Fields
            shippingFullName: shippingAddress.fullName,
            shippingPhone: shippingAddress.phone,
            shippingAddressLine1: shippingAddress.addressLine1,
            shippingAddressLine2: shippingAddress.addressLine2 || null,
            shippingCity: shippingAddress.city,
            shippingState: shippingAddress.state,
            shippingPostalCode: shippingAddress.postalCode,
            shippingCountry: shippingAddress.country,

            // Billing Address Fields
            billingFullName: finalBillingAddress.fullName,
            billingPhone: finalBillingAddress.phone,
            billingAddressLine1: finalBillingAddress.addressLine1,
            billingAddressLine2: finalBillingAddress.addressLine2 || null,
            billingCity: finalBillingAddress.city,
            billingState: finalBillingAddress.state,
            billingPostalCode: finalBillingAddress.postalCode,
            billingCountry: finalBillingAddress.country,

            notes,
            shippingNotes: req.body.shippingNotes,
            paymentNotes: req.body.paymentNotes,
            paymentProof: req.body.paymentProof,
            status: "PENDING",
            paymentStatus: "PENDING",
            orderItems: {
              create: cart.items.map((item) => ({
                sellerId: item.variant.product.sellerId || "",
                productVariantId: item.productVariantId,
                productName: item.variant.product.name,
                variantDetails: {},
                quantity: item.quantity,
                unitPrice: item.priceAtAdd || item.variant.price,
                totalPrice:
                  parseFloat(
                    item.priceAtAdd?.toString() || item.variant.price?.toString()
                  ) * item.quantity,
                commissionRate: 10,
                commissionAmount:
                  parseFloat(
                    item.priceAtAdd?.toString() || item.variant.price?.toString()
                  ) *
                  item.quantity *
                  0.1,
              })),
            },
          },
          include: {
            orderItems: true
          }
        });

        // Clear Cart ONLY if not redirecting to Payment Gateway (Bank Transfer is manual, so clear card)
        const methodTitle = paymentMethod.title.toLowerCase();
        const isExternalPayment = methodTitle.includes('esewa') || methodTitle.includes('khalti') || methodTitle.includes('paypal') || methodTitle.includes('mollie') || methodTitle.includes('stripe');
        
        if (!isExternalPayment) {
             await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        return newOrder;
      });

      // 5. Build Payment Response
      let paymentData: any = null;
      const methodTitle = paymentMethod.title.toLowerCase();

      if (methodTitle.includes("esewa")) {
        // eSewa Integration
        const esewaConfig = await paymentService.getEsewaConfig();
        const signature = await paymentService.generateEsewaSignature(
          totalAmount.toString(),
          order.orderNumber,
          esewaConfig.merchantId, 
          esewaConfig.secretKey
        );

        paymentData = {
          type: "esewa",
          actionUrl: esewaConfig.paymentUrl, 
          params: {
            amount: totalAmount,
            tax_amount: 0, 
            total_amount: totalAmount,
            transaction_uuid: order.orderNumber,
            product_code: esewaConfig.merchantId,
            product_service_charge: 0,
            product_delivery_charge: 0,
            success_url: esewaConfig.successUrl,
            failure_url: esewaConfig.failureUrl,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature: signature,
          },
        };
      } else if (methodTitle.includes("khalti")) {
         // Khalti
        paymentData = {
          type: "khalti",
          productIdentity: order.orderNumber,
          productName: `Order ${order.orderNumber}`,
          productUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/paypal/success`,
          amount: totalAmount * 100, 
        };
      } else if (methodTitle.includes("paypal")) {
        // PayPal Integration
        const config = await paymentService.getPayPalConfig();
        const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/paypal/success`;
        const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/paypal/cancel`;
        
        try {
          const createOrderResult = await paymentService.createPayPalOrder(
            totalAmount, 
            order.orderNumber,
            returnUrl,
            cancelUrl
          );
          
          paymentData = {
            type: "paypal",
            actionUrl: createOrderResult.approvalUrl,
            orderId: createOrderResult.id,
            mode: config.mode
          };
          
          await prisma.order.update({
            where: { id: order.id },
            data: { notes: `PayPal Order ID: ${createOrderResult.id}` }
          });
          
        } catch (err) {
           console.error("Failed to create PayPal order", err);
           throw new Error("Failed to initialize PayPal payment");
        }

      } else if (methodTitle.includes("mollie")) {
        // Mollie Integration
        const mollieConfig = await paymentService.getMollieConfig();
        // Mollie webhook and redirect URLs
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/mollie/verify?orderId=${order.orderNumber}`; // Frontend intermediate page or direct capture?
        // Better: Frontend success page which calls backend verify
        const webhookUrl = `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/checkout/mollie/webhook`; // Must be public for webhook
        
        try {
             const payment = await paymentService.createMolliePayment(
                 totalAmount,
                 order.orderNumber,
                 redirectUrl,
                 webhookUrl 
             );
             
             paymentData = {
                 type: "mollie",
                 actionUrl: payment.approvalUrl,
                 orderId: order.orderNumber,
                 mode: mollieConfig.mode
             };
        } catch(err) {
            console.error("Failed to create Mollie payment", err);
            throw new Error("Failed to initialize Mollie payment");
        }
      } else if (methodTitle.includes("bank") || methodTitle.includes("transfer")) {
          // Bank Transfer
          // Already handled: paymentProof should be in req.body and saved to order.
          // Order status is PENDING, Payment Status PENDING.
          // Frontend should have uploaded the image and sent the path.
          paymentData = {
              type: "bank_transfer",
              message: "Order placed successfully. Please wait for verification."
          };
      }


      // Send Order Confirmation Email (Fire and forget or await, but catch error inside service)
      // Determine email to send to: userId -> user email (need to fetch?) or guestEmail
      // But we have userId, we might need to fetch user email if not in order object directly (order has guestEmail only if guest)
      // Actually order model has userId. 
      // If userId is present, we should find the user email. 
      // Or we can rely on what we have. 
      // Wait, let's fetch user email if needed or use guestEmail.
      // Better: pass everything we know. The email logic in service uses 'email' arg.
      
      let recipientEmail = order.guestEmail;
      if (!recipientEmail && order.userId) {
          // Fetch user email if not guest. 
          // We can optimize by fetching user email earlier or assuming it's in req.user token if valid
          // But req.user might not have email.
          // Let's quickly fetch it or modify logic. 
          // For now, let's assume if it's a registered user, we might want to fetch it.
          // OR, simply: The checkout payload might have email in billing/shipping? No.
          // Let's do a quick lookup if missing.
          const user = await prisma.user.findUnique({ where: { id: order.userId } });
          recipientEmail = user?.email || null;
      }
      
      if (recipientEmail) {
          await emailService.sendOrderConfirmation(recipientEmail, order, order.orderItems);
      }

      res.status(201).json({ order, paymentData });
    } catch (error: any) {
      console.error("Checkout error:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to place order" });
    }
  }

  async capturePayPalPayment(req: Request, res: Response) {
    try {
      const { token } = req.body; // PayPal returns token (Order ID)
      if (!token) return res.status(400).json({ message: "Token is required" });

      const captureResult = await paymentService.capturePayPalOrder(token);
      
      if (captureResult.status === 'COMPLETED') {
         // Find our order by PayPal ID stored in notes? Or we need to pass our order ID in 'referenceId' which we did.
         // result.purchaseUnits[0].referenceId should have our Order Number
         const ourOrderNumber = captureResult.purchaseUnits?.[0]?.referenceId;
         
         if (ourOrderNumber) {
           await prisma.order.update({
             where: { orderNumber: ourOrderNumber },
             data: { 
               status: 'CONFIRMED', 
               paymentStatus: 'PAID' 
             }
           });
           
           // Clear cart for the user if not handled
           // But here we might not have the user's session easily if it's a server-to-server or public callback
           // Usually the frontend calls this, so we have the user context
         }

         return res.json({ status: 'COMPLETED', orderId: ourOrderNumber });
      }

      res.json({ status: captureResult.status });
    } catch (error: any) {
      console.error("PayPal Capture Error:", error);
      res.status(500).json({ message: "Failed to capture payment" });
    }
  }
}
