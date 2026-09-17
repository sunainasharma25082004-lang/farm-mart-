# S-farmart 24 — Database & Environment Migration Guide

## Phase 1: Authentication Foundation (JWT + Refresh Tokens + Money in Paise)

### 1. New Environment Variables
Add the following to `server/.env`:
```ini
JWT_ACCESS_SECRET=sfarmart_jwt_access_secret_2026_super_secure_key
JWT_REFRESH_SECRET=sfarmart_jwt_refresh_secret_2026_super_secure_key
OTP_DEV_MODE=true
```

### 2. Database Schema Changes
1. **`users` Collection**:
   - `phone`: match regex `/^[6-9]\d{9}$/`, indexed, unique.
   - `passwordHash`: optional, `select: false`.
   - `role`: updated enum: `['CUSTOMER', 'VENDOR', 'FARMER', 'VILLAGE_HUB', 'GROWTH_PARTNER', 'ADMIN']`.
   - `status`: new enum: `['ACTIVE', 'BLOCKED', 'DELETED']`, default `'ACTIVE'`.
   - `isPhoneVerified`: boolean, default `false`.
   - `walletBalance`: converted from rupees to **integer paise** (e.g. ₹250 ➔ `25000` paise).
   - `defaultAddressId`: ObjectId reference.
   - `fcmTokens`: array of `{ token, platform, updatedAt }`.
   - `lastLoginAt`, `deletedAt`: timestamps.
2. **`refreshtokens` Collection** (New):
   - `user`: ObjectId reference to User, indexed.
   - `tokenHash`: SHA-256 hex string of the raw 64-byte token, unique index.
   - `deviceId`: String.
   - `userAgent`: String.
   - `expiresAt`: TTL index (`expireAfterSeconds: 0`), 30-day lifetime.
   - `revokedAt`: Timestamp when revoked / rotated.
   - `replacedBy`: SHA-256 hash of replacement token.

### 3. One-Time Data Migration Script
Run the idempotent money migration script:
```bash
node server/scripts/migrate-money-to-paise.js
```
*Note*: This script is guarded by the `migrations` collection in MongoDB (`name: 'migrate-money-to-paise'`). It will safely exit without duplicate modifications if run more than once.

---

## Flow 0 & Flow 2: Mock Data Purge, ObjectId Safety & Server-Side Cart

### 1. Database Schema Changes
**`carts` Collection** (New):
- `user`: ObjectId reference to User, unique index.
- `vendor`: ObjectId reference to Vendor (null when cart is empty/unlocked).
- `items`: Array of:
  - `product`: ObjectId reference to Product (required).
  - `name`: String.
  - `image`: String.
  - `unit`: String.
  - `priceAtAdd`: Number (integer paise snapshot).
  - `qty`: Number (min: 1, max: 20).
  - `addedAt`: Date.
- `schemaVersion`: Number (default: 1).

### 2. MongoDB Replica Set Fail-Fast Check
On server boot, `server/config/db.js` verifies `hello.setName`. If absent (standalone mode), the server halts with exit code 1 to prevent silent fallback to non-transactional writes for `switch-vendor`, `checkout`, and `refunds`.

### 3. Order Controller ObjectId Guard
`POST /api/orders` strictly validates every incoming `productId` using `mongoose.isValidObjectId()`. If invalid, it immediately returns HTTP 400 `INVALID_PRODUCT_ID` and never throws a 500 CastError.

### 4. Banning Mock Data
- `userApp/src/data/mockData.js` deleted.
- Added `.eslintrc.json` in `userApp` with `no-restricted-imports` rule permanently banning any import of `mockData`.
- Seed data reference created in `server/scripts/seed.js`.

