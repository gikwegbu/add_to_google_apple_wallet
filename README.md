# Wallet Pass System — Setup & Reproduction Guide

## Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- An Apple Developer account (paid)
- A Google Cloud project with Wallet API enabled
- AWS S3 bucket for image storage

---

## 1. Clone & Install
```bash
git clone https://github.com/gikwegbu/add_to_google_apple_wallet.git
cd wallet-system
```
# Install core backend

```bash
cd core && npm install
```

# Install admin dashboard

```bash
cd ../admin && npm install
```

---

## 2. Google Wallet Setup

1. Go to Google Cloud Console → Enable "Google Wallet API"
2. Create a Service Account → download JSON key → rename to `service-account.json`
3. Place `service-account.json` inside `core/`
4. Go to Google Pay & Wallet Console → Register as an issuer
5. Note your Issuer ID and create a Pass Class — note the Class ID
6. Grant your service account the "Google Wallet Object Issuer" role

---

## 3. Apple Wallet Setup

1. Log in to Apple Developer Portal
2. Create a Pass Type ID under Identifiers (e.g. pass.com.yourcompany.wallet)
3. Generate a Pass Certificate for that Pass Type ID — download the .p12 file
4. Convert to PEM:
   openssl pkcs12 -in certificate.p12 -clcerts -nokeys -out passcertificate.pem
   openssl pkcs12 -in certificate.p12 -nocerts -out passkey.pem
5. Download Apple WWDR certificate from https://www.apple.com/certificateauthority/
   Rename to wwdr.pem
6. Place all three PEM files in `apple/certs/`
7. For push notifications (APNs), create an APNs key in Developer Portal — note Key ID

---

## 4. Environment File Setup
```bash
cp core/.env.example core/.env
```

Fill in all values:
- DATABASE_URL → your PostgreSQL connection string
- GOOGLE_ISSUER_ID, GOOGLE_CLASS_ID → from Google Wallet Console
- GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY → from service-account.json
- APPLE_TEAM_ID → your Apple Developer Team ID
- APPLE_PASS_TYPE_IDENTIFIER → the Pass Type ID created above
- APPLE_CERT_PASSPHRASE → passphrase you set when exporting .p12
- APPLE_APN_KEY_ID → from your APNs key
- S3_* → your AWS S3 credentials and bucket name
- ADMIN_JWT_SECRET → a strong random string (openssl rand -base64 32)

When hosting: all values in .env are read via process.env at runtime.
Never commit .env or any PEM/JSON credential files to version control.

---

## 5. Database (PostgreSQL) Setup

1. **Start PostgreSQL via Docker** (Recommended):
   The project includes a `docker-compose.yml` for easy database setup.
   ```bash
   # From the root directory
   docker-compose up -d
   ```
   This will start a PostgreSQL instance on port `5432` with:
   - User: `user`
   - Password: `password`
   - Database: `wallet_db`
   - Port: `5433`

2. **Verify Database is Running**:
   ```bash
   docker-compose ps
   ```

3. **Initialize Schema & Migrations**:
   ```bash
   cd core
   npx prisma migrate dev --name init
   npx prisma generate
   ```

---

## Features
- 🎨 **Modern Admin UI**: Responsive, premium dashboard built with Vue.js and Tailwind CSS.
- 📱 **Digital Wallet Integration**: Support for Google Wallet (and Apple Wallet hooks) for digital passes.
- 📸 **Smart Scanning**: Dual-mode QR scanner (Camera + Image Upload) with automatic camera lifecycle management.
- 💰 **Rewards System**: Dynamic point deduction and manual credit with Email/UUID support.
- 🏛️ **Transaction Persistence**: Complete, searchable history of all point transactions stored in a robust database.
- 👥 **User Management**: Quick registration and management of users with instant pass generation.

## 6. Run Locally

# Backend
```bash
cd core
npm run start:dev
```
# Admin dashboard
```bash
cd admin
npm run dev
```

---

## 7. Hosting & Production

1. Host the NestJS core on Railway, Render, or any Node host
2. Set all environment variables in the host's dashboard — NOT via .env file
3. The app reads everything from process.env automatically via env.config.ts
4. Ensure your Apple .pkpass download endpoint is HTTPS (required by iOS)
5. Register your hosted API URL with the Apple Wallet web service if using push updates

---

## 8. Register First Admin & Issue First Pass

1. POST /api/auth/login with ADMIN_EMAIL and ADMIN_PASSWORD from .env
2. Open admin dashboard → Users → Add a user email
3. System provisions a Google Wallet pass link and an Apple .pkpass file for that user
4. User clicks the link on their device → pass is added to their wallet

---

## 9. QR Redemption Flow

1. User opens wallet pass → QR code is displayed (contains signed token)
2. Merchant scans QR via admin dashboard → RewardScanner component
3. System validates token → deducts 10 points → decrements ticket quantity
4. Both Google and Apple passes update in real time
