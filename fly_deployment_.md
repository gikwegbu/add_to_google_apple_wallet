# Fly.io Deployment Walkthrough

To deploy your application and get the necessary HTTPS for Apple Wallet, follow these steps.

## 1. Prerequisites
Ensure you have `flyctl` installed and you are logged in:
```bash
brew install flyctl
fly auth login
```

---

## 2. Deploy the Database (Fly Postgres)
Fly.io provides a managed Postgres service. Create a cluster first:
```bash
fly postgres create --name wallet-db-cluster
```
Follow the prompts (choose the same region as your apps, e.g., `ams`). **Save the credentials provided!**

---

## 3. Deploy the Backend (`core`)
We'll deploy the NestJS app first so we have an API URL for the frontend.

### Step 3a: Prepare Assets
Since the `apple/` and `google/` directories are outside `core/`, you should copy them inside for the Docker build to work correctly:
```bash
cp -r apple core/
cp -r google core/
```

### Step 3b: Initialize and Setup Secrets
Navigate to the `core` directory and initialize the Fly app:
```bash
cd core
fly launch --no-deploy # Link to existing fly.toml or create new
```

Set your environment secrets (refer to your [.env](file:///Users/georgeikwegbu/Developer/Github/google_apple_wallet/core/.env)):
```bash
fly secrets set \
  DATABASE_URL="postgres://user:password@hostname:5432/wallet_db" \
  APPLE_TEAM_ID="NXQNVCYXQ2" \
  APPLE_PASS_TYPE_IDENTIFIER="pass.com.gikwegbu.wallet" \
  APPLE_CERT_PASSPHRASE="your_passphrase" \
  ADMIN_JWT_SECRET="your_secret" \
  API_BASE_URL="https://wallet-core.fly.dev"
  -a wallet-core
```
> [!NOTE]
> Link the database to your app: `fly postgres attach wallet-db-cluster`

### Step 3c: Deploy
```bash
fly deploy
```

---

## 4. Deploy the Frontend (`admin`)
Now that the backend is up at `https://wallet-core.fly.dev`, we can deploy the dashboard.

### Step 4a: Initialize and Deploy
Navigate to the `admin` directory:
```bash
cd ../admin
fly launch --no-deploy
```

Build and deploy with the backend URL:
```bash
fly deploy --build-arg VITE_API_BASE_URL="https://wallet-core.fly.dev"
```

---

## 5. Summary of URLs
- **Backend API**: `https://wallet-core.fly.dev`
- **Admin Dashboard**: `https://wallet-admin.fly.dev`
- **Apple Wallet Callback**: `https://wallet-core.fly.dev/api/apple`

---

## Troubleshooting
- **Logs**: `fly logs` in either directory to see real-time output.
- **SSH**: `fly ssh console` to explore the persistent storage or environment.
- **Prisma**: If migrations fail, run `fly ssh console -C "npx prisma migrate deploy"` after scaling up.
