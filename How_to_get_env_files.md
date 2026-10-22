# Complete Walkthrough: How to Obtain All Environment Files & Credentials

This guide is an end-to-end, step-by-step walkthrough detailing how to obtain every file, certificate, key, and environment variable required to run and deploy the **Google & Apple Wallet Pass System**.

Whether you are configuring the project for local development or preparing for production hosting, follow this guide to acquire credentials directly from the respective official developer portals.

---

## Table of Contents

1. [Architectural Overview & Credential Files](#1-architectural-overview--credential-files)
2. [Master Quick Reference Table](#2-master-quick-reference-table)
3. [Server & Network Configuration](#3-server--network-configuration)
4. [Database Configuration (PostgreSQL & Prisma)](#4-database-configuration-postgresql--prisma)
5. [Google Wallet Setup (Complete Walkthrough)](#5-google-wallet-setup-complete-walkthrough)
   - [Step 5.1: Create Project & Enable Google Wallet API](#step-51-create-project--enable-google-wallet-api)
   - [Step 5.2: Create a Google Cloud Service Account](#step-52-create-a-google-cloud-service-account)
   - [Step 5.3: Generate & Download the Service Account JSON Key](#step-53-generate--download-the-service-account-json-key)
   - [Step 5.4: Register in Google Pay & Wallet Business Console](#step-54-register-in-google-pay--wallet-business-console)
   - [Step 5.5: Link Service Account to Wallet Console (CRITICAL)](#step-55-link-service-account-to-wallet-console-critical)
   - [Step 5.6: Obtain Issuer ID & Define Class ID](#step-56-obtain-issuer-id--define-class-id)
6. [Apple Wallet Setup (Complete Walkthrough)](#6-apple-wallet-setup-complete-walkthrough)
   - [Step 6.1: Locate your Apple Developer Team ID](#step-61-locate-your-apple-developer-team-id)
   - [Step 6.2: Register a Pass Type Identifier](#step-62-register-a-pass-type-identifier)
   - [Step 6.3: Generate a Certificate Signing Request (CSR) on macOS](#step-63-generate-a-certificate-signing-request-csr-on-macos)
   - [Step 6.4: Create & Download the Pass Type ID Certificate](#step-64-create--download-the-pass-type-id-certificate)
   - [Step 6.5: Import Certificate into Keychain & Export as .p12](#step-65-import-certificate-into-keychain--export-as-p12)
   - [Step 6.6: Convert .p12 to PEM Files via OpenSSL](#step-66-convert-p12-to-pem-files-via-openssl)
   - [Step 6.7: Download Apple WWDR Intermediate Certificate (G4)](#step-67-download-apple-wwdr-intermediate-certificate-g4)
   - [Step 6.8: Verify All Apple PEM Certificates](#step-68-verify-all-apple-pem-certificates)
   - [Step 6.9: Place Files in `apple/certs/` & Sync `pass.json`](#step-69-place-files-in-applecerts--sync-passjson)
   - [Step 6.10: Create an Apple Push Notification service (APNs) Key](#step-610-create-an-apple-push-notification-service-apns-key)
7. [Pass Assets & Visual Branding](#7-pass-assets--visual-branding)
8. [Rewards & Scanning Logic Configuration](#8-rewards--scanning-logic-configuration)
9. [Admin Authentication & Security](#9-admin-authentication--security)
10. [Cloud File Storage (AWS S3)](#10-cloud-file-storage-aws-s3)
11. [Admin Frontend Configuration (Vite Vue App)](#11-admin-frontend-configuration-vite-vue-app)
12. [Production Deployment & Secret Management](#12-production-deployment--secret-management)
13. [End-to-End Verification Checklist](#13-end-to-end-verification-checklist)

---

## 1. Architectural Overview & Credential Files

The project consists of two applications and a physical certificates/templates directory:
- **`core/`**: NestJS backend handling pass issuance, signing, verification, database operations, and QR code redemption.
- **`admin/`**: Vue 3 + Tailwind CSS admin dashboard for merchants/staff to scan QR passes, manage users, and configure tickets.
- **`apple/certs/`**: Physical directory housing the Apple Wallet signing certificates and private keys.
- **`apple/templates/`**: Physical directory housing the base Apple Pass structure (`pass.json`).

```
google_apple_wallet/
├── apple/
│   ├── certs/
│   │   ├── passcertificate.pem   # Extracted Apple Pass Certificate
│   │   ├── passkey.pem           # Extracted Apple Private Key
│   │   ├── wwdr.pem              # Apple WWDR G4 Intermediate Certificate
│   │   └── pass.p12              # Exported certificate bundle (backup)
│   ├── templates/
│   │   └── pass.json             # Base Apple Wallet Pass definition
│   └── assets/                   # Pass bundle images (icon, logo, strip)
├── core/
│   ├── .env                      # Backend runtime environment configuration
│   ├── .env.example              # Template for backend environment variables
│   └── service-account.json      # Google Cloud Service Account private key file
└── admin/
    ├── .env                      # Admin local environment configuration
    └── .env.production           # Admin production build configuration
```

---

## 2. Master Quick Reference Table

| Variable Name | Environment File | Example Value | Where to Obtain / Official Portal |
| :--- | :--- | :--- | :--- |
| `PORT` | `core/.env` | `3000` | Local port for NestJS server. |
| `NODE_ENV` | `core/.env` | `development` or `production` | Set manually based on environment. |
| `API_BASE_URL` | `core/.env` | `http://localhost:3000` | Backend API URL (must be HTTPS in production). |
| `DATABASE_URL` | `core/.env` | `postgresql://user:password@localhost:5433/wallet_db` | Docker container or Cloud PostgreSQL instance. |
| `GOOGLE_APPLICATION_CREDENTIALS` | `core/.env` | `./service-account.json` | [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts) |
| `GOOGLE_ISSUER_ID` | `core/.env` | `3388000000023066256` | [Google Pay & Wallet Console](https://pay.google.com/business/console/) |
| `GOOGLE_CLASS_ID` | `core/.env` | `3388000000023066256.codelab_class` | [Google Pay & Wallet Console](https://pay.google.com/business/console/) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `core/.env` | `sa@project.iam.gserviceaccount.com` | From downloaded `service-account.json`. |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | `core/.env` | `"-----BEGIN RSA PRIVATE KEY-----\n..."` | From downloaded `service-account.json`. |
| `APPLE_TEAM_ID` | `core/.env` | `NXQNVCYXQ2` | [Apple Developer Membership](https://developer.apple.com/account/#!/membership) |
| `APPLE_PASS_TYPE_IDENTIFIER` | `core/.env` | `pass.com.yourcompany.wallet` | [Apple Developer Identifiers](https://developer.apple.com/account/resources/identifiers/list) |
| `APPLE_CERT_PATH` | `core/.env` | `apple/certs/passcertificate.pem` | Extracted from `pass.p12` via OpenSSL. |
| `APPLE_KEY_PATH` | `core/.env` | `apple/certs/passkey.pem` | Extracted from `pass.p12` via OpenSSL. |
| `APPLE_WWDR_PATH` | `core/.env` | `apple/certs/wwdr.pem` | [Apple Certificate Authority (WWDR G4)](https://www.apple.com/certificateauthority/) |
| `APPLE_CERT_PASSPHRASE` | `core/.env` | `your_export_passphrase` | Password entered when exporting `.p12` from Keychain. |
| `APPLE_APN_KEY_ID` | `core/.env` | `4MVZD89RK3` | [Apple Developer Keys](https://developer.apple.com/account/resources/authkeys/list) |
| `APPLE_APN_TEAM_ID` | `core/.env` | `NXQNVCYXQ2` | Same as `APPLE_TEAM_ID`. |
| `APPLE_APN_TOPIC` | `core/.env` | `pass.com.yourcompany.wallet` | Same as `APPLE_PASS_TYPE_IDENTIFIER`. |
| `PASS_ORGANIZATION_NAME` | `core/.env` | `Your Brand Name` | Display name of pass issuer. |
| `PASS_DESCRIPTION` | `core/.env` | `Electronic Ticket & Rewards Pass` | User-facing pass summary. |
| `PASS_LOGO_URL` | `core/.env` | `https://your-cdn.com/logo.png` | Public HTTPS image URL for event/pass logo. |
| `REWARD_POINTS_PER_SCAN` | `core/.env` | `10` | Default points deducted per ticket scan. |
| `REWARD_BASE_QUANTITY` | `core/.env` | `10` | Default ticket quantity for new users. |
| `ADMIN_JWT_SECRET` | `core/.env` | Generated base64 string | Generated locally with `openssl rand -base64 32`. |
| `ADMIN_EMAIL` | `core/.env` | `admin@yourcompany.com` | Primary admin username for login. |
| `ADMIN_PASSWORD_HASH` | `core/.env` | Bcrypt hash string | Generated via Node.js / `bcrypt`. |
| `S3_BUCKET_NAME` | `core/.env` | `your-wallet-assets` | [AWS S3 Console](https://s3.console.aws.amazon.com/s3/) |
| `S3_ACCESS_KEY` | `core/.env` | `AKIAIOSFODNN7EXAMPLE` | [AWS IAM Console](https://console.aws.amazon.com/iam/) |
| `S3_SECRET_KEY` | `core/.env` | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | [AWS IAM Console](https://console.aws.amazon.com/iam/) |
| `S3_REGION` | `core/.env` | `us-east-1` | AWS S3 region code. |
| `VITE_API_BASE_URL` | `admin/.env` | `http://localhost:3000` | URL of the NestJS backend for the frontend API client. |

---

## 3. Server & Network Configuration

These variables dictate how the backend listens and how public pass clients communicate with the server.

```dotenv
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000
```

### Guidance:
1. **`PORT`**: The TCP port on which the NestJS HTTP application listens. Default is `3000`.
2. **`NODE_ENV`**: Set to `development` for local testing or `production` when deployed.
3. **`API_BASE_URL`**:
   - In **Local Development**: `http://localhost:3000` (or an HTTPS tunnel when testing passes on physical phones).
   - In **Local Testing with Physical Mobile Devices (ngrok)**:
     - Run `ngrok http 3000` (or `ngrok http --url=https://<your-subdomain>.ngrok-free.dev 3000`).
     - Set `API_BASE_URL=https://<your-subdomain>.ngrok-free.dev` in `core/.env`.
     - *Why?* iOS strictly refuses plain `http://` for Apple Wallet's `webServiceURL`, and Google Wallet requires authorized origins. An HTTPS ngrok tunnel enables full live testing on iPhone and Android devices from your local machine.
   - In **Production**: Must be a fully-qualified public HTTPS URL (e.g. `https://wallet-core.fly.dev` or `https://api.yourdomain.com`).
   - > **Important**: Apple Wallet strictly requires HTTPS for the pass web service (`webServiceURL`). If this URL uses plain `http://`, iOS devices will refuse to register the pass for automatic updates.

---

## 4. Database Configuration (PostgreSQL & Prisma)

The system uses [Prisma ORM](https://www.prisma.io/) connected to a PostgreSQL database to manage users, ticket configurations, point balances, and transaction history.

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5433/wallet_db
```

### Option A: Local Setup with Docker Compose (Recommended)
The project includes a ready-to-use [`docker-compose.yml`](file:///Users/georgeikwegbu/Developer/Github/google_apple_wallet/docker-compose.yml):

1. **Start the database container**:
   ```bash
   # From the project root
   docker compose up -d
   ```
2. **Exposed Port Notice**:
   - The container maps internal port `5432` to host port **`5433`** to prevent collisions with any native PostgreSQL running on your machine.
   - Use the connection string:
     ```dotenv
     DATABASE_URL=postgresql://user:password@localhost:5433/wallet_db
     ```
3. **Run Prisma Migrations & Generate the Client**:
   ```bash
   cd core
   npx prisma migrate dev --name init
   npx prisma generate
   ```

### Option B: Cloud-Hosted PostgreSQL (Production)
For hosting on platforms like [Neon](https://neon.tech/), [Supabase](https://supabase.com/), [Fly.io Postgres](https://fly.io/docs/postgres/), or [AWS RDS](https://aws.amazon.com/rds/):
1. Create a PostgreSQL 14+ database instance.
2. Copy the database connection URI (e.g., `postgresql://postgres:<password>@<host>:5432/<dbname>?sslmode=require`).
3. Set `DATABASE_URL` in `core/.env` to this URI.
4. Run migrations: `npx prisma migrate deploy && npx prisma generate`.

---

## 5. Google Wallet Setup (Complete Walkthrough)

Google Wallet passes require credentials from two distinct Google platforms:
1. **Google Cloud Console**: For API enablement and service account private keys.
2. **Google Pay & Wallet Business Console**: For issuer registration and pass class management.

---

### Step 5.1: Create Project & Enable Google Wallet API
1. Navigate to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create a new Google Cloud Project (or select an existing one):
   - Click the project dropdown at the top navigation bar.
   - Click **New Project**, enter a name (e.g. `Wallet-Pass-Service`), and click **Create**.
3. Open the **[Google Wallet API Library Page](https://console.cloud.google.com/apis/library/walletobjects.googleapis.com)**.
4. Verify your active project is selected in the top bar.
5. Click the blue **Enable** button.

---

### Step 5.2: Create a Google Cloud Service Account
1. In the Google Cloud Console, navigate to **[IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)**.
2. Click **+ Create Service Account** at the top of the screen.
3. Fill in the Service Account Details:
   - **Service account name**: e.g., `wallet-issuer-sa`
   - **Service account ID**: `wallet-issuer-sa` (auto-populated)
   - **Service account description**: `Service account for issuing Google Wallet passes`
4. Click **Create and Continue**.
5. *(Optional)* Role assignment can be skipped here because issuer authorization happens inside the Google Pay & Wallet Console.
6. Click **Done**.
7. Note down the full email address created (e.g. `wallet-issuer-sa@wallet-pass-service.iam.gserviceaccount.com`). This is your `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

---

### Step 5.3: Generate & Download the Service Account JSON Key
1. In the **Service Accounts** list, locate the service account you just created.
2. Click the three dots icon (⋮) under the **Actions** column on the far right and select **Manage keys**.
3. Click **Add Key** > **Create new key**.
4. Select **JSON** as the key type and click **Create**.
5. Your browser will automatically download a file named `<project-id>-<hash>.json`.
6. **Move and rename this file**:
   - Move the file to `core/service-account.json`.
   - Verify that `core/.gitignore` includes `*.json` or `service-account.json` to prevent accidentally committing private keys.
7. Open the JSON file in your code editor to locate:
   - `"client_email"`: Matches `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
   - `"private_key"`: Contains the multiline RSA private key (with `\n`).

---

### Step 5.4: Register in Google Pay & Wallet Business Console
1. Navigate to the **[Google Pay & Wallet Business Console](https://pay.google.com/business/console/)**.
2. Sign in with the Google Account that will manage your organization's pass issuer status.
3. Complete the business registration profile if prompted (Business Name, Country, Contact Details).
4. In the left navigation sidebar, click on **Google Wallet API** (or **Passes**).
5. Click **Create an Issuer** (or **Request Access**).
6. Provide your issuer business information and submit. Once approved or initialized, you will see your **Issuer Dashboard**.

---

### Step 5.5: Link Service Account to Wallet Console (CRITICAL)

> [!CAUTION]
> **This is the #1 most common point of failure for Google Wallet.**
> Even if your Service Account has "Owner" in Google Cloud, it **cannot** issue or modify Google Wallet passes until it is explicitly added as an authorized user inside the Google Pay & Wallet Console.
> Failure to complete this step results in `401 Unauthorized: Request had invalid authentication credentials` or `403 Forbidden: Not an issuer`.

1. In the **[Google Pay & Wallet Console](https://pay.google.com/business/console/)**.
2. Look for **Users**.
3. Click **Invite a user**.
4. Paste the full `GOOGLE_SERVICE_ACCOUNT_EMAIL` (e.g., `wallet-issuer-sa@wallet-pass-service.iam.gserviceaccount.com`).
5. Set the permission level to **Developer** or **Admin**.
6. Click **Save** / **Add**.

---

### Step 5.6: Obtain Issuer ID & Define Class ID

1. **Find your Issuer ID**:
   - In the **[Google Pay & Wallet Console](https://pay.google.com/business/console/)**, under the **Google Wallet API** overview page, locate the **Issuer ID**.
   - This is an 18-to-20 digit numeric string (e.g., `3388000000023066256`).
   - Copy this value into `GOOGLE_ISSUER_ID`.

2. **Define your Class ID**:
   - Google Wallet requires classes to be namespaced by your Issuer ID in the format:
     ```
     <GOOGLE_ISSUER_ID>.<custom_class_suffix>
     ```
   - Example: If your Issuer ID is `3388000000023066256`, set:
     ```dotenv
     GOOGLE_CLASS_ID=3388000000023066256.codelab_class
     ```
   - > **Automatic Class Creation**: The backend service (`core/src/google/google.service.ts`) automatically checks whether this Generic Class exists on startup during `onModuleInit()`. If it does not exist, the server automatically calls the Google Wallet API to create it for you!

3. **Verify the Google Wallet `.env` block**:
   ```dotenv
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
   GOOGLE_ISSUER_ID=3388000000023066256
   GOOGLE_CLASS_ID=3388000000023066256.codelab_class
   GOOGLE_SERVICE_ACCOUNT_EMAIL=wallet-issuer-sa@wallet-pass-service.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA..."
   ```

---

## 6. Apple Wallet Setup (Complete Walkthrough)

Apple Wallet requires cryptographic signing using PKCS#7 / CMS certificates signed by Apple's Worldwide Developer Relations (WWDR) Certificate Authority.

### Prerequisites:
- An active paid **[Apple Developer Program](https://developer.apple.com/programs/)** membership ($99/year).
- A Mac computer with **Keychain Access** (or standard OpenSSL command-line tools).

---

### Step 6.1: Locate your Apple Developer Team ID
1. Log in to the **[Apple Developer Account Portal](https://developer.apple.com/account/)**.
2. Click on the **[Membership Details](https://developer.apple.com/account/#!/membership)** tab in the left sidebar.
3. Locate the **Team ID** (a 10-character alphanumeric string like `NXQNVCYXQ2`).
4. Set `APPLE_TEAM_ID=NXQNVCYXQ2` in `core/.env`.

---

### Step 6.2: Register a Pass Type Identifier
1. Go to **[Certificates, Identifiers & Profiles > Identifiers](https://developer.apple.com/account/resources/identifiers/list)**.
2. Click the blue **+** button next to Identifiers.
3. Select **Pass Type IDs** and click **Continue**.
4. Fill in the details:
   - **Description**: A human-readable title (e.g. `Store Rewards Pass`).
   - **Identifier**: A reverse-domain string that **MUST** start with `pass.` (e.g., `pass.com.yourcompany.wallet`).
5. Click **Continue**, review your details, and click **Register**.
6. Set `APPLE_PASS_TYPE_IDENTIFIER=pass.com.yourcompany.wallet` in `core/.env`.

---

### Step 6.3: Generate a Certificate Signing Request (CSR) on macOS
To create the signing certificate, you must generate a private key and a `.certSigningRequest` file:

1. Open the **Keychain Access** app on your Mac (`Cmd + Space` > type `Keychain Access`).
2. In the top macOS menu bar, click:
   **Keychain Access** > **Certificate Assistant** > **Request a Certificate from a Certificate Authority...**
3. In the Certificate Assistant window:
   - **User Email Address**: Enter your Apple ID email.
   - **Common Name**: Enter a descriptive name (e.g., `Wallet Pass Signing Key`).
   - **CA Email Address**: Leave blank.
   - **Request is**: Select **Saved to disk**.
   - Check **Let me specify key pair information**.
4. Click **Continue**.
5. Set **Key Size** to `2048 bits` and **Algorithm** to `RSA`.
6. Save the file to your desktop as `CertificateSigningRequest.certSigningRequest`.

---

### Step 6.4: Create & Download the Pass Type ID Certificate
1. Return to the **[Apple Developer Certificates](https://developer.apple.com/account/resources/certificates/list)** page.
2. Click the blue **+** button to create a new certificate.
3. Under the **Services** section, select **Pass Type ID Certificate** and click **Continue**.
4. Select the Pass Type ID you registered in Step 6.2 (e.g. `pass.com.yourcompany.wallet`) and click **Continue**.
5. Under **Upload a Certificate Signing Request**, click **Choose File** and select the `CertificateSigningRequest.certSigningRequest` generated in Step 6.3.
6. Click **Continue**.
7. Click **Download** to save your new certificate: `pass.cer`.

---

### Step 6.5: Import Certificate into Keychain & Export as .p12

> [!IMPORTANT]
> **Keychain Placement Rule**:
> Ensure that `pass.cer` is imported into your **login** keychain, NOT the **System** keychain. If imported into System, macOS will grey out the `.p12` export option!

1. In Keychain Access, select the **login** keychain in the left sidebar under "Default Keychains".
2. Double-click the downloaded `pass.cer` file to import it.
3. In Keychain Access, click the **My Certificates** tab.
4. Locate the certificate:
   - Name will appear as: `Pass Type ID: pass.com.yourcompany.wallet`.
   - Click the small disclosure triangle (▶) on the left of the certificate name to expand it and confirm that your private key is nested underneath it.
5. Right-click on the parent certificate row and choose **Export "Pass Type ID: pass.com.yourcompany.wallet"...**
6. In the Save dialog:
   - **File Format**: Select **Personal Information Exchange (.p12)**.
   - **File Name**: `pass.p12`.
   - Choose a save destination (e.g. Desktop).
   - Click **Save**.
7. A prompt will ask for a password to protect the exported items:
   - Enter a secure password (e.g., `MyWalletSecret2026`).
   - **Remember this password** — this is your `APPLE_CERT_PASSPHRASE`!
   - (If you leave it blank, `APPLE_CERT_PASSPHRASE` will be empty).

---

### Step 6.6: Convert .p12 to PEM Files via OpenSSL

The `@walletpass/pass-js` library requires certificates and private keys in PEM format. Open your terminal in the directory where you saved `pass.p12`:

```bash
# 1. Extract the certificate (unencrypted PEM format)
openssl pkcs12 -in pass.p12 -clcerts -nokeys -out passcertificate.pem

# 2. Extract the private key (decrypted RSA private key in PEM format)
openssl pkcs12 -in pass.p12 -nocerts -nodes -out passkey.pem
```

*When prompted for `Enter Import Password:`, enter the passphrase you defined in Step 6.5.*

---

### Step 6.7: Download Apple WWDR Intermediate Certificate (G4)

Apple Wallet requires Apple's World Wide Developer Relations Intermediate Certificate to complete the trust chain.

1. Navigate to the official **[Apple Certificate Authority Portal](https://www.apple.com/certificateauthority/)**.
2. Scroll to the **Apple Intermediate Certificates** section.
3. Locate **Worldwide Developer Relations - G4 (Expiring 12/10/2030)**.
4. Download the certificate file: [`AppleWWDRCAG4.cer`](https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer).
5. In your terminal, convert the DER-encoded certificate to PEM format:
   ```bash
   openssl x509 -inform DER -in AppleWWDRCAG4.cer -out wwdr.pem
   ```

---

### Step 6.8: Verify All Apple PEM Certificates

Run these validation commands to verify your certificates before using them in the application:

```bash
# Verify the Pass Certificate
openssl x509 -in passcertificate.pem -noout -subject -dates
# Expected Subject: .../UID=pass.com.yourcompany.wallet/CN=Pass Type ID: pass.com.yourcompany.wallet/...

# Verify the Private Key
openssl rsa -in passkey.pem -check -noout
# Expected output: RSA key ok

# Verify the Apple WWDR Intermediate Certificate
openssl x509 -in wwdr.pem -noout -subject -dates
# Expected Subject: .../CN=Apple Worldwide Developer Relations Certification Authority/OU=G4/...
```

---

### Step 6.9: Place Files in `apple/certs/` & Sync `pass.json`

1. **Move the three PEM files into the repository's `apple/certs/` directory**:
   ```bash
   cp passcertificate.pem /path/to/google_apple_wallet/apple/certs/
   cp passkey.pem /path/to/google_apple_wallet/apple/certs/
   cp wwdr.pem /path/to/google_apple_wallet/apple/certs/
   ```

2. **Verify Path Resolution**:
   In `core/src/apple/apple.service.ts`, paths are resolved relative to the project root:
   ```typescript
   const rootDir = path.resolve(process.cwd(), '..');
   const certPath = path.resolve(rootDir, this.configService.get('apple.certPath'));
   ```
   Therefore, configure `core/.env` with paths relative to the project root:
   ```dotenv
   APPLE_CERT_PATH=apple/certs/passcertificate.pem
   APPLE_KEY_PATH=apple/certs/passkey.pem
   APPLE_WWDR_PATH=apple/certs/wwdr.pem
   APPLE_CERT_PASSPHRASE=your_export_passphrase
   ```

3. **Synchronize `apple/templates/pass.json`**:
   Open [`apple/templates/pass.json`](file:///Users/georgeikwegbu/Developer/Github/google_apple_wallet/apple/templates/pass.json) and ensure the identifiers match your Apple Developer credentials:
   ```json
   {
       "formatVersion": 1,
       "passTypeIdentifier": "pass.com.yourcompany.wallet",
       "teamIdentifier": "NXQNVCYXQ2",
       "organizationName": "Your Organization Name",
       "description": "Electronic Ticket & Rewards Pass"
   }
   ```
   > **Note**: If `passTypeIdentifier` in `pass.json` does not match the Subject UID of `passcertificate.pem`, pass generation or iOS device installation will fail with a signature verification error.

---

### Step 6.10: Create an Apple Push Notification service (APNs) Key

To send dynamic updates to passes already installed on users' iPhones (e.g. when points are redeemed or balance updates), configure APNs:

1. In the Apple Developer portal, go to **[Certificates, Identifiers & Profiles > Keys](https://developer.apple.com/account/resources/authkeys/list)**.
2. Click the blue **+** button to register a new Key.
3. Fill in the Key registration form:
   - **Key Name**: e.g., `Wallet Pass Push Notification Key`.
   - Check the checkbox for **Apple Push Notifications service (APNs)**.
4. Click **Continue** and then **Register**.
5. Note the **Key ID** displayed on screen (a 10-character string like `4MVZD89RK3`).
6. Click **Download** to save the private key file (`AuthKey_XXXXXXXXXX.p8`).
   - Store this file in a secure location.
7. Configure the APNs environment variables:
   ```dotenv
   APPLE_APN_KEY_ID=4MVZD89RK3
   APPLE_APN_TEAM_ID=NXQNVCYXQ2
   APPLE_APN_TOPIC=pass.com.yourcompany.wallet
   ```

---

## 7. Pass Assets & Visual Branding

Apple and Google passes display organizational branding, logos, and banners.

```dotenv
PASS_ORGANIZATION_NAME=Your Brand Name
PASS_DESCRIPTION=Electronic Ticket & Rewards Pass
PASS_LOGO_URL=https://your-cdn.com/logo.png
```

### Apple Pass Images (`apple/assets/`):
If you wish to customize the bundled Apple Pass imagery, place PNG files inside [`apple/assets/`](file:///Users/georgeikwegbu/Developer/Github/google_apple_wallet/apple/assets):
- `icon.png` (29x29 px) & `icon@2x.png` (58x58 px, 87x87 px for @3x): Displayed on lock screen notifications.
- `logo.png` (160x50 px) & `logo@2x.png` (320x100 px): Top-left pass logo.
- `strip.png` (375x123 px) & `strip@2x.png` (750x246 px): Background banner image for store cards / event tickets.

---

## 8. Rewards & Scanning Logic Configuration

These variables control point deductions and allocations when QR codes are scanned by merchants in the admin dashboard.

```dotenv
REWARD_POINTS_PER_SCAN=10
REWARD_BASE_QUANTITY=10
```

- **`REWARD_POINTS_PER_SCAN`**: Number of points automatically subtracted from the user's account when a merchant scans their pass QR code.
- **`REWARD_BASE_QUANTITY`**: Starting inventory / quantity allocated to a user pass upon initial registration.

---

## 9. Admin Authentication & Security

The backend requires secure secrets for generating signed QR code tokens and protecting admin endpoints.

```dotenv
ADMIN_JWT_SECRET=your_generated_cryptographic_secret
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD_HASH=$2b$10$wE7Y1mJj...
```

### 1. Generating `ADMIN_JWT_SECRET`:
Generate a cryptographically secure 256-bit random string via your terminal:
```bash
openssl rand -base64 32
```
Copy the output into `ADMIN_JWT_SECRET`.

### 2. Generating `ADMIN_PASSWORD_HASH`:
Use Node.js with `bcrypt` to generate a secure salted hash for your chosen admin password:
```bash
node -e "console.log(require('bcrypt').hashSync('YourSecureAdminPassword123!', 10))"
```
Copy the resulting `$2b$10$...` hash into `ADMIN_PASSWORD_HASH`.

---

## 10. Cloud File Storage (AWS S3)

AWS S3 is used to store uploaded ticket images, promotional banners, and attendee media.

```dotenv
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_REGION=us-east-1
```

### Walkthrough:
1. Log in to the **[AWS S3 Console](https://s3.console.aws.amazon.com/s3/)**.
2. Click **Create bucket**:
   - **Bucket name**: e.g., `wallet-pass-assets-prod`.
   - **AWS Region**: Select your closest region (e.g., `us-east-1`).
   - Configure public access or CloudFront distribution according to your security policy.
3. Open the **[AWS IAM Console](https://console.aws.amazon.com/iam/)**.
4. Navigate to **Users** > **Create user** (e.g. `wallet-s3-uploader`).
5. Select **Attach policies directly** and attach `AmazonS3FullAccess` (or a scoped policy granting `s3:PutObject`, `s3:GetObject` on your bucket).
6. Complete user creation, open the **Security credentials** tab, and click **Create access key**.
7. Choose **Application running outside AWS** and download the CSV containing:
   - `Access key ID` -> `S3_ACCESS_KEY`
   - `Secret access key` -> `S3_SECRET_KEY`

---

## 11. Admin Frontend Configuration (Vite Vue App)

The admin portal is a Single Page Application (SPA) located in `admin/`. It reads environment variables prefixed with `VITE_`.

### Local Development (`admin/.env`):
Create an `.env` file inside `admin/`:
```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

### Production Build (`admin/.env.production`):
Set the public URL of your deployed NestJS backend:
```dotenv
VITE_API_BASE_URL=https://wallet-core.fly.dev
```

When building for production (`npm run build-only`), Vite will automatically bundle this URL into the client API requests.

---

## 12. Production Deployment & Secret Management

When hosting in production (e.g. [Fly.io](https://fly.io/), [Railway](https://railway.app/), [Render](https://render.com/), or [AWS ECS](https://aws.amazon.com/ecs/)), **never upload `.env` or raw certificate files to GitHub**.

### Setting Secrets in Production (Fly.io CLI Example):

You can pass all `.env` values and pipe file contents directly into your container's secrets:

```bash
fly secrets set \
  NODE_ENV="production" \
  PORT="3000" \
  API_BASE_URL="https://wallet-core.fly.dev" \
  DATABASE_URL="postgres://wallet_core:PASSWORD@wallet-db-cluster.flycast:5432/wallet_core?sslmode=disable" \
  GOOGLE_APPLICATION_CREDENTIALS="./service-account.json" \
  GOOGLE_ISSUER_ID="3388000000023066256" \
  GOOGLE_CLASS_ID="3388000000023066256.codelab_class" \
  GOOGLE_SERVICE_ACCOUNT_EMAIL="sa@wallet-pass.iam.gserviceaccount.com" \
  APPLE_TEAM_ID="NXQNVCYXQ2" \
  APPLE_PASS_TYPE_IDENTIFIER="pass.com.yourcompany.wallet" \
  APPLE_CERT_PATH="apple/certs/passcertificate.pem" \
  APPLE_KEY_PATH="apple/certs/passkey.pem" \
  APPLE_WWDR_PATH="apple/certs/wwdr.pem" \
  APPLE_CERT_PASSPHRASE="" \
  APPLE_APN_KEY_ID="4MVZD89RK3" \
  APPLE_APN_TEAM_ID="NXQNVCYXQ2" \
  APPLE_APN_TOPIC="pass.com.yourcompany.wallet" \
  ADMIN_JWT_SECRET="$(openssl rand -base64 32)" \
  -a wallet-core
```

For environments where physical certificate files cannot be mounted on disk, you can also inject the raw PEM strings as environment variables:
```bash
fly secrets set \
  APPLE_CERTIFICATE="$(cat apple/certs/passcertificate.pem)" \
  APPLE_KEY="$(cat apple/certs/passkey.pem)" \
  WWDR_CERTIFICATE="$(cat apple/certs/wwdr.pem)" \
  -a wallet-core
```

---

## 13. End-to-End Verification Checklist

Run through this verification sequence to confirm that all credentials, certificates, and environment settings are fully operational:

### 1. Database Connectivity Check
```bash
docker compose ps
# Confirm the database container is healthy and mapped to port 5433
```

### 2. Apple Wallet Pass Verification Script
Run the automated Apple Pass generation script in `core/`:
```bash
cd core
npx ts-node verify-apple-pass.ts
```
- **Success output**:
  ```
  🔍 Resolving Apple Wallet paths:
   - Cert: /.../apple/certs/passcertificate.pem
   - Key: /.../apple/certs/passkey.pem
   - WWDR: /.../apple/certs/wwdr.pem
   - Template: /.../apple/templates
  ✅ Apple Wallet template and certificates loaded successfully
  Generating pass buffer...
  ✅ Pass generated successfully: test-pass.pkpass
  ```
- Double-click the generated `test-pass.pkpass` on macOS to inspect the pass preview in Apple Wallet Simulator.

### 3. Google Wallet Backend Startup Check
Start the backend server in development mode:
```bash
cd core
npm run start:dev
```
- **Success log**:
  ```
  ✅ Generic class already exists: 3388000000023066256.codelab_class
  ```
  *(or `🔧 Generic class not found, creating...` followed by `✅ Generic class created`)*

### 4. Admin Portal Pass Creation
1. Start the admin frontend:
   ```bash
   cd admin
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser.
3. Go to **Users** > Register a new email address.
4. Click the generated **Google Wallet URL** to preview the "Save to Google Wallet" screen.
5. Download or send the **Apple Wallet Pass** to an iOS device and verify that it adds cleanly to Apple Wallet.
