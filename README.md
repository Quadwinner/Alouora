# Beautify/Alouora E-Commerce Platform

> A modern beauty e-commerce platform featuring dual branding (BEAUTIFY & ALOUORA) with 32+ screens, built with Next.js 14, TypeScript, and Supabase.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-blue.svg)

---

## 🌟 Features

### Dual Brand System
- **BEAUTIFY** - Authentication, Cart, Simple flows with soft pink aesthetics
- **ALOUORA** - Main shopping experience with elegant, sophisticated design

### Core Functionality
- 🔐 Authentication (Google OAuth + Phone OTP)
- 🛍️ Product Catalog & Advanced Filtering
- 🛒 Shopping Cart & Checkout
- 💳 Payment Integration (Razorpay, Stripe, UPI, Wallets, COD)
- 📦 Order Management & Live Tracking
- ⭐ Product Reviews & Ratings
- ❤️ Wishlist
- 👤 User Profile & Address Management
- 💰 Wallet & Rewards System
- 📱 Fully Responsive Design
- ♿ Accessible (WCAG 2.1 AA)

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** TailwindCSS v4 + CSS Modules
- **State Management:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod
- **UI Components:** Headless UI + Heroicons
- **Animations:** Framer Motion

### Backend
- **API:** Next.js API Routes
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime

### Third-party Services
- **Payments:** Razorpay (primary) + Stripe (optional)
- **SMS:** Twilio / MSG91
- **Email:** Resend / SendGrid
- **Analytics:** Google Analytics 4 + Mixpanel
- **Monitoring:** Sentry
- **CDN:** Cloudinary (optional)

### Deployment
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions

---

## 📁 Project Structure

```
beautify-alouora/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Auth layout group (BEAUTIFY brand)
│   │   │   ├── signin/
│   │   │   └── verify-otp/
│   │   ├── (shop)/            # Main shop layout (ALOUORA brand)
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   └── checkout/
│   │   ├── (account)/         # User account pages
│   │   │   ├── profile/
│   │   │   ├── orders/
│   │   │   ├── wishlist/
│   │   │   └── wallet/
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   └── orders/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   ├── auth/              # Auth components
│   │   ├── product/           # Product components
│   │   ├── cart/              # Cart components
│   │   └── layout/            # Layout components
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   ├── auth/              # Auth helpers
│   │   ├── api/               # API clients
│   │   └── utils.ts           # Utility functions
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   ├── types/                 # TypeScript types
│   ├── constants/             # Constants & config
│   └── styles/                # Global styles
├── public/
│   ├── images/
│   └── icons/
├── .env.example               # Environment variables template
├── .env.local                 # Local environment (git-ignored)
└── tsconfig.json              # TypeScript configuration
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js:** v20.x or higher
- **npm/yarn/pnpm:** Latest version
- **Git:** Latest version
- **Supabase Account:** [Sign up here](https://supabase.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd beautify-alouora
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and fill in your values:
   - Supabase credentials (get from Supabase dashboard)
   - Google OAuth credentials (configure in Supabase Auth)
   - SMS provider credentials (Twilio or MSG91)
   - Payment gateway keys (Razorpay or Stripe)
   - Other API keys as needed

4. **Set up Supabase**

   a. Create a Supabase project at [supabase.com](https://supabase.com)

   b. Run database migrations:
   ```bash
   npx supabase init
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   c. Enable authentication providers in Supabase Dashboard:
   - Google OAuth
   - Phone authentication

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎨 Brand System

### BEAUTIFY Brand
**Used for:** Authentication, Cart, Simple flows

**Colors:**
- Primary: `#E8A1B4` (Soft Pink)
- Secondary: `#B8A1D8` (Lavender Purple)
- Accent: `#F5E6EA` (Light Pink)
- Background: `#FAF0F3`

**Usage in code:**
```tsx
<button className="bg-beautify-primary text-white hover:bg-beautify-primary-dark">
  Sign In
</button>
```

### ALOUORA Brand
**Used for:** Main shopping experience, Product pages

**Colors:**
- Primary: `#FFC4D6` (Soft Pink)
- Secondary: `#6B4C9A` (Deep Purple)
- Accent: `#D4A574` (Gold/Warm)
- Background: `#FFF9F5`

**Usage in code:**
```tsx
<button className="bg-alouora-primary text-white hover:bg-alouora-primary-dark">
  Add to Cart
</button>
```

---

## 📝 Development Guidelines

### Code Style
- **TypeScript:** Strict mode enabled, no `any` types
- **Naming:** camelCase for variables, PascalCase for components
- **Imports:** Use absolute imports with `@/` prefix
- **Comments:** JSDoc for public APIs

---

## 📚 Documentation

- [Implementation Plan](../PLAN.md) - Detailed development roadmap
- [Full Documentation](../BEAUTIFY_ALOURA_DEVELOPMENT_DOCUMENTATION.md) - Complete specifications

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

---

## 📄 License

This project is proprietary and confidential.

---

Made with ❤️ by the Beautify/Alouora Team
