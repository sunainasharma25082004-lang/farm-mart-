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
