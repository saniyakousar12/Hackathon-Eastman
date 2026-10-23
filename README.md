# AdaptiveCart – Smart E-Commerce Cart & Checkout System

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?style=flat-square&logo=swagger)](http://localhost:5000/api/docs)
[![Tests](https://img.shields.io/badge/Tests-42_Passing-brightgreen?style=flat-square)](http://localhost:5000)

**AdaptiveCart** is an intelligent full-stack e-commerce application designed to tackle common online shopping friction points. It combines personalized product discovery, automatic coupon optimization, smart cart alternatives, and gamified spending rewards to deliver maximum value to shoppers while driving merchant conversions.

---

## 🚀 Quick Links

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **API Swagger Documentation**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **API Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🌟 Key Features

### 1. Personalized Shopping Experience (Section 2.1)
- **Neutral Default Dashboard**: Initial view features trending products, editor's picks, and popular deals without assuming user preferences.
- **Dynamic Shopping Persona Modes**:
  - **Budget Smart Mode**: Highlights high-value products under ₹2,500 with steep discounts (15%+ off).
  - **Premium Collection**: Surfaces luxury and top-rated items (4.5★+) crafted with premium materials.
  - **All-Rounder**: Balanced mix across trending categories.
- **Preference Controls**: Instant switching between **Electronics**, **Fashion**, **Home & Living**, **Beauty**, and **Sports & Fitness**.
- **Dynamic Content Updates**: Micro-copy, banners, and curated product grids transform instantly to reflect active preferences.

### 2. Smart Coupon Optimizer (Section 2.2)
- **Automatic Best Deal Discovery**: Continuously evaluates every available coupon against the active cart:
  - `SAVE10`: 10% off (up to ₹1,000) on orders ≥ ₹2,000
  - `FLAT500`: Flat ₹500 discount on orders ≥ ₹3,000
  - `WELCOME15`: 15% off on orders ≥ ₹5,000 (up to ₹1,050)
  - `SUPER20`: 20% discount on orders ≥ ₹5,000 (up to ₹2,000)
  - `FREESHIP`: Free shipping waiver on eligible carts
  - `SPEND3K-5PCT` & `SPEND5K-10PCT`: Milestone rewards
- **"Best Deal Found!" Summary Card**: Displays transparent breakdown:
  - Original Subtotal
  - Maximum Available Discount
  - Net Payable Amount
  - Comparison insight (e.g., *"Saves ₹350 more than SAVE10"*)
  - 1-Click **"Apply Best Deal"** button.
- **Coupon Comparison Drawer**: Transparently lists all coupons, reasons for locked codes, and the exact shortfall amount needed to unlock each.

### 3. Smart Product Swap (Section 2.3)
- **Affordable Alternatives Engine**: Scans items in the user's cart and recommends cheaper alternatives within the same category.
- **Side-by-Side Comparison**:
  - Compares prices, ratings, review counts, and key feature bullets (e.g. battery life, connectivity, warranty).
  - Explicit savings calculation (e.g. *"Save ₹1,500 on this item"*).
- **1-Click Cart Swap**: Replaces the expensive item in-place with its alternative without leaving the cart view.

### 4. Smart Spending Rewards (Section 2.4)
- **Gamified Tiered Progress Bar**:
  - **₹3,000 Milestone**: Unlocks 5% bonus coupon (`SPEND3K-5PCT`)
  - **₹5,000 Milestone**: Unlocks 10% bonus coupon (`SPEND5K-10PCT`)
  - **₹8,000 Milestone**: Unlocks VIP Exclusive Gift + Express Shipping (`VIP-GIFT-8K`)
- **Real-Time Shortfall Alert**: Dynamic notification alerting users how close they are to the next perk (e.g., *"Only ₹250 away from unlocking 10% extra savings!"*).
- **Smart Filler Recommendations**: Surfaces low-cost essential items matching the shortfall budget with a 1-click **"+ Add & Unlock Reward"** action.

### 5. Smart Checkout & Savings Dashboard (Section 2.5)
- **Comprehensive Savings Breakdown**:
  - Total MRP
  - Retailer Discount Savings
  - Applied Coupon Savings
  - Delivery Fee (Free on orders ≥ ₹2,000, Silver+ loyalty tier, or coupon)
  - Final Payable Amount
  - **Celebration Banner**: Prominently highlights total money saved in rupees and percentage.
- **Fast Checkout Flow**: Complete form with validation for name, phone, PIN code, and simulated payment methods (UPI, Cards, Cash on Delivery).
- **Order Confirmation & Tracking**: Generates unique order IDs, displays confirmed status badges, and itemized breakdown.

### 6. Authentication Guard & Action Continuation
- **Protected Actions**: Adding an item to the shopping bag or saving to the wishlist requires user authentication.
- **Contextual Notification**: Sign-in modal explicitly states why authentication is requested (e.g., *"Sign in to continue: We'll automatically add 'Wireless Headphones' to your bag as soon as you sign in!"*).
- **Auto-Continuation ("If Yes, Continue")**: Upon successful login (via OTP code `123456` or the 1-Click Demo Sign In button), the pending action resumes and completes automatically without requiring a second click.

### 7. Verified Accurate 200-Product Catalog
- **1-to-1 Product-Image Accuracy**: Enriched through `scripts/enrich-products.js` with 50 specific high-resolution Unsplash product photographs ensuring air fryers show air fryers, yoga mats show yoga mats, and keyboards show keyboards.
- Complete metadata for each product including categories, subcategories, features, ratings, stock, and discount tiers.

---

## 🛠️ Architecture & Technology Stack

```
                     ┌─────────────────────────────────────────┐
                     │          React 19 + Vite (UI)           │
                     │  - Adaptive Layout & Hero Banner        │
                     │  - State Management & LocalStorage Sync │
                     │  - Auth Guard & Action Continuation     │
                     └────────────────────┬────────────────────┘
                                          │
                                HTTP REST │ Reverse Proxy (Vite :5173)
                                          ▼
                     ┌─────────────────────────────────────────┐
                     │           Express.js 5 API              │
                     │  - Coupon Optimizer Engine              │
                     │  - Product Swap Engine                  │
                     │  - Spending Rewards Engine              │
                     │  - OTP Auth & Order Processing          │
                     └────────────┬───────────────┬────────────┘
                                  │               │
        ┌─────────────────────────┴────┐     ┌────┴────────────────────────┐
        │ Dual-Engine In-Memory Store  │     │ Prisma ORM + PostgreSQL     │
        │ (Default zero-config setup)  │     │ (13 Production Data Models) │
        └──────────────────────────────┘     └─────────────────────────────┘
```

| Component | Technology | Highlights |
|---|---|---|
| **Frontend** | React 19, Vite 8, Lucide React, Vanilla CSS | Fast HMR, micro-animations, glassmorphism, responsive mobile-first UI |
| **Backend API** | Node.js, Express 5 | REST endpoints, rate limiting, CORS, JWT authentication |
| **Data Layer** | PostgreSQL & Prisma ORM + In-Memory Fallback | Zero-configuration immediate startup with full PostgreSQL migration path |
| **API Contract** | OpenAPI 3.0 & Swagger UI | Interactive API documentation accessible at `/api/docs` |
| **Testing** | Node.js Test Runner & Supertest | 42 unit and integration tests across 12 test suites |

---

## 📂 Project Directory Structure

```
EastMan/
├── api/                                # Express.js REST Backend
│   ├── prisma/
│   │   ├── schema.prisma               # Prisma PostgreSQL schema (13 models)
│   │   └── seed.js                     # PostgreSQL seeder script
│   ├── src/
│   │   ├── config/                     # Config & environment variables
│   │   ├── controllers/                # Request & response controllers
│   │   ├── data/
│   │   │   ├── db.js                   # Transactional in-memory database
│   │   │   ├── products.json           # 200 raw products dataset
│   │   │   └── enriched_products.json  # 200 products with matched imagery
│   │   ├── middleware/                 # Auth JWT & validation middleware
│   │   ├── routes/                     # Modular API endpoints
│   │   ├── services/                   # Business logic (cart, coupons, rewards)
│   │   ├── app.js                      # Express app configuration & Swagger mount
│   │   └── server.js                   # HTTP server entrypoint
│   ├── docs/
│   │   └── openapi.yaml                # OpenAPI 3.0 specification
│   ├── tests/
│   │   └── api.test.js                 # 42 unit & integration tests
│   └── package.json                    # Backend dependencies & test scripts
├── smartsave/                          # React + Vite Frontend
│   ├── public/
│   │   ├── hero-bg.jpg                 # Hero section background banner
│   │   └── products.json               # 200 verified products catalog
│   ├── src/
│   │   ├── App.jsx                     # Core application component
│   │   ├── App.css                     # Component styles & animations
│   │   ├── index.css                   # Global variables & typography
│   │   └── main.jsx                    # Vite application entry point
│   ├── vite.config.js                  # Dev server & API proxy config
│   └── package.json                    # Frontend dependencies
├── scripts/
│   └── enrich-products.js              # Product image & metadata enrichment pipeline
└── package.json                        # Root monorepo workspace scripts
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* PostgreSQL 14+ if using persistent relational storage

### 1. Start Both Frontend & Backend (Monorepo Root)

From the project root:
```bash
# Start backend API (Port 5000)
npm run server

# In another terminal, start frontend client (Port 5173)
npm run client
```

Or run directly from their respective folders:

#### Backend API (`api/`)
```bash
cd api
npm start
# Server starts at http://localhost:5000
# Swagger UI available at http://localhost:5000/api/docs
```

#### Frontend Client (`smartsave/`)
```bash
cd smartsave
npm run dev
# App opens at http://localhost:5173
```

---

## 🧪 Testing

The backend includes 42 automated tests validating cart management, coupon calculation rules, spending milestone triggers, and checkout operations.

To run the test suite:
```bash
cd api
npm test
```

To validate the frontend build:
```bash
cd smartsave
npm run build
```

---

## 🔌 API Reference

The interactive Swagger UI is available at **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**.

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health status check |
| `POST` | `/api/send-otp` | Generate login/signup OTP (Dev code: `123456`) |
| `POST` | `/api/verify-otp` | Verify OTP and issue session token |
| `GET` | `/api/products` | Retrieve catalog with category, price & rating filters |
| `GET` | `/api/products/:id` | Get individual product details |
| `GET` | `/api/cart` | Fetch user cart with subtotal & item counts |
| `POST` | `/api/cart/items` | Add product to active cart |
| `POST` | `/api/cart/swap` | Perform 1-click smart product swap |
| `POST` | `/api/coupons/optimize` | Run coupon optimization engine on active cart |
| `POST` | `/api/coupons/validate` | Validate custom promo code against cart subtotal |
| `GET` | `/api/rewards/progress` | Fetch spending milestone progress and shortfall |
| `POST` | `/api/checkout` | Process order, apply discounts, and generate receipt |
| `GET` | `/api/orders` | Fetch past order history |

---

## 🗄️ PostgreSQL Setup (Optional)

By default, AdaptiveCart uses a fully functional in-memory database engine for immediate out-of-the-box execution. To use PostgreSQL:

1. Configure your connection string in `api/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/adaptivecart?schema=public"
   ```
2. Push the Prisma schema:
   ```bash
   cd api
   npx prisma db push
   ```
3. Seed the database with the 200 catalog products, categories, coupons, and reward rules:
   ```bash
   cd api
   npm run seed
   ```

---

## 🎨 Design & Accessibility Highlights
- **Palette**: Slate dark/light modes with vibrant accent gradients (`#ff3f6c` pink, `#14958f` teal, `#ff8f00` amber).
- **Typography**: Clean, modern system typography with balanced hierarchy.
- **Micro-Interactions**: Smooth scale transforms on hover, animated progress meters, and real-time toast feedback.
- **Responsive Layout**: Designed for seamless usage across desktop, tablet, and mobile displays.

---

## 📄 License
This project is licensed under the ISC License.
