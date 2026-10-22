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
  defaultValue: { language: 'en-US', value: 'Reisty Gift Card' },
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

---

## 8. Apple PassKit — `authenticationToken must be 16 characters or longer`

### Symptom
```
[ExceptionsHandler] TypeError: authenticationToken must must be 16 characters or longer
    at set authenticationToken (@walletpass/pass-js/dist/lib/base-pass.js:282:19)
    at AppleService.createPass (apple.service.ts:120:37)
```

### Cause
Apple's PassKit specification and the `@walletpass/pass-js` library mandate that any pass containing a `webServiceURL` must have an `authenticationToken` of at least 16 characters. Generating short random strings like `'auth-' + Math.random().toString(36).substring(7)` produces only ~12 characters.

### Fix
Generate an authentication token that is at least 16 characters long:
```ts
const authenticationToken = 'auth-' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
// Or using Node crypto:
// const authenticationToken = crypto.randomBytes(16).toString('hex');
```

---

## 9. Apple PassKit — `SyntaxError: Missing required image icon.png`

### Symptom
```
SyntaxError: Missing required image icon.png
    at Template.createPass (@walletpass/pass-js/dist/lib/template.js)
```

### Cause
Apple PassKit packages (`.pkpass`) require at least an `icon.png` (29x29) and `logo.png` image inside the template folder. If the template folder (`apple/templates/`) only has `pass.json`, pass generation will fail.

### Fix
Place the required image assets inside `apple/templates/` (and `core/apple/templates/`):
- `icon.png` (29x29)
- `icon@2x.png` (58x58)
- `icon@3x.png` (87x87)
- `logo.png` (160x50)
- `logo@2x.png` (320x100)

Also ensure lazy loading in `AppleService`:
```ts
if (!this.template) {
    await this.initTemplate();
}
```

---

## 10. Apple PassKit — `webServiceURL must be HTTPS` & ngrok Tunneling

### Symptom
```
⚠️ Apple Wallet webServiceURL must be HTTPS. Skipping for URL: http://localhost:3000/api/apple
```
On iOS, the pass cannot be added or registered for push notifications when using an unencrypted HTTP URL.

### Fix
Use [ngrok](https://ngrok.com/) to tunnel your local NestJS backend to a secure public HTTPS URL:
```bash
ngrok http 3000
```
Then update `core/.env`:
```dotenv
API_BASE_URL=https://your-subdomain.ngrok-free.dev
```
Restart the NestJS app (`npm run start:dev`). The pass will now be generated with a valid HTTPS `webServiceURL` that iOS accepts.

---

## 11. Frontend — SVG `<path> attribute d: Expected moveto path command`

### Symptom
```
main.ts:12 Error: <path> attribute d: Expected moveto path command ('M' or 'm'), "path d=\"M23 19a2…".
```

### Cause
In Vue icon components, an inner SVG element string was mistakenly assigned to the `d` attribute of a `<path>` element (e.g. `path d="<rect width=.../>"` instead of valid path coordinates starting with `M` or `m`).

### Fix
In `admin/src/components/icons/LucideIcons.ts`, ensure all icon path coordinates are clean SVG path strings:
- Use proper path definitions (e.g., `<rect .../>` and `<path d="M..."/>`).
- Check that the `d` attribute starts with a valid moveto command (`M` or `m`).