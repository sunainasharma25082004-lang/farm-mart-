# 🌾 Farmart Partner App (`partnerApp`)

The **Farmart Partner App** is a dedicated portal designed for local merchants, farmers, home chefs, cloud kitchens, and village hub operators to manage their digital store, publish farm-fresh produce and food items, process incoming customer orders, and track weekly financial settlements.

Built using **React Native (Expo v57)** with full cross-platform compatibility across **Web (React Native Web)**, **Android**, and **iOS**.

---

## 📑 Table of Contents
1. [Overview & Target Users](#-overview--target-users)
2. [Dummy Partner Credentials & Profile](#-dummy-partner-credentials--profile)
3. [Newly Uploaded Partner Products (Live Test)](#-newly-uploaded-partner-products-live-test)
4. [Architecture & Tech Stack](#-architecture--tech-stack)
5. [Key Features & Functionality](#-key-features--functionality)
6. [State Management & API Integration](#-state-management--api-integration)
7. [Directory Structure](#-directory-structure)
8. [How to Run Locally](#-how-to-run-locally)

---

## 🔑 Dummy Partner Credentials & Profile

The Partner App is pre-configured with a verified partner identity:

* **Store Name:** `Sunita Home Restro & Sweets`
* **Partner / Chef:** `Chef Sunita Sharma`
* **Partner ID:** `default_vendor`
* **Category:** Home Restro & Desi Sweets
* **Phone:** `+91 98765 43210`
* **Rating:** `★ 4.9` (184 orders completed)
* **Weekly Wednesday Settlement:** `₹3,450`
* **Direct Bank Transfer:** State Bank of India (A/c ending in `*4321`)

---

## 🚀 Newly Uploaded Partner Products (Live Test)

The following 3 items were published from this partner profile (`default_vendor`) and immediately propagate to the Customer App (`userApp`):

| Product ID | Product Name | Category | Selling Price | Unit | Initial Stock | Visibility in userApp |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `v-item-4` | **Special Amritsari Chole Kulche Thali** | Home Restro | ₹140 | 1 thali | 20 units | Visible under *Home Chef* & *Market* (`p17`) |
| `v-item-5` | **Desi Ghee Moong Dal Halwa** | Desi Sweets | ₹180 | 250g | 15 units | Visible under *Desi Sweets* & *Home Chef* (`p18`) |
| `v-item-6` | **Farm Fresh Organic Yellow Capsicum** | Organic Farm | ₹60 | 500g | 35 units | Visible under *Farm Veggies* & *Market* (`p19`) |

---

---

## 👥 Overview & Target Users

The Partner App is tailored for:
* **Home Chefs & Women Entrepreneurs:** Publishing homemade thalis, sweets, artisanal bakery, and tiffin subscriptions.
* **Smallholder Farmers & FPOs:** Listing harvested seasonal vegetables, fruits, and dairy products.
* **Village Hub Operators:** Aggregating farm produce and regional staples at the Gram Panchayat level.
* **Local Grocery & Kirana Merchants:** Managing daily inventory and dispatching hyper-local orders.

---

## 🛠️ Architecture & Tech Stack

* **Framework:** [Expo](https://expo.dev/) (SDK 57) + [React Native](https://reactnative.dev/) (v0.86.2)
* **Web Engine:** `react-native-web` (running on Vite / Metro Bundler)
* **Navigation:** `@react-navigation/native` with `@react-navigation/bottom-tabs` & `@react-navigation/native-stack`
* **Icons:** `@expo/vector-icons` (Ionicons)
* **HTTP & API Service:** Axios & native fetch with auto-polling
* **State Management:** React Context API (`PartnerContext`) with optimistic UI updates

---

## 🚀 Key Features & Functionality

```
┌─────────────────────────────────────────────────────────────┐
│                    PARTNER APP SCREENS                      │
├─────────────────┬───────────────────┬───────────────────────┤
│  Orders Queue   │    My Products    │     Wed Payouts       │
│  (Dashboard)    │    (Inventory)    │    (Settlements)      │
└────────┬────────┴─────────┬─────────┴───────────┬───────────┘
         │                  │                     │
         ▼                  ▼                     ▼
• Store Open/Close   • In-stock switch     • Upcoming payout
• Metrics Grid       • Unit & Price        • Bank details
• Accept Orders      • Delete listing      • Weekly receipts
• Ready for Rider    • + Add Product Form  • Transaction logs
```

### 1. Store Online/Offline Controller
* **Real-time Switch:** Located at the top header of the Dashboard (`STORE OPEN` / `CLOSED`).
* **Instant Availability:** When switched to "Closed", customers on the Consumer App (`userApp`) cannot place orders to prevent unfulfilled deliveries during off-hours.

### 2. Live Orders Queue & Fulfillment (`VendorDashboardScreen`)
* **Real-time Order Polling:** Polls the backend every 10 seconds for new incoming orders.
* **Order Lifecycle Workflow:**
  1. **`NEW_ORDER`:** Alert with customer name, items, payment method (Prepaid via Razorpay or Cash On Delivery), and delivery type (Express Rider Dispatch).
  2. **Accept Order:** Partner taps `Accept Order`, transitioning status to `ACCEPTED`.
  3. **Ready for Rider:** Once items/food are packed, partner taps `Ready for Rider`. This notifies nearby delivery riders on the `deliveryApp` to navigate to the store for pickup.
  4. **Completed:** Automatically marked completed once the rider picks up and delivers the package.

### 3. Product & Inventory Management (`InventoryScreen`)
* **View All Listed Items:** Displays all products, current selling price, unit of measurement, and available stock.
* **One-Tap "In Stock / Out" Toggle:** Easily mark items out of stock without deleting them.
* **Delete Listing:** Instant removal of discontinued products.

### 4. Add New Listing Form (`AddProductScreen`)
* **Product Name:** e.g., *Special Punjabi Rajma Thali*, *A2 Bilona Cow Ghee*, *Organic Red Tomatoes*.
* **Category Selector Chips:**
  * `Home Restro`
  * `Organic Farm`
  * `Bakery & Sweets`
  * `Dairy`
  * `Village Hub Goods`
* **Selling Price & Unit:** Numeric input with unit tags (`kg`, `thali`, `500g`, `bunch`).
* **Available Stock Count:** Set initial quantity available for immediate ordering.
* **Publish Action:** Validates required fields, appends to the store catalog, and triggers instant visibility on the consumer application.

### 5. Wednesday Payouts & Settlement Hub (`SettlementsScreen`)
* **Automated Weekly Payouts:** Every Wednesday, accumulated revenue minus platform fees is disbursed directly to the merchant's registered bank account.
* **Hero Payout Card:** Shows current pending balance ready for direct bank transfer.
* **Settlement History Ledger:** Complete audit trail of past weekly payouts with:
  * Date & week cycle
  * Total amount credited
  * Transaction status (`PAID`)
  * Banking reference ID (e.g., `UPI-FMT-99412`)

---

## ⚡ State Management & API Integration

The app uses `PartnerContext.js` located in `src/context/`:
* **`vendor`**: Stores store profile, owner name, category, rating, and open/closed state.
* **`orders`**: Real-time list of active and pending customer orders.
* **`inventory`**: Dynamic list of catalog items with live stock quantities.
* **`settlementHistory`**: History of past financial transactions.
* **Optimistic Updates:** Status updates and product additions update locally in milliseconds while syncing with the backend in the background.

---

## 📂 Directory Structure

```text
partnerApp/
├── .expo/                        # Expo development cache
├── assets/                       # App icons, splash images, and brand assets
├── src/
│   ├── context/
│   │   └── PartnerContext.js     # Central state (orders, store status, inventory)
│   ├── data/
│   │   └── mockPartnerData.js    # Demo data (orders, profile, payouts, products)
│   ├── navigation/
│   │   └── PartnerNavigator.js   # Bottom tabs & Stack navigator configuration
│   ├── screens/
│   │   ├── VendorDashboardScreen.js # Main Dashboard (Metrics & Live Orders Queue)
│   │   └── AddProductScreen.js      # Add Product Form, Inventory & Settlements
│   └── theme/
│       └── colors.js             # Forest green & harvest gold theme palette
├── App.js                        # App entry point with ErrorBoundary & Theme Provider
├── app.json                      # Expo app configuration
├── package.json                  # Dependencies & scripts
└── README.md                     # Documentation (this file)
```

---

## 💻 How to Run Locally

### 1. Run on Web Browser (Recommended)
```bash
cd partnerApp
npm run web
```
The app will bundle via Metro and start on **[http://localhost:8082](http://localhost:8082)**.

### 2. Run on Android Device / Emulator
```bash
cd partnerApp
npm run android
```

### 3. Run on iOS Simulator (macOS required)
```bash
cd partnerApp
npm run ios
```

### 4. Run via Expo Go (Physical Smartphone)
```bash
cd partnerApp
npm start
```
Scan the QR code printed in the terminal using the **Expo Go** app on Android or the Camera app on iOS.

---

© 2026 Farmart. All rights reserved. Empowering Farmers • Building Communities • Growing Bharat.
