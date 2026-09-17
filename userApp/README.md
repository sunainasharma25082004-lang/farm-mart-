# 🛒 S-farmart 24 Customer App (`userApp`)

Official hyper-local customer marketplace application for **S-farmart 24**, built with **React Native (Expo v57)** and **React Native Web**. Connects everyday urban & rural households directly with verified local farmers, certified home chefs (*Nari Shakti*), community village hubs, and daily grocery marts for **lightning-fast 30–45 minute doorstep delivery**.

---

## 📑 Table of Contents
1. [Brand Identity & Official Logo](#-brand-identity--official-logo)
2. [End-to-End Customer Workflow (User Kaise Use Kr Raha H)](#-end-to-end-customer-workflow-user-kaise-use-kr-raha-h)
3. [Core Features & Working Architecture](#-core-features--working-architecture)
4. [ACID Concurrency, Stock Deduction & Safety Guards](#-acid-concurrency-stock-deduction--safety-guards)
5. [Real-Time Synergy with Partner App (`partnerApp`)](#-real-time-synergy-with-partner-app-partnerapp)
6. [UI/UX Design Architecture & Customization Guide (Design Ke Liye Kya Kr Sakte Hain)](#-uiux-design-architecture--customization-guide-design-ke-liye-kya-kr-sakte-hain)
7. [Screen-by-Screen Breakdown](#-screen-by-screen-breakdown)
8. [Directory Structure](#-directory-structure)
9. [1-Tap Demo Customer Account](#-1-tap-demo-customer-account)
10. [How to Run Locally](#-how-to-run-locally)
11. [Phase 1: Production Authentication & Session Architecture](#-phase-1-production-authentication--session-architecture)

---

## 🎨 Brand Identity & Official Logo

The application reflects the official **S-farmart 24** brand identity:
* **Official Logo:** Green and orange circular orbit rings with a fresh grocery basket, 24-hour delivery clock, and bold modern typography (`userApp/assets/farmart24_logo.jpg` & `userApp/assets/icon.png`).
* **Header Alignment:** Displayed crisply at `44x44` (1:1 square ratio) with smooth rounded corners, perfectly aligned next to the GPS location selector and cart badge.
* **Core Brand Colors:**
  * Primary Green: `#16a34a` (Farm Fresh & Growth)
  * Secondary Crimson: `#dc2626` (Express Delivery Badges)
  * Harvest Orange: `#ea580c` (Kitchen Warmth & Urgency)
  * Soft Slate Neutral: `#f4f6f8` (High readability mobile canvas)

---

## 🚶 End-to-End Customer Workflow (User Kaise Use Kr Raha H)

The following sequence illustrates the complete customer journey from launching the app to receiving doorstep delivery:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Customer (User)
    participant Header as 📍 Header & GPS
    participant Home as 🏠 Home Screen
    participant Store as 🏪 Store & Catalog
    participant Cart as 🛒 Cart Context
    participant Checkout as 💳 Checkout & Pay
    participant Backend as ⚡ S-farmart API (MongoDB)
    participant Socket as 📡 WebSocket Service
    participant Partner as 👨‍🍳 Partner App

    Customer->>Header: App open karte hi delivery location automatically detect hoti hai
    Customer->>Home: Banners, Categories, aur Popular Stores browse karta hai
    Customer->>Store: Store select karta hai (e.g. "Sunita Home Restro & Sweets")
    Store->>Customer: Live menu display hota hai (Price, Veg tag, Stock quantity)
    Customer->>Store: "+ ADD" click karke product cart me daalta hai
    Store->>Cart: Item cart me add hoti hai (Agar dusre store se item pehle se ho to ClearCartModal warn karta hai)
    Customer->>Cart: Cart open karta hai, quantity adjust karta hai, bill breakdown check karta hai
    Customer->>Checkout: "Proceed to Pay" tap karta hai
    Checkout->>Customer: Address confirm karta hai aur payment mode select karta hai (COD / Wallet / Online)
    Customer->>Checkout: "Pay & Place Order" click karta hai
    Checkout->>Backend: Atomic ACID transaction initiate hoti hai (clientOrderId ke sath)
    Backend->>Backend: Stock verify hota hai aur instantly deduct hota hai (Optimistic Concurrency Lock)
    Backend->>Socket: order:new event emit hota hai strictly vendor room me
    Socket->>Partner: Partner App par loud audio chime bajti hai aur Live Order Queue me card flash hota hai
    Customer->>Checkout: Order place ho jata hai aur user direct OrderTrackingScreen par pahunchta hai
    Partner->>Socket: Partner status update karta hai (ACCEPTED -> PREPARING -> READY_FOR_RIDER)
    Socket->>Customer: Customer tracking screen par live status bina refresh kiye update hota hai
```

### Step-by-Step User Actions:

1. **Location Setup & Header Interaction:**
   * Customer app open karta hai.
   * Header automatically device GPS reverse geocoding use karke current city aur street fetch karta hai.
   * Customer delivery address par tap karke manual delivery address bhi set/edit kar sakta hai.
2. **Browsing & Discovery:**
   * **Smart Search:** Customer top search bar me dish ya veggie type karta hai (e.g., *"Rajma"*, *"Dal"*, *"Tomato"*).
   * **Quick Category Chips:** *Fresh Fruits & Veggies*, *Dairy & Ghee*, *Atta & Dal*, *Home Thali*, *Bakery & Sweets*.
   * **Popular Stores Near You:** Nearby live stores dikhte hain unke live status (`ONLINE` / `CLOSED`), rating (`4.9★`), aur preparation time ke sath.
3. **Store Page & Product Selection:**
   * Store card click karne par store ka banner, address, aur pura categorized menu open hota hai.
   * Har item par **Pure Veg green square indicator**, strikethrough MRP, actual selling price, aur description hota hai.
   * Agar product out of stock hai, to button disabled rehta hai aur **"Out of Stock"** red badge show hota hai.
4. **Single-Store Multi-Cart Protection:**
   * S-farmart 24 lightning-fast single-route delivery support karta hai. Agar user Store A se item dalne ke baad Store B se item add karta hai, to `ClearCartModal` open hota hai jo user ko clear choice deta hai: *"Do you want to discard your current cart and switch to this store?"*
5. **Reviewing Cart & Dynamic Bill:**
   * Customer floating green cart bar ya top header cart icon se cart open karta hai.
   * Cart me `+` aur `-` buttons se quantity instant update hoti hai.
   * Bill Summary me Item Total, Delivery Fee (Free above ₹199), Taxes, aur Platform Fee real-time calculate hote hain.
6. **Checkout & Multi-Channel Payment:**
   * **S-farmart Wallet:** Customer ke profile me ₹250 preloaded balance hota hai, jisse 1-tap me zero-fee checkout ho sakta hai.
   * **Cash on Delivery (COD):** Delivery boy ko cash ya arrival QR scan se pay karne ka option.
   * **Online Gateway Modal:** Bank-grade 256-bit SSL encrypted modal jisme Google Pay, PhonePe, Paytm, aur Credit/Debit card options integrated hain.
7. **Live Order Tracking:**
   * Order submit hote hi customer **Order Tracking Screen** par aata hai.
   * Animated pulse timeline dikhti hai:
     1. `Order Placed`
     2. `Store Packing`
     3. `Rider Out for Delivery`
     4. `Delivered`
   * Socket.io ke zariye partner jab bhi dashboard par order accept ya packed mark karta hai, customer screen par status real-time update ho jata hai.

---

## ⚡ Core Features & Working Architecture

### 1. Unified State Management (`AppContext.js` & `CartContext.js`)
* `AppContext`: Customer authentication, token, user profile, saved addresses, demo wallet balance, aur multi-role switching handle karta hai.
* `CartContext`: Cart items array, vendor validation, dynamic item totals, single-route integrity, aur idempotent checkout payloads manage karta hai.

### 2. Live WebSocket Connection (`SocketContext.js`)
* S-farmart backend (`http://localhost:5000`) ke sath auto-reconnecting socket connection banata hai.
* Mobile backgrounding resilience ke liye `pingInterval: 25000` aur `pingTimeout: 20000` configured hain.
* Listeners:
  * `order:status`: Jab merchant order status badalta hai to customer app bina page reload kiye instant reflect karta hai.
  * `product:stock`: Jab merchant stock add/remove karta hai ya kisi dusre user ke purchase se item sold out hoti hai, to real-time event aata hai.

### 3. Smart Location Geocoding (`Header.js`)
* `expo-location` ke through coordinates ko human-readable address me convert karta hai.
* Agar permission deny hoti hai ya device offline hoti hai to graceful fallback address set karta hai taaki app kabhi crash na ho.

---

## 🛡️ ACID Concurrency, Stock Deduction & Safety Guards

Online grocery me sabse bada issue over-selling (ek bachi hui item ko ek hi time par do logon ka khareed lena) hota hai. S-farmart 24 me isko **Database-Level ACID Guarantees** se solve kiya gaya hai:

1. **Atomic Stock Decrement:**
   * Backend checkout API (`server/controllers/orderController.js`) me MongoDB atomic query use hoti hai:
     ```javascript
     { _id: productId, stockQty: { $gte: orderedQty } }
     ```
   * Stock deduct hone par hi order create hota hai. Agar do users exact same millisecond par checkout button click karte hain, to database lock sirf ek ko succeed hone deta hai aur dusre user ko gracefully prompt karta hai:
     *"Insufficient stock for item. Another customer may have just purchased it."*
2. **Auto Out-of-Stock Broadcast:**
   * Jaise hi kisi item ka stock `0` hota hai, backend automatically `inStock: false` mark karta hai aur pure network par WebSocket broadcast bhejta hai.
   * Sabhi active users ki screen par `ADD +` button disable hokar `OUT OF STOCK` me switch ho jata hai.
3. **Action Idempotency & Duplicate Order Prevention:**
   * Har checkout request me frontend se unique `clientOrderId` (`ORD_CLI_${Date.now()}_${random}`) bheja jata hai.
   * Network lag ya rapid double-tapping ki wajah se duplicate transaction kabhi trigger nahi hoti.

---

## 🔄 Real-Time Synergy with Partner App (`partnerApp`)

Customer App aur Partner App aapas me seamlessly synced hain:

| Customer Action (`userApp`) | Real-Time Reflection in Partner App (`partnerApp`) |
| :--- | :--- |
| Customer places order for Sunita Home Restro | Partner App par audio alert bajta hai aur order card flash hota hai |
| Customer adds 2 units of Moong Dal | Partner inventory me stock 2 units kam ho jata hai |
| Customer changes delivery address | Partner ko print/dispatch slip par updated address dikhta hai |
| **Partner Action (`partnerApp`)** | **Real-Time Reflection in Customer App (`userApp`)** |
| Partner toggles store to **OFFLINE** | Store page par `ADD +` buttons lock ho jate hain aur `CLOSED` status banner show hota hai |
| Partner accepts order & clicks **Start Cooking** | Customer Order Tracking screen par status `PREPARING` ho jata hai |
| Partner adds a new Dish in **Add Listing** | Customer app ke store menu me new dish instantly live aa jati hai |
| Partner increases stock (+10 units) | Out of stock badge hat jata hai aur product dubara orderable ho jata hai |

---

## 🎨 UI/UX Design Architecture & Customization Guide

### Design Ke Liye Kya Kr Sakte Hain & Kaise Kar Sakte Hain:

Agar aap S-farmart 24 ka UI design customize karna chahte hain, naye themes add karna chahte hain, ya visual aesthetics ko aur enhance karna chahte hain, to yahan detail guide hai:

### 1. Theme Tokens Customization (`userApp/src/theme/colors.js`)
Pura application centralized color tokens use karta hai. Aap ek hi file se pure app ka look & feel change kar sakte hain:

```javascript
// userApp/src/theme/colors.js
export const colors = {
  primary: "#16a34a",       // Main Brand Green (Buttons, Active Tabs, Highlights)
  primaryDark: "#15803d",   // Deep Forest Green (Text headers, Badges)
  primaryLight: "#dcfce7",  // Mint Green tint (Card backgrounds, Tags)
  secondary: "#dc2626",     // Alert / Offer Crimson
  orange: "#ea580c",        // Warm Accent (Thali / Restro highlights)
  background: "#f4f6f8",    // Clean modern slate canvas (Zero glare)
  card: "#ffffff",          // Pure white elevated card surfaces
  textPrimary: "#0f172a",   // Slate 900 for ultra-crisp readable text
  textSecondary: "#64748b", // Slate 500 for secondary descriptions
  border: "#e8edf2",        // Subtle card divider lines
};
```

#### What You Can Do (Design Ideas):
* **Dark Mode Theme:** Ek `darkColors` object banakar toggle state ke basis par canvas ko `#0f172a` aur cards ko `#1e293b` me switch kar sakte hain.
* **Festive Theme (Diwali / Eid / Baisakhi):** `primary` ko `#d97706` (Golden Amber) ya `#b91c1c` (Festival Red) me switch karke festive season ka look de sakte hain.

### 2. Modern Typography & Custom Fonts
Current app system fonts use karti hai for maximum native speed. Isme Google Fonts (jaise *Outfit*, *Inter*, ya *Poppins*) add karne ke liye:
1. Terminal me install karein:
   ```bash
   npx expo install @expo-google-fonts/outfit expo-font
   ```
2. `App.js` me load karein:
   ```javascript
   import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
   ```
3. Stylesheet me font apply karein:
   ```javascript
   fontFamily: 'Outfit_600SemiBold'
   ```

### 3. Micro-Animations & Smooth Feedback
App ko modern Zomato/Blinkit jaisa dynamic feel dene ke liye:
* **Pulse Animations:** Jaise Partner App me breathing pulse status pill hai, waise hi User App ke offers banner ya "Live 30-min delivery" tag par React Native `Animated` loop use kar sakte hain.
* **Skeleton Loaders:** Jab products API se load ho rahe hon, tab shimmer skeleton placeholder cards render kar sakte hain.
* **Haptic Feedback:** Order place hone ya item add hone par mobile par subtle vibration trigger karne ke liye `expo-haptics` use kar sakte hain.

### 4. Mobile Viewport Guarantee (`412x924`)
User App ko modern smartphones ke exact viewport space (`412x924`) ke liye optimize kiya gaya hai:
* **Zero Horizontal Overflow:** Cards me `flexWrap: 'nowrap'` aur `minWidth: 0` use kiya gaya hai taaki text screen se bahar na kate.
* **Safe Paddings:** Content bottom par `paddingBottom: 90` diya gaya hai taaki floating bottom navigation tabs kisi button ya text ko block na karein.
* **Touch Targets:** Sabhi interactive buttons (`ADD +`, `Proceed to Pay`, `Filter chips`) minimum 44px height rakhte hain for comfortable thumb navigation.

---

## 📱 Screen-by-Screen Breakdown

```
userApp/src/screens/Customer/
├── HomeScreen.js                  # Hero carousel, delivery timer strip, popular stores, service pills
├── CatalogScreen.js               # Category filter tabs, two-column product cards with quick-add
├── VendorStoreScreen.js           # Merchant specific catalog, store banner, online/offline check
├── ProductDetailsScreen.js        # Large product photography, ingredients, origin details, reviews
├── CartScreen.js                  # Cart items, promo code entry, item breakdown, store validation
├── CheckoutScreen.js              # Delivery address, COD/Wallet/Online payment selector, S-farmart guarantee
├── OrderTrackingScreen.js         # Real-time multi-step order timeline, rider contact, ETA counter
├── ProfileWalletScreen.js         # Digital S-farmart wallet, past orders history, address book
└── RazorpayCheckoutWebView.js     # Fallback WebView modal for Razorpay checkout integration
```

---

## 📂 Directory Structure

```text
userApp/
├── assets/
│   ├── farmart24_logo.jpg         # Official S-farmart 24 logo asset (1:1 square)
│   ├── farmart_logo.png           # Transparent brand logo PNG
│   ├── icon.png                   # Mobile app launcher icon
│   ├── splash-icon.png            # Mobile splash loading screen icon
│   └── favicon.png                # Web browser tab icon
├── src/
│   ├── components/
│   │   ├── Header.js              # App bar with S-farmart 24 logo, GPS location & cart badge
│   │   ├── ProductCard.js         # Reusable card with veg badge, price, strike MRP & ADD button
│   │   ├── CategoryChip.js        # Horizontal selector pills
│   │   ├── ClearCartModal.js      # Single-store delivery enforcement popup
│   │   └── RoleSelectorModal.js   # Multi-role switcher for demo exploration
│   ├── config/
│   │   └── env.js                 # Universal API configuration (EXPO_PUBLIC_API_URL)
│   ├── context/
│   │   ├── AppContext.js          # Authentication, user session bootstrapping, profile, wallet
│   │   ├── CartContext.js         # Cart operations, quantity updates, order calculation
│   │   └── SocketContext.js       # Real-time WebSocket connection to backend
│   ├── data/
│   │   └── mockData.js            # Catalog data, services, farmer cooperatives & categories
│   ├── navigation/
│   │   └── RootNavigator.js       # Bottom tab bar and Stack Navigation structure
│   ├── screens/
│   │   ├── Auth/                  # LoginScreen.js & SignupScreen.js
│   │   ├── Customer/              # All 9 customer shopping, profile & tracking screens
│   │   ├── Farmer/                # Farmer direct crop listing dashboard
│   │   ├── GrowthPartner/         # City growth distributor portal
│   │   └── VillageHub/            # Women entrepreneur and village hub dashboard
│   ├── services/
│   │   ├── api.js                 # Axios API connector with 15s timeout & single-flight refresh queue
│   │   └── storage.js             # Platform-aware secure token storage (SecureStore / LocalStorage)
│   └── theme/
│       └── colors.js              # Centralized color tokens
├── App.js                         # Root React Native component with ErrorBoundary
├── app.json                       # Expo application manifest ("S-farmart 24")
├── package.json                   # Dependencies & build scripts
└── README.md                      # Documentation (this file)
```

---

## 🔑 1-Tap Demo Customer Account

App ko bina real SMS OTP ke test karne ke liye pre-configured demo credentials:

* **Phone Number:** `9876543210`
* **Password:** `demo123`
* **Customer Name:** `Rajesh Kumar`
* **Demo Email:** `rajesh.customer@sfarmart.in`
* **Preloaded S-farmart Wallet:** `₹250` (`25000` paise in ledger)
* **Delivery Address:** `Flat 402, Green Avenue, Model Town, Ludhiana`
* **1-Tap Quick Login:** Login screen par green card **"⚡ 1-Tap Dummy Customer Login"** par click karein aur direct bina typing ke app me enter ho jayein.

---

## 💻 How to Run Locally

### 1. Web Browser (Fastest & Easiest)
```bash
cd userApp
npm run web
```
App Metro bundler ke zariye start hogi: **[http://localhost:8081](http://localhost:8081)**.

### 2. Smartphone Mobile View (Chrome / Edge DevTools)
1. Browser me `http://localhost:8081` open karein.
2. Keyboard par `F12` dabakar DevTools open karein.
3. `Ctrl + Shift + M` dabakar Device Toolbar toggle karein.
4. Dimensions me **`412 x 924`** (Pixel 7 / Galaxy S21) select karein for authentic smartphone preview.

### 3. Physical Phone via Expo Go
```bash
cd userApp
npm start
```
Terminal me aane wale QR code ko apne phone ke **Expo Go** app se scan karein.

---

## 🛡️ Phase 1: Production Authentication & Session Architecture

S-farmart 24 features a bank-grade, hardened authentication and session management layer:

### 1. Dual-Token Architecture
* **Short-Lived Access Token (15 Minutes):** Signed using `JWT_ACCESS_SECRET` containing `{ id, phone, role }`. Attached to all outbound HTTP requests via `Authorization: Bearer <token>`.
* **Rotating Long-Lived Refresh Token (30 Days):** Cryptographically secure 64-byte hex token stored strictly as a SHA-256 hash in MongoDB (`refreshtokens` collection) with MongoDB TTL indexing.
* **Token Theft Detection (Replay Protection):** Every time `/api/auth/refresh` is called, the used refresh token is revoked and replaced with a new one. If an attacker attempts to reuse an already-revoked refresh token, the server immediately revokes **all** active tokens for that user account (`TOKEN_THEFT_DETECTED`), protecting the user from session hijacking.

### 2. Universal Cross-Platform Token Storage (`src/services/storage.js`)
* **Native (iOS / Android):** Uses hardware-backed `expo-secure-store` for encrypted credential storage.
* **Web (React Native Web):** Uses browser `localStorage` with consistent async wrapper methods:
  * `getAccessToken()`, `setAccessToken(token)`
  * `getRefreshToken()`, `setRefreshToken(token)`
  * `clearTokens()`
  * `getDeviceId()` (persistent UUID generated per installation)

### 3. Single-Flight Axios Auto-Refresh Queue (`src/services/api.js`)
* Outbound requests have a strict 15-second timeout.
* When an access token expires (HTTP 401), concurrent requests do **not** trigger multiple refresh calls. Instead, the first failing request enters a single-flight mutex promise while subsequent requests queue up. Once the refresh completes, all queued requests automatically replay with the fresh access token seamlessly without interrupting user actions.
* If refresh fails (token revoked/expired), the app clears tokens and dispatches `forceLogout`.

### 4. Money Stored in Integer Paise
* To avoid floating-point rounding inaccuracies in financial transactions, all money fields in MongoDB (`walletBalance`, order totals) are stored in **integer paise** (e.g. ₹250.00 = `25000` paise).
* Mongoose schema helper `user.toRupees()` provides human-readable rupee formatting.
* Database migration script `server/scripts/migrate-money-to-paise.js` ensures safe, idempotent conversion.

### 5. Secure In-App Logout Workflow (`ProfileWalletScreen.js`)
* **Confirmation Dialog:** Tapping "Log Out" opens an in-app confirmation modal warning the user: *"Kya aap sure hain? Aapka cart clear ho jayega."*
* **Session Cleanup:**
  1. Calls `POST /api/auth/logout` to revoke the device's refresh token on the server (fire-and-forget with a 3-second timeout).
  2. Clears secure local token storage (`clearTokens()`).
  3. Disconnects live WebSocket connections (`socketService.disconnect()`).
  4. Resets the local shopping cart and user state.
  5. Smoothly redirects the navigation stack to `LoginScreen`.
* **Security & Sessions:** Includes a **"Log out from all devices"** action in the Security section which calls `POST /api/auth/logout-all`, revoking all active sessions across all devices.

---

© 2026 S-farmart 24. All rights reserved. Empowering Farmers • Supporting Home Chefs • Rapid Doorstep Delivery.
