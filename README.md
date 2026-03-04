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
3. Generate a Pass Certificate for that Pass Type ID — download the `pass.cer` file
4. Double click on the `pass.cer` to open it in `keychains` then export it as `pass.p12`

    ###
        NB: From Step 4, you will be asked to enter a password to export the certificate. This is the `APPLE_CERT_PASSPHRASE` environment variable.

        Furthermore, make sure the .cer file is in the login default keychain and not in the System keychain, as it won't allow you export it as a .p12 file (It'll literally grey it out).

        Best option, copy the .cer file to the login default keychain and then export it as a .p12 file.

5. Convert to PEM:
    ```bash
    #Extract the certificate (unencrypted)
    openssl pkcs12 -in pass.p12 -clcerts -nokeys -out passcertificate.pem

    #Extract the private key (unencrypted)
    openssl pkcs12 -in pass.p12 -nocerts -nodes -out passkey.pem
    ```

    ###
        NB: Navigate to the directory where you exported the .p12 file in your terminal before running the commands in Step 5. That way, the PEM files will be created in the same directory. Then copy after running the command, copy the `passcertificate.pem` and `passkey.pem` files to the `core/apple/certs/` directory.
        
        From Step 5, you will be asked to enter a password to export the certificate. This is the `APPLE_CERT_PASSPHRASE` environment variable.

        Enter the same password you used to export the .p12 file. Or if you didn't set one, just press enter.

6. Verify the PEM files
    ```bash
    openssl x509 -in passcertificate.pem -noout -text | grep "Subject"
    openssl rsa -in passkey.pem -noout -text | grep "Private"
    ```

7. Download Apple World Wide Developer Relations G4 Certificate from https://www.apple.com/certificateauthority/
   Convert to .pem and save as `wwdr.pem`. This is your pass signing certificate.

    ```bash
    openssl x509 -inform DER -in AppleWWDRCAG4.cer -out wwdr.pem
    ```

    ###
        NB: Navigate to the directory where you downloaded the `AppleWWDRCAG4.cer` file in your terminal before running the command in Step 7. That way, the PEM file will be created in the same directory. Then copy after running the command, copy the `wwdr.pem` file to the `core/apple/certs/` directory.

8. Place all three PEM files in `apple/certs/`
9. For push notifications (APNs), create an APNs key in Developer Portal — note Key ID
    ###
        1. Go to Apple Developer Portal → Certificates, Identifiers & Profiles
        2. Click Keys (left sidebar)
        3. Click + to create a new key
        4. Give it a name and check Apple Push Notifications service (APNs)
        5. Click Continue → Register → Download the .p8 file
        6. Note down the Key ID (a 10-character string like ABC1234DEF)

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
