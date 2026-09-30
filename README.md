# SiraHub (ሲራሀብ) — On-Demand Local Trades Marketplace (Addis Ababa)

**SiraHub** is a high-performance, mobile-first Progressive Web App (PWA) connecting clients with verified local skilled technicians (plumbers, electricians, painters, DSTV installers, and appliance repairers) in Addis Ababa, Ethiopia.

Featuring **100% Escrow Buyer Protection** via **Chapa** and **Telebirr**, ensuring clients only release payment once work is verified and approved.

---

## 🚀 Key Features

- **Mobile-First 3G Performance**: Under 2 seconds load time on Ethiopian mobile networks with client-side photo compression before upload.
- **Progressive Web App (PWA)**:
  - Installable ("Add to Home Screen" enabled)
  - Offline caching strategy via custom Service Worker (`/sw.js`)
  - Dedicated offline fallback page (`/offline.html`)
  - Real-time offline / reconnect toasts
- **Localization (i18n)**:
  - English (EN)
  - Amharic (አማርኛ)
  - Tigrigna (ትግርኛ)
- **Addis Ababa Coverage**:
  - Full Sub-City filtering (Bole, Kazanchis, Piassa, Megenagna, Kirkos, Arada, Lideta, Yeka, Nifas Silk, Kolfe, Akaki Kality, Gullele)
- **Complete Escrow Payment Cycle**:
  1. Client books a service -> funds initialized & marked `HELD_IN_ESCROW` via Chapa / Telebirr.
  2. Technician delivers service and marks job `COMPLETED`.
  3. Client inspects work and clicks **"Confirm Job & Release Funds"**.
  4. SiraHub deducts **10% platform fee** and releases **90% payout** to technician via Telebirr mobile wallet.
  5. Client submits verified star rating & review.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS, Lucide React Icons
- **Database & ORM**: PostgreSQL + PostGIS via Prisma ORM
- **Payment Gateways**: Chapa API (CBE Birr, Awash, Cards) & Telebirr Direct (ETB)
- **PWA**: Custom Service Worker + Web App Manifest (`manifest.json`)
- **Image Compression**: HTML5 Canvas Client-Side Compression (<200KB from 5MB+ phone cameras)

---

## 📂 Project Structure

```
SiraHub/
├── app/
│   ├── layout.tsx                     # Root layout with PWA meta & i18n provider
│   ├── page.tsx                       # Homepage (Search, Sub-City filter, categories, top-rated carousel)
│   ├── technicians/
│   │   ├── page.tsx                   # Technician listing & filters
│   │   └── [id]/page.tsx              # Technician detail (Bio, Portfolio, Reviews, Book CTA)
│   ├── dashboard/
│   │   ├── client/page.tsx            # Client Dashboard (Active jobs, Escrow release, Review modal)
│   │   └── technician/page.tsx        # Technician Hub (Online/Offline switch, Accept/Decline, Earnings)
│   ├── auth/login/page.tsx            # Passwordless Phone OTP & 1-Click Demo Profiles
│   └── api/
│       ├── payments/
│       │   ├── initialize/route.ts    # Chapa & Escrow initialization
│       │   ├── webhook/route.ts       # Chapa payment webhook
│       │   └── release-escrow/route.ts# 10% fee deduction & 90% Telebirr payout release
│       ├── jobs/                      # Job requests CRUD & status updates
│       ├── technicians/               # Technicians listing & availability toggle
│       └── categories/                # Trade categories
├── components/
│   ├── Navbar.tsx                     # Mobile header, language switcher & auth status
│   ├── Footer.tsx                     # Sub-city directory & escrow guarantee details
│   ├── BookingModal.tsx               # 3-step booking with client-side image compression
│   ├── SubCitySelector.tsx            # Addis Ababa sub-city dropdown
│   ├── PWAInstallBanner.tsx           # Native PWA install prompt banner
│   ├── OfflineIndicator.tsx           # Real-time network monitor
│   ├── StarRating.tsx                 # Interactive and display star rating
│   └── EscrowBadge.tsx                # Trust badges and escrow banners
├── lib/
│   ├── prisma.ts                      # Prisma Client singleton
│   ├── db.ts                          # Resilient database service layer
│   ├── i18n/                          # Dictionaries (EN, AM, TI) & context
│   └── storage/image-compressor.ts    # 3G client-side image compression
├── prisma/
│   └── schema.prisma                  # PostgreSQL schema with PostGIS support
└── public/
    ├── manifest.json                  # PWA Web App Manifest
    ├── sw.js                          # Service Worker for offline caching
    └── offline.html                   # Offline fallback screen
```

---

## 🚦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file based on `.env.example`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sirahub?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CHAPA_SECRET_KEY="CHASECK_TEST-your-chapa-secret-key"
NEXT_PUBLIC_CHAPA_PUBLIC_KEY="CHAPUBK_TEST-your-public-key"
TELEBIRR_APP_ID="your-telebirr-app-id"
TELEBIRR_APP_KEY="your-telebirr-app-key"
TELEBIRR_SHORT_CODE="123456"
NEXTAUTH_SECRET="your-secret-key"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Escrow & Demo Accounts

Instant 1-click demo logins are available at `/auth/login`:
- **Master Plumber**: Abebe Kebede (Bole Atlas)
- **Electrician**: Almaz Tefera (Kazanchis)
- **Client**: Selamawit Girma (Bole Medhanialem)