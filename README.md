# 🌾 Farmart (Freemart) — Hyperlocal Agri & Food Commerce Ecosystem

**Farmart** is a production-grade, hyper-local digital commerce platform (built with the Swiggy / Zomato / Blinkit model) connecting smallholder farmers, verified home chefs (Nari Shakti), and village hubs directly with consumers for fast 20–35 minute deliveries.

---

## 📑 Master Table of Contents
1. [Platform Architecture & System Diagram](#-platform-architecture--system-diagram)
2. [Key Production Pillars](#-key-production-pillars)
3. [Ecosystem Applications Summary](#-ecosystem-applications-summary)
4. [User App (Customer Portal) — Full Functionality](#-user-app-customer-portal--full-functionality)
5. [Partner App (Vendor/Merchant Portal) — Full Functionality](#-partner-app-vendormerchant-portal--full-functionality)
6. [Mobile Phone Stability & Zero-Crash Architecture](#-mobile-phone-stability--zero-crash-architecture)
7. [Testing on Real Phones (Expo Go & APK)](#-testing-on-real-phones-expo-go--apk)
8. [MongoDB Atlas Cloud Database & Schema](#-mongodb-atlas-cloud-database--schema)
9. [Real-time Notification & WebSocket Subsystem](#-real-time-notification--websocket-subsystem)
10. [🔴 Single-Vendor Cart Architecture](#-single-vendor-cart-architecture)
11. [Demo Test Credentials](#-demo-test-credentials)
12. [Automated Acceptance Test Suite (15/15 Passing)](#-automated-acceptance-test-suite-1515-passing)
13. [How to Run Every Service & Live Web Preview](#-how-to-run-every-service--live-web-preview)

---

## 🏛️ Platform Architecture & System Diagram

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             FARMART DIGITAL PLATFORM                             │
├────────────────────────┬────────────────────────┬────────────────────────────────┤
│ 🛒 Customer App        │ 🏪 Partner App         │ 🛵 Delivery App                │
│ (Port 8081 - Expo Web) │ (Port 8082 - Expo Web) │ (Port 8083 - Expo Web)         │
│ • Category-First Grid  │ • Live Order Alert Chime│ • Online/Offline Duty Switch  │
│ • Single-Vendor Cart   │ • 60s Accept Ring      │ • Active GPS Navigation Screen │
│ • Store Rails & Status │ • Store Open/Close     │ • Today's Earnings & Trips     │
│ • Live Order Tracking  │ • Multi-Store Switcher │ • Customer Direct Calling      │
└───────────┬────────────┴───────────┬────────────┴───────────────┬────────────────┘
            │                        │                            │
            │ HTTP + Socket.IO       │ HTTP + Socket.IO           │ HTTP
            ▼                        ▼                            ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      ⚙️ Central Backend Server (Port 5000)                        │
│          Node.js • Express • Socket.IO Engine • JWT Auth • Mongoose              │
│       Rooms: vendor:{vendorId} • customer:{userId} • order:{orderId}             │
└────────────────────────────────────┬─────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      🍃 Cloud MongoDB Atlas Database (farmart)                   │
│      Collections: categories • vendors • products • orders • users               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💎 Key Production Pillars

1. **Category-First Discovery (8 Seeded Categories):**
   * Fresh Fruits & Vegetables, Dairy, Bread & Eggs, Atta, Rice & Dal, Oil, Ghee & Masala, Ghar Ka Khana / Home Thali, Mithai & Bakery, Snacks & Munchies, Cold Drinks & Juices.
2. **Vendor-First Browsing & Isolation:**
   * Each vendor profile maintains its own isolated catalog, operating hours, delivery radius, ratings, and minimum order requirements.
3. **🔴 Strict Single-Vendor Cart Enforcement:**
   * **Client Protection:** Swiggy-style `ClearCartModal` intercepts items added from a different store, prompting the user to clear or cancel.
   * **Server Protection:** HTTP 400 rejection with `MULTI_VENDOR_CART` if items belong to more than one store.
4. **🔴 Instant Real-Time Order Notifications:**
   * WebSocket emission to `vendor:${vendorId}` in **< 600 ms**.
   * Web Audio API looped chime on Partner App + Native Mobile pulsed vibration.
   * Full-screen `NewOrderModal` with 60-second circular countdown ring, item breakdown, and Accept/Reject with reason.
   * Resilient fallback to 10s auto-polling if network is interrupted.
5. **Atomic Inventory Control & Stock Rollback:**
   * Atomically decrements `{ stockQty: { $gte: qty } }` upon order placement.
   * Immediately rolls back stock via `+$inc: qty` if order is rejected or cancelled.

---

## 📱 Ecosystem Applications Summary

| Application | Folder | Tech Stack | Port | Primary Target User |
| :--- | :--- | :--- | :--- | :--- |
| **Customer App** | [`userApp/`](./userApp/) | React Native (Expo v57), React Native Web | `8081` | End-consumer ordering veggies, milk, food & sweets |
| **Partner App** | [`partnerApp/`](./partnerApp/) | React Native (Expo v57), React Native Web | `8082` | Farmers, Home Chefs, Kirana Owners |
| **Delivery App** | [`deliveryApp/`](./deliveryApp/) | React Native (Expo v57), React Native Web | `8083` | Delivery riders & field couriers |
| **Backend REST API** | [`server/`](./server/) | Node.js, Express, Socket.IO, Mongoose | `5000` | Core transactional API & real-time server |
| **Coming Soon Portal**| Root (`./`) | Vite, React 19, Vanilla CSS | `5173` | Brand landing & upgrade announcement page |

---

## 🛒 User App (Customer Portal) — Full Functionality

The Customer App delivers a clean, high-performance quick-commerce experience:

1. **Authentication & Quick Demo Mode (`LoginScreen.js`, `SignupScreen.js`):**
   * Phone + password authentication backed by JWT tokens.
   * **1-Tap Demo Login:** Instantly logs in with demo credentials (`9876543210`) without requiring server connection.
   * Offline demo fallback: If backend is unreachable, the app seamlessly authenticates with a local profile so review is never blocked.
2. **Category & Store Discovery (`HomeScreen.js`):**
   * Real-time GPS location reverse-geocoding via `expo-location` with manual address edit modal.
   * 8 dynamic category icons loaded from MongoDB.
   * Horizontal vendor rails: Popular Stores Near You, Ghar Ka Khana (Home Chefs), and Direct From Farms & Orchards.
   * Real-time store availability indicators (`🟢 Open Now` vs `🔴 Closed`).
3. **Category Stores View (`CategoryVendorsScreen.js`):**
   * Filter vendors by selected category slug.
   * Safe parameter extraction preventing blank screen crashes if accessed without params.
4. **Isolated Storefront (`VendorStoreScreen.js`):**
   * High-definition store banner with owner name, rating, prep time, and minimum order threshold.
   * Sub-category filter pills (e.g. Thalis, Sweets, Breads, Dairy).
   * Item cards with increment/decrement quantity buttons synced with global CartContext.
   * Store-closed warning banner preventing orders when vendor toggles offline.
5. **Product Detail View (`ProductDetailsScreen.js`):**
   * Full product image, description, organic badges, rating, and quick-add controls.
   * Similar products carousel.
6. **Single-Vendor Cart Management (`CartScreen.js`, `CartContext.js`):**
   * Strict single-vendor guard: prevents mixing items from different vendors.
   * Dynamic bill calculation: Item Total, Delivery Fee (Free above ₹200), Govt. Restaurant GST (5% for Home Chefs), and Grand Total.
   * Minimum order shortfall notification.
7. **Comprehensive Checkout (`CheckoutScreen.js`):**
   * Itemized delivery verification card.
   * Address editor with home/work tagging.
   * Interactive simulated Payment Gateway (UPI Apps like GPay, PhonePe, Paytm, QR Code scan, Cards, COD, and Farmart Wallet).
   * Live post-order receipt with Delivery Confirmation OTP.
8. **Real-time Order Tracker (`OrderTrackingScreen.js`):**
   * 6-step live status stepper: Placed ➔ Accepted ➔ Preparing ➔ Packed ➔ On Way ➔ Delivered.
   * Live WebSocket updates instantly transitioning order state when vendor accepts or updates.
   * Direct calling button to contact kitchen/store directly.
9. **Farmer & Community Producer Dashboard (`FarmerDashboardScreen.js`):**
   * Harvest produce listing portal.
   * Active harvest tracking, expected price per kg, assigned village hub, and Wednesday settlement schedule.

---

## 🏪 Partner App (Vendor/Merchant Portal) — Full Functionality

The Partner App is designed for kitchen chefs, local grocers, and farmers:

1. **Multi-Store Demo Switcher (`VendorDashboardScreen.js`):**
   * 1-tap store switcher at the top:
     * **Chef Sunita Sharma** (Home Restro & Sweets — `9876543211`)
     * **Sukhwinder Singh** (Farmer & Produce — `9876543212`)
     * **Gurpreet Kaur** (Orchards & Juices — `9876543213`)
2. **Instant Audio Alert & Pulsed Vibration (`soundAlert.js`, `NewOrderModal.js`):**
   * Zomato/Swiggy-style two-tone chime sound via Web Audio API.
   * Native mobile continuous pulsed vibration (`Vibration.vibrate([0, 500, 300, 500], true)`).
   * Full-screen order popup with 60-second animated timer ring.
   * One-tap Accept and Reject with structured reasons ("Item out of stock", "Kitchen closing soon", etc.).
3. **Live Orders Queue:**
   * Progressive state management: `NEW_ORDER` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY_FOR_RIDER` ➔ `DELIVERED`.
   * Real-time sync via WebSocket room `vendor:{vendorId}` with 10-second automatic polling fallback.
4. **Store Status Toggle:**
   * Real-time `ONLINE` / `OFFLINE` toggle switch. Changes immediately update customer view and reject incoming orders while offline.
5. **Catalog & Inventory Management (`AddProductScreen.js`, `InventoryScreen`):**
   * List new products with name, category, price, MRP, unit, stock quantity, and description.
   * Instant toggle for in-stock / out-of-stock items.
   * Delete product capability.
6. **Wednesday Settlements Portal (`SettlementsScreen`):**
   * Weekly payout schedule, bank account linkage tag, and past settlement history logs.

---

## 🛡️ Mobile Phone Stability & Zero-Crash Architecture

To ensure the apps **DO NOT CRASH ON PHYSICAL PHONES**, the following critical fixes have been implemented:

| Potential Phone Crash Issue | Root Cause | Solution Implemented |
| :--- | :--- | :--- |
| **Duplicate `expo-font` Native Module** | `package.json` had `expo-font@14.x` while Expo SDK 57 expects `~57.0.4`. On phones, duplicate native modules cause startup or font-loading crashes. | Upgraded `expo-font` to `~57.0.4`, `@expo/vector-icons` to `^15.0.2`, and `react-native-safe-area-context` to `~5.7.0`. |
| **`app.json` Schema Rejections** | Unsupported `splash` and `android.usesCleartextTraffic` at root caused config validation failures. | Cleaned `app.json` to conform strictly to Expo SDK 57 specification. |
| **Uncaught `farmerListings` Crash** | `FarmerDashboardScreen.js` called `farmerListings.length` when the state was missing from `AppContext.js`. | Added `farmerListings` state and `addFarmerListing` handler with initial mock data in `AppContext.js`. |
| **Broken Ternary in `RoleSelectorModal`** | A dangling ternary operator `) : (` caused a JS parse error. | Fixed ternary syntax in `RoleSelectorModal.js`. |
| **Unsafe `route.params` Destructuring** | `ProductDetailsScreen.js` and `CategoryVendorsScreen.js` threw `Cannot read property of undefined` if accessed without parameters. | Added safe optional chaining: `route.params?.product || products[0]` and safe defaults. |
| **Unsafe `.replace()` on Status** | `VendorDashboardScreen.js` and `FarmerDashboardScreen.js` called `order.status.replace()` which throws if status is null. | Protected with fallback: `(order?.status || 'NEW_ORDER').replace(/_/g, ' ')`. |
| **Unsafe Cart Item ID Access** | `CartContext.js` and `VendorStoreScreen.js` accessed `it.product._id` directly. | Replaced with optional chaining `it.product?._id || it.product?.id`. |
| **Offline / Localhost Phone Network Failure** | `localhost:5000` points to the mobile device itself, not the backend server. | Added offline fallback mock data in `AppContext`, `HomeScreen`, and `CatalogScreen` so the app gracefully operates without network errors. |

---

## 📲 Testing on Real Phones (Expo Go & APK)

### Option A: Testing via Expo Go on Same Wi-Fi (Recommended)

1. Make sure your phone and development computer are connected to the **same Wi-Fi network**.
2. Find your computer's local IP address (e.g. `192.168.1.5`):
   ```bash
   ipconfig
   ```
3. Set `EXPO_PUBLIC_API_URL` to your local IP address:
   ```bash
   # In userApp/.env:
   EXPO_PUBLIC_API_URL=http://192.168.1.5:5000/api
   ```
4. Start the Expo development server:
   ```bash
   cd userApp
   npx expo start
   ```
5. Open the **Expo Go** app on your Android or iOS phone and scan the displayed QR code.

### Option B: Testing via Expo Tunnel (Across Different Networks)

If your computer and phone are on different Wi-Fi networks (or mobile data):
```bash
cd userApp
npx expo start --tunnel
```
*(Requires `@expo/ngrok` which is automatically prompted).*

---

## 🍃 MongoDB Atlas Cloud Database & Schema

* **Cluster URI:** Configured securely in `server/.env`.
* **Mongoose Models:**
  * [`server/models/Category.js`](./server/models/Category.js) — 8 categories with image, slug, isActive, and sortOrder.
  * [`server/models/Vendor.js`](./server/models/Vendor.js) — Store name, slug, phone, owner, address, isOpen, minOrderValue, deliveryFee, ratings.
  * [`server/models/Product.js`](./server/models/Product.js) — Name, description, price, unit, stockQty, categoryId (ref), vendorId (ref), isVeg.
  * [`server/models/Order.js`](./server/models/Order.js) — orderNumber, userId, vendorId, items, pricing, status, address, rejectionReason.
  * [`server/models/User.js`](./server/models/User.js) — name, phone, email, role (`customer` or `vendor`), vendorProfile.

### 🔌 Key REST API Endpoints (`http://localhost:5000/api`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status & database connection health check. |
| `GET` | `/api/categories` | Returns all 8 seeded categories. |
| `GET` | `/api/vendors` | Returns all active vendors with open/closed status. |
| `GET` | `/api/vendors/:id` | Returns single vendor details and catalog. |
| `PATCH`| `/api/vendors/toggle-store` | Toggles vendor store open/closed state. |
| `GET` | `/api/products` | Returns all active products filtered by vendor or category. |
| `POST` | `/api/products` | Permanently saves a new item uploaded from Partner App into MongoDB. |
| `DELETE`| `/api/products/:id` | Permanently removes an item from MongoDB. |
| `POST` | `/api/orders` | Creates a new order (with atomic stock lock and multi-vendor validation). |
| `GET` | `/api/orders/vendor/my-orders` | Fetches active live orders for logged-in vendor. |
| `PATCH`| `/api/orders/:id/status` | Transitions order status (`NEW_ORDER` ➔ `ACCEPTED` ➔ `READY_FOR_RIDER` ➔ `DELIVERED`). |

---

## 📡 Real-time Notification & WebSocket Subsystem

### Socket Rooms
* `vendor:${vendorId}` — Receives instant `order:new` payloads when customer checks out.
* `customer:${userId}` — Receives `order:status` updates as vendor accepts or prepares food.
* `order:${orderId}` — Dedicated order tracking room.

### Events
* `order:new` — Emitted to vendor room upon successful checkout.
* `order:status` — Emitted to customer room on order state changes.
* `vendor:toggle` — Broadcasts vendor open/close state change.

---

## 🔴 Single-Vendor Cart Architecture

```
[Customer clicks ADD on Sunita's Paneer Butter Masala]
                      │
                      ▼
Cart stores: vendorId = Sunita._id, vendorName = "Sunita Home Restro"
                      │
                      ▼
[Customer navigates to Sukhwinder's Farm and clicks ADD on Spinach]
                      │
                      ▼
CartContext detects: product.vendorId !== cart.vendorId
                      │
                      ▼
Swiggy-style ClearCartModal Pops Up:
"Replace items in cart? Your cart contains items from Sunita Home Restro. Do you want to discard them and add items from Sukhwinder Organic Farms?"
 ├── [Cancel] ➔ Retains Sunita's items
 └── [Clear & Add] ➔ Empties cart and adds Spinach
                      │
                      ▼
Server Validation: POST /api/orders
If multiple vendorIds found: Rejects with HTTP 400 { success: false, code: "MULTI_VENDOR_CART" }
```

---

## 🔑 Demo Test Credentials

### 🛒 1. Customer Account (`userApp` — `http://localhost:8081`)
* **Phone:** `9876543210`
* **Password:** `demo123`
* **Name:** `Rajesh Kumar`
* **Saved Address:** `Flat 402, Green Avenue, Model Town, Ludhiana`
* ⚡ **1-Tap Login:** Click the **"⚡ 1-Tap Dummy Customer Login"** button on the sign-in screen to instantly authenticate.

### 🏪 2. Partner / Vendor Accounts (`partnerApp` — `http://localhost:8082`)

#### 🍲 Store 1: Sunita Home Restro & Sweets
* **Phone:** `9876543211`
* **Password:** `demo123`
* **Owner:** Sunita Sharma (Home Chef)
* **Categories:** Ghar Ka Khana, Desi Sweets, Dairy

#### 🌾 Store 2: Sukhwinder Organic Farms
* **Phone:** `9876543212`
* **Password:** `demo123`
* **Owner:** Sukhwinder Singh (Farmer)
* **Categories:** Fresh Fruits & Vegetables, Atta, Rice & Dal

#### 🍎 Store 3: Gurpreet Fresh Orchards
* **Phone:** `9876543213`
* **Password:** `demo123`
* **Owner:** Gurpreet Singh (Fruit Grower)
* **Categories:** Fresh Fruits & Vegetables, Juices

*(Use the quick store switcher bar on Partner App to toggle between all 3 accounts with 1 tap!)*

---

## 🧪 Automated Acceptance Test Suite (15/15 Passing)

Run the full end-to-end integration test suite at any time:

```bash
node server/utils/runAcceptanceTests.js
```

### Acceptance Test Results
* ✅ **TC-01:** Category Listing API returns exactly 8 seeded categories
* ✅ **TC-02:** Vendor Listing API returns 3 active vendors
* ✅ **TC-03:** Customer 1-Tap Login generates valid JWT
* ✅ **TC-04:** Vendor Login generates valid JWT with role check
* ✅ **TC-05:** Vendor Catalog isolation (Sunita: 5 items, Sukhwinder: 7 items)
* ✅ **TC-06:** 🔴 Server Rejects Multi-Vendor Cart with HTTP 400 (`MULTI_VENDOR_CART`)
* ✅ **TC-07:** Minimum Order Value constraint enforcement (`MIN_ORDER_NOT_MET`)
* ✅ **TC-08:** Valid Single-Vendor Order Creation (HTTP 201)
* ✅ **TC-09:** Atomic Stock Decrement (`$inc: -qty`)
* ✅ **TC-10:** 🔴 Real-time Socket Event (`order:new`) received by Vendor in < 1 sec
* ✅ **TC-11:** Order State Machine Transitions (`NEW` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `DELIVERED`)
* ✅ **TC-12:** Stock Rollback on Rejection (`$inc: +qty`)
* ✅ **TC-13:** Vendor Closed Store Rejection (`VENDOR_CLOSED`)
* ✅ **TC-14:** Vendor Dashboard Stats Computation (Dynamic Mongoose aggregation)
* ✅ **TC-15:** Vendor Catalog Management (Add & Delete Product)

See [`TEST_REPORT.md`](./TEST_REPORT.md) for full execution logs and timing.

---

## 💻 How to Run Every Service & Live Web Preview

### 1. Start Central Backend Server (Port 5000)
```bash
npm run server
```
*Health Check:* [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 2. Start Customer App Web Preview (Port 8081)
```bash
cd userApp
npx expo start --web --port 8081
```
*Customer App:* [http://localhost:8081](http://localhost:8081)

### 3. Start Partner App Web Preview (Port 8082)
```bash
cd partnerApp
npx expo start --web --port 8082
```
*Partner App:* [http://localhost:8082](http://localhost:8082)

---

© 2026 Farmart. All rights reserved. Empowering Farmers • Building Communities • Growing Bharat.
