 Troubleshooting Guide — Google & Apple Wallet Pass Integration

## 1. PrismaClientInitializationError: User was denied access

### Symptom
```
PrismaClientInitializationError: User was denied access on the database `(not available)`
```

### Cause
Prisma cannot connect to the database. Common reasons:
- The Docker container is not running
- A local PostgreSQL instance is conflicting with Docker on port 5432
- The `.env` file is not being loaded (common in monorepo setups)

### Fix

**Step 1 — Start the Docker container:**
```bash
docker compose up -d
docker compose ps  # confirm status is "Running"
```

**Step 2 — Check for port conflicts:**
```bash
lsof -i :5432
```
If you see two processes (e.g. a local `postgres` and `com.docke`), stop the local one:
```bash
brew services stop postgresql
```

**Step 3 — Verify the container is healthy:**
```bash
docker compose exec db psql -U user -d wallet_db
```
If this opens a `wallet_db=#` prompt, the database is healthy.

**Step 4 — Re-run migrations:**
```bash
npx prisma migrate dev --name init
```

---

## 2. Prisma Migration Error: Migration was modified after it was applied

### Symptom
```
The migration `20260302214840_init` was modified after it was applied.
```

### Fix
Reset the database (all data will be lost — dev only):
```bash
npx prisma migrate reset
npx prisma migrate dev --name 
```

---

## 3. TypeScript Error: Property does not exist on Prisma type

### Symptom
```
Object literal may only specify known properties, and 'fullname' does not exist in type UserCreateInput
```

### Cause
The Prisma client is out of sync with your schema. This happens after adding a new field to `schema.prisma` without regenerating the client.

### Fix
```bash
npx prisma generate
```

Then restart the TypeScript server in VS Code:

`Cmd + Shift + P` → **TypeScript: Restart TS Server**

> Always run `npx prisma generate` after any change to `schema.prisma`.

---

## 4. Google Wallet — Invalid JWT

### Symptom
```
Additional details for pass issuers: Invalid JWT.
```

### Causes & Fixes

**Missing `origins` field** — required in JWT claims:
```ts
const claims = {
  iss: serviceAccountEmail,
  aud: 'google',
  typ: 'savetowallet',
  iat: Math.floor(Date.now() / 1000),
  origins: ['http://localhost:3000'], // ← required
  payload: {
    genericObjects: [passObject],
  },
};
```

**Wrong object type** — class type and JWT payload must match:

| Class Type | JWT payload key |
|---|---|
| `genericClass` | `genericObjects` |
| `loyaltyClass` | `loyaltyObjects` |

**Private key newline issue** — always replace escaped newlines:
```ts
const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
```

---

## 5. Google Wallet — Class Type Mismatch

### Symptom
```
3388000000023066256.codelab_class class type is not loyaltyClass. Was: genericClass
```

### Cause
The Wallet class was created as a `genericClass` but the code was sending `loyaltyObjects` in the JWT.

### Fix
Update all references to use `generic` consistently:

```ts
// JWT payload
payload: {
  genericObjects: [passObject], // not loyaltyObjects
}

// API URLs
GET  /walletobjects/v1/genericClass/{classId}
POST /walletobjects/v1/genericClass
PATCH /walletobjects/v1/genericObject/{objectId}
```

Generic objects also require `cardTitle` and `header` fields:
```ts
cardTitle: {
  defaultValue: { language: 'en-US', value: 'Rewards Card' },
},
header: {
  defaultValue: { language: 'en-US', value: user.name || 'Member' },
},
```

---

## 6. Google Wallet — 401 Invalid Credentials on API calls

### Symptom
```json
{ "code": 401, "message": "Request had invalid authentication credentials" }
```

### Cause
The JWT token was being used as a Bearer token for API calls. The JWT is only for generating the "Save to Wallet" URL — API calls require an OAuth access token.

### Fix
Use `google-auth-library` to get an OAuth access token for API calls:
```ts
const auth = new GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
});

const client = await auth.getClient();

// Use client.request() — it handles auth automatically
await client.request({ url, method: 'GET' });
```

---

## 7. Environment & Credentials Setup

### Recommended `.env` structure
```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/wallet_db
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
GOOGLE_ISSUER_ID=your_issuer_id
GOOGLE_CLASS_ID=your_issuer_id.your_class_suffix
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@your-project.iam.gserviceaccount.com
```

> Do not interpolate variables in `.env` (e.g. `${GOOGLE_ISSUER_ID}` won't work). Hardcode the full value for `GOOGLE_CLASS_ID`.

### `.gitignore` — never commit these
```gitignore
.env
*.json
```

### Use `GOOGLE_APPLICATION_CREDENTIALS` instead of raw private key
Pointing to the JSON file is safer and cleaner than storing the private key in `.env`. Google's SDK reads it automatically:
```ts
const auth = new GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
});
```