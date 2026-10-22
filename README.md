# Wallet Pass System — Setup & Reproduction Guide

## Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- An Apple Developer account (paid)
- A Google Cloud project with Wallet API enabled
- AWS S3 bucket for image storage

> 💡 **Step-by-Step Credentials Guide**:
> For an in-depth walkthrough on obtaining all certificates, service account JSON files, and configuration variables, read [How_to_get_env_files.md](./How_to_get_env_files.md).

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

> 📘 **Detailed Step-by-Step Walkthrough**:
> See the dedicated [How_to_get_env_files.md](./How_to_get_env_files.md) for a comprehensive, click-by-click guide with official portal links on how to obtain every key, certificate, and environment variable from Google Cloud, Google Pay & Wallet Console, and the Apple Developer Member Center.

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
- 🎨 **Modern Admin UI**: Responsive, premium dashboard built with Vue.js and Tailwind CSS featuring interactive pass chips and quick actions.
- 📱 **Digital Wallet Integration**:
  - **Google Wallet**: Instant dynamic pass generation with one-click Save to Wallet (`/google/pass/:userId`).
  - **Apple Wallet**: Certified `.pkpass` generation and download with custom filename prefix (`/apple/pass/:userId`).
- ⚡ **Pass Chips & Actions**:
  - **Google Chip**: Click opens a new tab navigating directly to the Google Wallet save interface.
  - **Apple Chip**: Click downloads the `.pkpass` bundle prefixed with the user's name (e.g. `George_ikwegbu_pass.pkpass`).
- 📸 **Smart Scanning**: Dual-mode QR scanner (Camera + Image Upload) with automatic camera lifecycle management.
- 💰 **Rewards System**: Dynamic point deduction and manual credit with Email/UUID support.
- 🏛️ **Transaction Persistence**: Complete, searchable history of all point transactions stored in a robust database.
- 👥 **User Management**: Quick registration and management of users with instant pass generation.

---

## 6. Run Locally

### Step 1: Start PostgreSQL Database
```bash
docker compose up -d
```
*(Runs on host port `5433` mapped to internal `5432`)*

### Step 2: Start Backend (Core)
```bash
cd core
npm run start:dev
```

### Step 3: Start Admin Dashboard
```bash
cd admin
npm run dev
```

---

## 7. Testing Passes on Mobile with ngrok (HTTPS Tunneling)

Both Apple Wallet and Google Wallet have strict HTTPS and hostname requirements when issuing passes or delivering pass updates to physical smartphones:

- **Apple Wallet**: iOS **strictly requires** HTTPS for `webServiceURL`. If the backend URL uses plain `http://localhost`, iOS devices will refuse to register the pass or check for updates.
- **Google Wallet**: Google Wallet JWT tokens enforce an `origins` check. Testing on a physical Android device requires a publicly reachable HTTPS origin.

### How to set up ngrok:

1. **Start ngrok tunnel on port 3000**:
   ```bash
   ngrok http 3000
   ```
   Or if you have a persistent ngrok free domain:
   ```bash
   ngrok http --url=https://your-domain.ngrok-free.dev 3000
   ```

2. **Update `core/.env`**:
   ```dotenv
   API_BASE_URL=https://your-domain.ngrok-free.dev
   ```

3. **Update `admin/.env` (optional, for cross-device admin testing)**:
   ```dotenv
   VITE_API_BASE_URL=https://your-domain.ngrok-free.dev
   ```

4. **Verify pass generation**:
   - Google pass redirect: `https://your-domain.ngrok-free.dev/google/pass/<userId>`
   - Apple pass download: `https://your-domain.ngrok-free.dev/apple/pass/<userId>`

---

## 8. Pass Endpoints API Reference

| Endpoint | Method | Description | Response |
|---|---|---|---|
| `/google/pass/:userId` | `GET` | Generates a Google Wallet pass and redirects | `302 Redirect` to `https://pay.google.com/gp/v/save/<jwt>` |
| `/google/url/:userId` | `GET` | Generates a Google Wallet pass URL | JSON: `{ "saveUrl": "https://pay.google.com/..." }` |
| `/apple/pass/:userId` | `GET` | Generates and signs a `.pkpass` bundle | Binary file (`application/vnd.apple.pkpass`), filename: `<Name>_pass.pkpass` |
| `/users/register` | `POST` | Registers a user and creates passes | JSON with user details, `googlePassUrl`, `applePassUrl` |

---

## 9. Hosting & Production

1. Host the NestJS core on Railway, Render, Fly.io, or any Node host.
2. Set all environment variables in the host's dashboard — NOT via `.env` file.
3. The app reads everything from `process.env` automatically via `env.config.ts`.
4. Ensure your Apple `.pkpass` download endpoint is HTTPS (required by iOS).
5. Register your hosted API URL with the Apple Wallet web service if using push updates.

---

## 10. Register First Admin & Issue First Pass

1. POST `/api/auth/login` with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.
2. Open admin dashboard → Users → Enter First Name, Last Name, and Email.
3. Click **Add User** — the system generates passes automatically.
4. Click the **GOOGLE** chip to open the Google Wallet save page, or click the **APPLE** chip to download the `<Fullname>_pass.pkpass` file.

---

## 11. QR Redemption Flow

1. User opens wallet pass on their smartphone → QR code is displayed (contains signed token).
2. Merchant scans QR via admin dashboard → RewardScanner component.
3. System validates token → deducts 10 points → decrements ticket quantity.
4. Both Google and Apple passes update in real time.

