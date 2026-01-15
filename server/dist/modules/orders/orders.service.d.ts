import { OrderStatus } from '@prisma/client';
export declare class OrdersService {
    findAll(role: string, userId: string, sellerId?: string): Promise<({
        orderItems: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            sellerId: string;
            orderId: string;
            productVariantId: string;
            productName: string;
            variantDetails: import("@prisma/client/runtime/client").JsonValue;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            commissionRate: import("@prisma/client-runtime-utils").Decimal;
            commissionAmount: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        userId: string | null;
        orderNumber: string;
        guestEmail: string | null;
        guestPhone: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        shippingAmount: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        paymentMethod: string | null;
        shippingAddressId: string;
        billingAddressId: string;
        notes: string | null;
    })[]>;
    findById(id: string, role: string, userId: string, sellerId?: string): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        } | null;
        orderItems: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            sellerId: string;
            orderId: string;
            productVariantId: string;
            productName: string;
            variantDetails: import("@prisma/client/runtime/client").JsonValue;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            commissionRate: import("@prisma/client-runtime-utils").Decimal;
            commissionAmount: import("@prisma/client-runtime-utils").Decimal;
        }[];
        billingAddress: {
            type: import(".prisma/client").$Enums.AddressType;
            city: string;
            state: string;
            country: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            fullName: string;
            phone: string;
            addressLine1: string;
            addressLine2: string | null;
            postalCode: string;
            isDefault: boolean;
        };
        shippingAddress: {
            type: import(".prisma/client").$Enums.AddressType;
            city: string;
            state: string;
            country: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            fullName: string;
            phone: string;
            addressLine1: string;
            addressLine2: string | null;
            postalCode: string;
            isDefault: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        userId: string | null;
        orderNumber: string;
        guestEmail: string | null;
        guestPhone: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        shippingAmount: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        paymentMethod: string | null;
        shippingAddressId: string;
        billingAddressId: string;
        notes: string | null;
    }>;
    updateStatus(id: string, status: OrderStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        userId: string | null;
        orderNumber: string;
        guestEmail: string | null;
        guestPhone: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        shippingAmount: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        paymentMethod: string | null;
        shippingAddressId: string;
        billingAddressId: string;
        notes: string | null;
    }>;
}
//# sourceMappingURL=orders.service.d.ts.map