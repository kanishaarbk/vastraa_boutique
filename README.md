# Heritage & Co. — Local Shop E-Commerce Website

A simple, modern, and production-ready e-commerce web application built for local small businesses and artisanal shops. It features a curated boutique storefront, dynamic live search, category filtering, stock-bounded persistent cart, Cash on Delivery (COD), Razorpay Test Mode online payments, atomic stock management, and a full Django Admin suite for shop management.

---

## 1. Project Overview

- **Customer Storefront**:
  - **Home Page**: Hero section ("Quality Products. Simple Shopping."), Shop Now action, featured categories, hand-picked featured highlights, and customer trust pillars.
  - **Shop Catalog**: Real-time live dynamic search (updates as you type), category pill filtering, and sorting (price low-to-high, high-to-low, newest).
  - **Product Details**: High-resolution gallery image, category breadcrumbs, stock availability indicators, quantity stepper capped at available inventory, and instant Add to Cart feedback.
  - **Shopping Cart**: Stored in `localStorage` across page visits, instant quantity adjustment, item removal, and a live progress tracker for free local delivery (free on orders $\ge$ ₹500).
  - **Checkout**: Comprehensive client-side and server-side validation for customer details, shipping address, 10-digit mobile number, and 6-digit postal code.
  - **Payment Options**: Cash on Delivery (COD) or Online Payment via Razorpay Standard Checkout (UPI, Cards, NetBanking).
  - **Order Success / Receipt**: Clean receipt displaying Order ID (`ORD-XXXXXXXX`), customer details, payment method & status, and itemized totals.
