# Postman API Documentation

Base URL: `http://localhost:4000/api/backoffice`

### 1. Register (Seller)

**URL**: `/auth/register`
**Method**: `POST`
**Payload**:

```json
{
  "email": "seller@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "SELLER",
  "companyName": "Glitter Fashion Inc.",
  "streetAddress": "123 Fashion St",
  "city": "New York",
  "state": "NY",
  "country": "USA"
}
```

### 2. Register (Customer)

**URL**: `/auth/register`
**Method**: `POST`
**Payload**:

```json
{
  "email": "customer@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "CUSTOMER"
}
```

### 3. Login

**URL**: `/auth/login`
**Method**: `POST`
**Payload**:

```json
{
  "email": "seller@example.com",
  "password": "password123"
}
```

### 4. Forgot Password

**URL**: `/auth/forgot-password`
**Method**: `POST`
**Payload**:

```json
{
  "email": "seller@example.com"
}
```

### 5. Reset Password

**URL**: `/auth/reset-password`
**Method**: `POST`
**Payload**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newpassword456"
}
```

### 6. Create User (Super Admin)

**URL**: `/users`
**Method**: `POST`
**Headers**:

- `Authorization`: `Bearer <token>`
  **Payload**:

```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "role": "CUSTOMER"
}
```

### 7. Get All Users (Super Admin)

**URL**: `/users`
**Method**: `GET`
**Headers**:

- `Authorization`: `Bearer <token>`

### 8. Get User Details

**URL**: `/users/:id`
**Method**: `GET`
**Headers**:

- `Authorization`: `Bearer <token>`

### 9. Update User

**URL**: `/users/:id`
**Method**: `PATCH`
**Headers**:

- `Authorization`: `Bearer <token>`
  **Payload**:

```json
{
  "firstName": "Updated Name",
  "lastName": "Updated Lastname",
  "role": "SELLER"
}
```

### 10. Delete User (Super Admin)

**URL**: `/users/:id`
**Method**: `DELETE`
**Headers**:

- `Authorization`: `Bearer <token>`

### 11. Get Profile

**URL**: `/users/me`
**Method**: `GET`
**Headers**:

- `Authorization`: `Bearer <token>`

### 12. Update Profile

**URL**: `/users/me`
**Method**: `PATCH`
**Headers**:

- `Authorization`: `Bearer <token>`
  **Payload**:

```json
{
  "firstName": "Updated Name",
  "lastName": "Updated Lastname"
}
```

### 13. Change Password

**URL**: `/users/me/change-password`
**Method**: `POST`
**Headers**:

- `Authorization`: `Bearer <token>`
  **Payload**:

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### 14. Create Category (Super Admin)

**URL**: `/categories`
**Method**: `POST`
**Headers**:

- `Authorization`: `Bearer <token>`
  **Payload**:

```json
{
  "name": "Men's Fashion",
  "slug": "mens-fashion",
  "parentId": "optional-uuid"
}
```

### 12. Create Attribute (Super Admin)

**URL**: `/attributes`
**Method**: `POST`
**Headers**:

- `Authorization`: `Bearer <token>`
  **Payload**:

```json
{
  "name": "Color",
  "slug": "color",
  "values": ["Red", "Blue", "Green"]
}
```

### 13. Create Product (Super Admin / Seller)

**URL**: `/products`
**Method**: `POST`
**Headers**:

- `Authorization`: `Bearer <token>`
  **Payload**:

```json
{
  "sellerId": "seller-uuid",
  "categoryId": "category-uuid",
  "name": "Red T-Shirt",
  "slug": "red-t-shirt",
  "basePrice": 29.99,
  "sku": "TSHIRT-RED-001",
  "variants": [
    {
      "sku": "TSHIRT-RED-S",
      "price": 29.99,
      "stockQuantity": 100,
      "attributes": [
        { "attributeId": "color-attr-id", "attributeValueId": "red-val-id" }
      ]
    }
  ]
}
```

### 14. Create Coupon (Super Admin / Seller)

**URL**: `/coupons`
**Method**: `POST`
**Headers**:

- `Authorization`: `Bearer <token>`
  **Payload**:

```json
{
  "sellerId": "optional-seller-uuid",
  "code": "SUMMER2025",
  "type": "PERCENTAGE",
  "value": 20,
  "minOrderAmount": 50.0,
  "startsAt": "2025-06-01T00:00:00Z",
  "expiresAt": "2025-06-30T23:59:59Z"
}
```

### 15. List Coupons

**URL**: `/coupons`
**Method**: `GET`
**Headers**:

- `Authorization`: `Bearer <token>`

## User Status Management

The User object now includes a `status` field:

- `ACTIVE` (Default)
- `SUSPENDED`
- `DEACTIVATED`

Super Admins can update this status via the **Update User** endpoint (`PATCH /api/backoffice/users/:id`).

**Payload Example for Suspension**:

```json
{
  "status": "SUSPENDED"
}
```

### 16. List Orders (Admin / Seller)

**URL**: `/orders`
**Method**: `GET`
**Headers**:

- `Authorization`: `Bearer <token>`

### 17. Get Order Details

**URL**: `/orders/:id`
**Method**: `GET`
**Headers**:

- `Authorization`: `Bearer <token>`

### 18. Update Order Status

**URL**: `/orders/:id/status`
**Method**: `PATCH`
**Headers**:

- `Authorization`: `Bearer <token>`
  **Payload**:

```json
{
  "status": "CONFIRMED"
}
```

### 19. List Reviews

**URL**: `/reviews`
**Method**: `GET`
**Headers**:

- `Authorization`: `Bearer <token>`

### 20. Moderate Review (Approve/Reject)

**URL**: `/reviews/:id/status`
**Method**: `PATCH`
**Headers**:

- `Authorization`: `Bearer <token>`
  **Payload**:

```json
{
  "status": "APPROVED"
}
```
