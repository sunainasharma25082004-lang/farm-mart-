# 🛵 S-farmart 24 — Delivery App (`deliveryApp`)

The official Rider Partner mobile and web application for **S-farmart 24**, providing high-performance hyper-local dispatch, live GPS route navigation, dual-OTP verification, and real-time earnings settlement.

---

## ⚡ Key Capabilities & Architecture

1. **Dual-Token Rider Authentication (`/api/rider/auth/*`)**:
   - 15-minute cryptographically signed JWT access tokens with rotating refresh tokens (SHA-256 stored).
   - Seamless background single-flight refresh mutex preventing concurrent re-auth collisions.
   - Quick 1-tap demo credentials for Gurmukh, Harpreet, and Manjinder.

2. **Geospatial Order Assignment & 20s Dispatch Loop**:
   - Real-time MongoDB `2dsphere` geospatial `$near` lookups for nearest `ONLINE_IDLE` riders within 8 km.
   - 20-second countdown chime modal with Web Audio API loop.
   - Atomic acceptance locking (`status: 'ON_DELIVERY'`) and automatic reassignment to the next candidate upon expiration or decline.

3. **Active Trip Workflow & Dual OTP Handshake**:
   - **Step 1: Head to Store** — Displays merchant store address, contact dialer, and "I Have Arrived at Store" button (`status: 'RIDER_ARRIVED_STORE'`).
   - **Step 2: Collect Parcel** — 4-digit Store `pickupOtp` input field to verify parcel handover with the partner merchant (`status: 'OUT_FOR_DELIVERY'`).
   - **Step 3: Customer Doorstep Delivery** — High-visibility COD Cash Collection notice (`Collect ₹X` / `Prepaid ₹0`), 4-digit Customer `deliveryOtp` verification, and instant ₹65 credit to the rider wallet (`status: 'DELIVERED'`).

4. **Live GPS Telemetry**:
   - 5-second location beacon emitting coordinates, speed (~18 km/h), and heading over Socket.IO (`rider:location`) and REST (`/api/rider/location`).
   - Sparse 30s MongoDB breadcrumbs (`order.deliveryRoute`) saving server storage while delivering smooth real-time animation on customer maps.

5. **Earnings & Ledger**:
   - Live daily and cumulative payout tally (`todayEarningsPaise`, `totalEarningsPaise`).
   - Milestone incentive bonus tracker (e.g. +₹150 for 10 trips).
   - Weekly Wednesday 10:00 AM direct bank settlement schedule.

---

## 🔑 Demo Rider Partner Accounts

| Rider Name | Phone | Password | Vehicle Plate | Vehicle Type |
|---|---|---|---|---|
| **Gurmukh Singh** | `9876543220` | `demo123` | `PB-10-AB-1234` | 🏍️ Hero Splendor |
| **Harpreet Singh** | `9876543221` | `demo123` | `PB-10-CD-5678` | 🛵 Honda Activa |
| **Manjinder Singh** | `9876543222` | `demo123` | `PB-10-EF-9012` | 🚲 E-Cycle |

---

## 📁 Directory Structure

```
deliveryApp/
├── App.js                         # Root entry with RiderAuthProvider & DeliveryProvider
├── app.json                       # Expo configuration (Port 8083)
├── src/
│   ├── components/
│   │   └── OrderOfferModal.js     # 20s countdown ring with audio chime & accept/decline
│   ├── context/
│   │   ├── DeliveryContext.js     # Real-time socket events, active mission state, GPS beacon
│   │   └── RiderAuthContext.js    # Dual-token auth session, duty status switcher, storage
│   ├── navigation/
│   │   └── DeliveryNavigator.js   # Auth gate + 4 tabs: Duty, Active Trip, Payouts, Profile
│   ├── screens/
│   │   ├── ActiveNavigationScreen.js # 3-step active trip, Google Maps deep-link, dual OTPs
│   │   ├── DutyScreen.js          # Live status toggle, pay summary, in-pool order pickup
│   │   ├── EarningsScreen.js      # Today's earnings, weekly milestone progress, trip ledger
│   │   ├── ProfileScreen.js       # Verified KYC credentials, vehicle details, bank info
│   │   └── RiderLoginScreen.js    # Dark HUD login with 1-tap demo rider switcher
│   ├── services/
│   │   ├── api.js                 # Axios instance with single-flight token refresh mutex
│   │   ├── socket.js              # Resilient Socket.IO connection manager
│   │   └── storage.js             # AsyncStorage + LocalStorage fallback
│   └── theme/
│       └── colors.js              # Theme tokens
```

---

## 🚀 Running the App Locally

```bash
# In deliveryApp directory:
npx expo start --web --port 8083
```

- **Rider App Web Portal**: `http://localhost:8083`
- **Customer App**: `http://localhost:8081`
- **Partner App**: `http://localhost:8082`
- **Backend API Server**: `http://localhost:5000`

---

## 🧪 Automated End-to-End Verification

To execute the automated 11-step end-to-end delivery assignment and OTP verification test:

```bash
# In root workspace:
node server/utils/testDeliveryFlow.js
```

To run the complete 20-test production acceptance suite:

```bash
node server/utils/runAcceptanceTests.js
```
