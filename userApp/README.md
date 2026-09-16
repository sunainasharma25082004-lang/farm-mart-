# 🛒 Farmart Customer App (`userApp`)

The **Farmart Customer App** is the primary consumer-facing storefront of the Farmart hyper-local ecosystem. It connects everyday households with local farmers, certified home chefs (Nari Shakti), community village hubs, and fresh produce marts for fast 30–45 minute doorstep delivery.

Built using **React Native (Expo v57)** with full cross-platform compatibility across **Web (React Native Web)**, **Android**, and **iOS**.

---

## 📑 Table of Contents
1. [Overview & Value Proposition](#-overview--value-proposition)
2. [Dummy Customer Account & 1-Tap Login](#-dummy-customer-account--1-tap-login)
3. [Partner-Uploaded Products Verification](#-partner-uploaded-products-verification)
4. [Ecosystem Synergy: Similarity with Partner App](#-ecosystem-synergy-similarity-with-partner-app)
5. [Architecture & Tech Stack](#-architecture--tech-stack)
6. [Key Features & Screens](#-key-features--screens)
7. [Complete Product Catalog](#-complete-product-catalog)
8. [Directory Structure](#-directory-structure)
9. [How to Run Locally](#-how-to-run-locally)

---

## 🌟 Overview & Value Proposition

* **Direct Farm-to-Kitchen:** Zero synthetic ripening agents; crops harvested daily at dawn from verified smallholders.
* **Authentic Home Chefs:** Wholesome thalis, regional curries, and desi ghee sweets prepared by local women culinary creators.
* **Hyperlocal Speed:** Express delivery dispatch within 30 to 45 minutes powered by the rider network (`deliveryApp`).
* **Flexible Payments:** Integrated Razorpay checkout (UPI, Debit/Credit Cards, NetBanking) and Cash on Delivery (COD).

---

## 🔑 Dummy Customer Account & 1-Tap Login

To test the Customer App without needing real SMS OTPs:

* **Phone Number:** `9876543210`
* **Password:** `demo123`
* **Name:** `Rajesh Kumar` (Verified Household Customer)
* **Delivery Address:** `Flat 402, Green Avenue, Model Town`
* **Village Hub:** `Tarn Taran Village Hub`
* **Preloaded Wallet:** `₹250`
* **1-Tap Quick Login:** On the login screen ([http://localhost:8081](http://localhost:8081)), simply tap the green card:
  **"⚡ 1-Tap Dummy Customer Login"** to bypass login instantly!

---

## 🚀 Partner-Uploaded Products Verification

The following 3 items uploaded by **Chef Sunita Sharma** (`partnerApp`) are now live and directly orderable on this app:

1. 🍲 **Special Amritsari Chole Kulche Thali** (`p17`)
   * **Price:** ₹140 / thali
   * **Source:** Chef Sunita Sharma (`Sunita Home Restro & Sweets`)
   * **Where to see:** Go to the **"Home Chef"** tab or search *"Chole"* on the Home tab.
2. 🍯 **Desi Ghee Moong Dal Halwa** (`p18`)
   * **Price:** ₹180 / 250g
   * **Source:** Chef Sunita Sharma (`Sunita Home Restro & Sweets`)
   * **Where to see:** Go to **"Market" ➔ "Desi Sweets"** or the **"Home Chef"** tab.
3. 🥗 **Farm Fresh Organic Yellow Capsicum** (`p19`)
   * **Price:** ₹60 / 500g
   * **Source:** Chef Sunita Sharma (`Sunita Home Restro & Sweets`)
   * **Where to see:** Go to **"Market" ➔ "Farm Veggies"** or search *"Capsicum"*.

---

## 🔄 Ecosystem Synergy: Similarity with Partner App

The Customer App and Partner App are two sides of the same live marketplace:

| Feature / Data Entity | In Partner App (`partnerApp`) | In Customer App (`userApp`) |
| :--- | :--- | :--- |
| **Featured Chef / Vendor** | **Chef Sunita Sharma** (`Sunita Home Restro & Sweets`) logs in to manage orders. | Customers see **Chef Sunita Sharma** highlighted with 4.9★ rating on the `Home Restro` tab. |
| **Product Listings** | Partner lists *Special Punjabi Rajma Thali* (₹130), *A2 Cow Ghee* (₹650), *Besan Ladoo* (₹240). | Customer browses, views photos, and adds these exact items into their cart. |
| **Stock Management** | If Partner flips toggle to **OUT OF STOCK**, | Item is instantly disabled on the Customer App so customers cannot order it. |
| **Store Open/Closed** | Partner flips **STORE CLOSED** switch at night. | Customer App displays store as closed; ordering is paused. |
| **Order Placement** | When customer clicks **Place Order**, it rings in Partner App's **Live Orders Queue**. | Customer receives an order ID (e.g., `#FMT-ORD-9821`) and can track status live. |
| **Order Preparation** | Partner taps **Ready for Rider**. | Customer's screen status updates in real-time to *"Out for Delivery"*. |

---

## 🛠️ Architecture & Tech Stack

* **Framework:** [Expo](https://expo.dev/) (SDK 57) + [React Native](https://reactnative.dev/) (v0.86.2)
* **Web Engine:** `react-native-web` (running on Vite / Metro Bundler)
* **Navigation:** `@react-navigation/native` with `@react-navigation/bottom-tabs` & `@react-navigation/native-stack`
* **Icons:** `@expo/vector-icons` (Ionicons)
* **HTTP & API Service:** Axios & native fetch
* **Payment Integration:** Razorpay WebView Gateway (`RazorpayCheckoutWebView.js`)
* **State Management:** React Context API (`AppContext.js`) managing user profile, active cart, and order states

---

## 📱 Key Features & Screens

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER APP TABS & FLOW                        │
├───────────────┬──────────────┬──────────────┬─────────────┬────────────┤
│     Home      │    Market    │  Home Chef   │   Orders    │  Profile   │
│  (Discovery)  │  (Catalog)   │ (HomeRestro) │ (Tracking)  │  (Wallet)  │
└───────┬───────┴──────┬───────┴──────┬───────┴──────┬──────┴─────┬──────┘
        │              │              │              │            │
        ▼              ▼              ▼              ▼            ▼
• Search & Banners • Categorized  • Women Chefs  • Step-by-   • ₹250 Wallet
• 30-min Delivery  • Unit pricing • Daily Thali  •  step live • Saved addrs
• Top Categories   • In-stock tag • Desi Sweets  •  tracking  • Past bills
```

### 1. Home Screen & Daily Showcase (`HomeScreen.js`)
* **Live Search Bar:** Instant keyword search across veggies, groceries, thalis, and sweets.
* **Offer Banner Carousel:** Automatic 3-second animated carousel showcasing seasonal discounts and harvest alerts.
* **Quick Service Strip:** Indicators for *30–45 min delivery*, *Farm fresh daily*, and *Quality checked*.
* **Service Pills:** Fast filtering between *Farmart Mart*, *Direct Farm Harvest*, *Home Restro*, *Bakery & Sweets*, and *Handmade Care*.

### 2. Fresh Market & Catalog Screen (`CatalogScreen.js`)
* Multi-category selector chips: `All`, `Farm Veggies`, `Fresh Fruits`, `Dairy & Ghee`, `Farmart Mart`.
* Two-column product grid with high-resolution imagery, farmer origin details, discount tags, and `Add to Cart` controls.

### 3. Home Restro & Chef Showcase (`HomeRestroScreen.js`)
* Dedicated hub for hygienic, authentic meals prepared by verified women micro-entrepreneurs.
* Profile cards for popular community cooks (e.g. *Chef Sunita Sharma*, *Chef Manjeet Kaur*).
* Direct ordering for freshly prepared lunch & dinner thalis, artisanal whole-wheat bread, and organic jaggery sweets.

### 4. Cart & Dynamic Checkout (`CartScreen.js` & `CheckoutScreen.js`)
* Incremental item quantity increment/decrement with real-time bill calculations.
* Breakdown: Item Total, Delivery Fee (Free above ₹199), Platform Fee, Taxes.
* Address selection (Home, Office, Village Hub).
* Payment choice: **Instant Online Pay (Razorpay UPI / Cards)** or **Cash on Delivery**.

### 5. Live Order Tracking (`OrderTrackingScreen.js`)
* Step-by-step visual tracker:
  1. `Order Placed` (Received by system)
  2. `Store Packing` (Partner preparing harvest or food)
  3. `Rider Out for Delivery` (Rider en route with live ETA)
  4. `Delivered`
* Call Rider & Call Support direct action buttons.

### 6. Profile & Wallet Balance (`ProfileWalletScreen.js`)
* Customer digital wallet with referral rewards and cashbacks.
* Saved address book and order history archive.

### 7. Farmer Direct Sell Access (`FarmerDashboardScreen.js`)
* An integrated sub-module allowing smallholder farmers to switch modes and publish newly harvested crops directly to the marketplace with expected yield, harvest date, and asking price.

---

## 📦 Complete Product Catalog

The Customer App comes pre-configured with authentic product lines across 5 core categories:

### 🥦 1. Direct Farm Harvest (Veggies & Fruits)
* **Farm Fresh Organic Red Tomatoes** — ₹38 / kg *(Farmer: Sukhwinder Singh, Tarn Taran)*
* **Kinnow Mandarin Fresh Fruits** — ₹75 / kg *(Farmer: Gurpreet Orchards, Abohar)*
* **Crisp Punjab Green Spinach (Palak)** — ₹25 / bunch *(Farmer: Harpreet Organics)*
* **Royal Shimla Red Apples** — ₹160 / kg *(Himachal Farm Producer Co-Op)*

### 🌾 2. Farmart Mart (Grocery & Daily Staples)
* **Pure Desi Cow Ghee (A2 Bilona)** — ₹650 / 500g *(Farmart Dairy Cooperative)*
* **Organic Whole Sharbati Wheat Atta** — ₹290 / 5kg *(Stone-ground Chakki Fresh)*
* **Cold-Pressed Kachi Ghani Mustard Oil** — ₹195 / 1L *(Wood-pressed, zero chemical)*
* **Aromatic Aged Royal Basmati Rice** — ₹480 / 5kg *(2-year aged grain)*

### 🍱 3. Home Restro Meals (Certified Women Chefs)
* **Special Punjabi Rajma Rice Thali** — ₹130 / thali *(Chef Sunita Sharma)*
* **Authentic Sarson Saag & Makki Roti Meal** — ₹160 / meal *(Chef Manjeet Kaur)*
* **Homemade Paneer Butter Masala Combo** — ₹150 / combo *(Chef Sunita Sharma)*

### 🍬 4. Bakery & Sweets
* **Handmade Organic Gur Besan Ladoo** — ₹240 / 500g *(No refined sugar)*
* **Freshly Baked Whole Wheat Bread** — ₹45 / loaf *(Daily baked, no chemicals)*
* **Pure Kaju Katli Gift Box** — ₹420 / 500g *(Festival diamond cuts)*

### 🧼 5. Women Entrepreneur Handmade Care
* **Artisanal Organic Neem & Turmeric Soap** — ₹90 / bar *(Handmade Cold-Process)*

---

## 📂 Directory Structure

```text
userApp/
├── .expo/                        # Expo development cache
├── assets/                       # App icons, splash images, and brand assets
├── src/
│   ├── components/
│   │   ├── Header.js             # Top app bar with search & cart counter
│   │   ├── ProductCard.js        # Reusable product display component
│   │   └── CategoryChip.js       # Horizontal category selector pill
│   ├── context/
│   │   └── AppContext.js         # Global store (Cart, Profile, Orders, Roles)
│   ├── data/
│   │   └── mockData.js           # Comprehensive product catalog & chef profiles
│   ├── navigation/
│   │   └── RootNavigator.js      # Bottom tabs & stack routes setup
│   ├── screens/
│   │   ├── Auth/                 # Login & Signup screens
│   │   ├── Customer/
│   │   │   ├── HomeScreen.js           # Main landing & hero carousel
│   │   │   ├── CatalogScreen.js        # Market explorer
│   │   │   ├── HomeRestroScreen.js     # Home chefs & thalis
│   │   │   ├── CartScreen.js           # Cart basket
│   │   │   ├── CheckoutScreen.js       # Address & payment selector
│   │   │   ├── OrderTrackingScreen.js  # Live tracking timeline
│   │   │   ├── ProfileWalletScreen.js  # Profile & wallet funds
│   │   │   └── RazorpayCheckoutWebView.js # Payment gateway modal
│   │   └── Farmer/
│   │       └── FarmerDashboardScreen.js# Farmer direct crop listing tool
│   ├── services/
│   │   └── api.js                # REST API endpoints service
│   └── theme/
│       └── colors.js             # Vibrant green and harvest color tokens
├── App.js                        # Root entry point with ErrorBoundary
├── app.json                      # Expo mobile app configuration
├── package.json                  # Dependencies & scripts
└── README.md                     # Documentation (this file)
```

---

## 💻 How to Run Locally

### 1. Run on Web Browser (Recommended)
```bash
cd userApp
npm run web
```
The app will bundle via Metro and start on **[http://localhost:8081](http://localhost:8081)**.

### 2. Run on Android Device / Emulator
```bash
cd userApp
npm run android
```

### 3. Run on iOS Simulator (macOS required)
```bash
cd userApp
npm run ios
```

### 4. Run via Expo Go (Physical Smartphone)
```bash
cd userApp
npm start
```
Scan the QR code in the terminal using **Expo Go** on Android or Camera app on iOS.

---

© 2026 Farmart. All rights reserved. Empowering Farmers • Building Communities • Growing Bharat.