- **Shop Owner & Admin Management**:
  - Built-in Django Admin dashboard (`/admin/`) with customized `OrderAdmin` and `ProductAdmin`.
  - Batch status updates (`PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `PAID`).
  - Read-only historical snapshot of item prices in `OrderItem` to protect past sales from future price updates.
  - Atomic stock deductions with row-level locks (`select_for_update`) to prevent overselling or race conditions.

---

## 2. Technologies

- **Frontend**:
  - React 19 + Vite
  - React Router v7
  - Plain CSS with custom design system tokens (Wine/Burgundy `#722F37`, modern card styling, responsive layouts)
  - Lucide React icons
  - Dynamic Razorpay Checkout SDK loader
- **Backend**:
  - Python 3.10+ / 3.14
  - Django 5.2
  - Django REST Framework (DRF)
  - Django CORS Headers
  - Python Dotenv
  - Razorpay Python SDK
  - Pillow (Image handling)
- **Database**:
  - SQLite (configured by default for development)
  - Easily switched to PostgreSQL or MySQL for production via environment variables.

---

## 3. Folder Structure

```
ecom/
├── backend/
│   ├── config/              # Django core settings, URL routers, WSGI/ASGI
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── products/            # Categories & Products domain
│   │   ├── models.py        # Category and Product models
│   │   ├── serializers.py   # CategorySerializer, ProductSerializer
│   │   ├── views.py         # ProductViewSet, CategoryViewSet
│   │   ├── urls.py
│   │   ├── admin.py         # ProductAdmin, CategoryAdmin
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py # 4 categories, 15 realistic seed products
│   ├── orders/              # Orders, Order Items, Checkout logic
│   │   ├── models.py        # Order and OrderItem models
│   │   ├── serializers.py   # OrderCreateSerializer, OrderDetailSerializer
│   │   ├── views.py         # Order creation and order detail views
│   │   ├── urls.py
│   │   ├── admin.py         # OrderAdmin with inlines and status actions
│   │   └── tests.py         # 9 automated unit/integration tests
│   ├── payments/            # Razorpay integration & webhook handlers
│   │   ├── services.py      # Razorpay order generation & HMAC-SHA256 signature verification
│   │   ├── views.py         # create-order, verify, webhook
│   │   └── urls.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── public/              # Static assets, fallback SVG placeholders
│   ├── src/
│   │   ├── components/      # 14 reusable components (Navbar, Footer, ProductCard, Cart, etc.)
│   │   ├── context/         # CartContext with localStorage synchronization
│   │   ├── pages/           # 6 views (Home, Shop, ProductDetail, Cart, Checkout, OrderSuccess)
│   │   ├── services/        # Centralized api.js and razorpay.js
│   │   ├── App.css          # Design system, layout, responsive styling
│   │   ├── index.css        # Typography, CSS variables, and base resets
│   │   ├── App.jsx          # Route declarations and layout container
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .env
├── .gitignore
├── .env.example
└── README.md
```

---

## 4. Backend Setup

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On macOS / Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install all required dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

---

## 5. Database Migration & Seed Data

1. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

2. Seed initial realistic categories and products (15 products across 4 categories):
   ```bash
   python manage.py seed_data
   ```

3. Create the Django superuser (Shop Owner Admin):
   ```bash
   python manage.py createsuperuser
   ```
   *(During initial setup, an admin with username `admin` and password `admin123` is automatically available for testing).*

4. Run automated test suite:
   ```bash
   python manage.py test orders.tests
   ```

---

## 6. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Test build production bundle:
   ```bash
   npm run build
   ```

---

## 7. Running the Project Locally

### Start Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```
Backend API will be live at: `http://localhost:8000/api/`  
Django Admin will be live at: `http://localhost:8000/admin/`

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Storefront will be live at: `http://localhost:5173/`

---

## 8. Environment Variables Reference

### Backend (`backend/.env`):
```ini
SECRET_KEY=django-insecure-your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=sqlite:///db.sqlite3

# Razorpay Test Mode Credentials
RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
RAZORPAY_KEY_SECRET=YourTestSecretKeyHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere
```

### Frontend (`frontend/.env`):
```ini
VITE_API_BASE_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
```

---

## 9. Razorpay TEST MODE Setup

1. **Create an account** on [Razorpay](https://razorpay.com).
2. Switch to **Test Mode** using the toggle at the top of the Razorpay Dashboard.
3. Go to **Settings $\rightarrow$ API Keys** and click **Generate Key**.
4. Copy the generated `Key ID` and `Key Secret`:
   - Paste `Key ID` into `backend/.env` as `RAZORPAY_KEY_ID` and `frontend/.env` as `VITE_RAZORPAY_KEY_ID`.
   - Paste `Key Secret` into `backend/.env` as `RAZORPAY_KEY_SECRET`.
5. **Testing Payments**:
   - In Razorpay Checkout popup, select **Cards** or **UPI**.
   - Razorpay provides test card numbers (e.g. `4111 1111 1111 1111`, any future expiry date, CVV `123`).
   - For UPI, select "Success" in the mock UPI prompt.
   - The backend validates the payment signature server-side using HMAC-SHA256, deducts stock atomically, marks the order as `PAID`, and redirects to the Order Success page.

---

## 10. Webhook Configuration

For asynchronous payment reconciliation (e.g. if the customer accidentally closes their browser tab after completing payment in the bank gateway):

1. In the Razorpay Dashboard (Test Mode), navigate to **Settings $\rightarrow$ Webhooks $\rightarrow$ Add New Webhook**.
2. **Webhook URL**: `https://your-backend-domain.com/api/payments/webhook/` (use `ngrok http 8000` during local testing).
3. **Secret**: Set a secure secret and copy it to `RAZORPAY_WEBHOOK_SECRET` in `backend/.env`.
4. **Active Events**: Select `payment.captured` and `payment.failed`.
5. When Razorpay delivers the webhook:
   - Signature in `X-Razorpay-Signature` is validated against the raw body bytes.
   - The handler idempotently updates the order to `PAID`, confirms the order, and reduces stock without double-decrementing.

---

## 11. Testing Checklist

| # | Feature | Test Description | Status |
|---|---|---|---|
| 1 | **Product listing** | Catalog loads active products with price, thumbnail, stock badge | Verified |
| 2 | **Search** | Real-time dynamic search as you type (e.g. "Honey", "Mug") | Verified |
| 3 | **Category filtering** | Pill selectors filter products instantly | Verified |
| 4 | **Product details** | Displays full image, price, description, and available stock | Verified |
| 5 | **Add to cart** | Adds item with visual feedback, updates cart badge count | Verified |
| 6 | **Update cart** | Increases/decreases quantity with inventory boundary limits | Verified |
| 7 | **Remove cart item** | Removes single item or clears cart completely | Verified |
| 8 | **Checkout validation**| Enforces required fields, 10-digit phone, and 6-digit PIN | Verified |
| 9 | **COD order** | Direct order creation, marks PENDING payment & CONFIRMED order | Verified |
| 10 | **Razorpay Test Payment** | Initiates Razorpay checkout with recalculation from DB prices | Verified |
| 11 | **Payment verification** | Verifies HMAC-SHA256 signature server-side | Verified |
| 12 | **Failed payment** | Handles signature mismatch or decline with friendly message | Verified |
| 13 | **Webhook handling** | Handles `payment.captured` idempotently | Verified |
| 14 | **Stock reduction** | Decrements product inventory atomically via `select_for_update` | Verified |
| 15 | **Admin product CRUD**| Allows shop owner to edit price, stock, active status, images | Verified |
| 16 | **Admin order status**| Update orders through PROCESSING, SHIPPED, DELIVERED | Verified |
| 17 | **Responsiveness** | Mobile drawer, single-column phone layout, tablet & desktop grids | Verified |

---

## 12. Production Deployment Notes

1. **Frontend Deployment (Vercel / Netlify / Cloudflare Pages)**:
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Set environment variable: `VITE_API_BASE_URL=https://api.yourshop.com`
2. **Backend Deployment (Render / Railway / DigitalOcean / AWS EC2)**:
   - Set `DEBUG=False` in `backend/.env`.
   - Configure `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to match your production domains.
   - Run `python manage.py collectstatic --noinput`.
   - Run via Gunicorn or Uvicorn:
     ```bash
     gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
     ```
   - Connect PostgreSQL database via `DATABASE_URL` (e.g. `psycopg2-binary`).
   - Store uploaded media files on AWS S3 or Supabase Storage via `django-storages`.
