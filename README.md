# SunnyEstate — full-stack portfolio demo

Real estate website by Ayodeji Adunbi, extending the supplied React/Vite UI. The original page layout and artwork are preserved.

## Start on your Mac

1. Extract this ZIP into a NEW folder so your original project stays available.
2. In VS Code choose File → Open Folder and select the extracted `Real-Estate-Frontend` folder (the one containing `package.json`).
3. Open Terminal → New Terminal.
4. Check `node -v`. Use Node.js 24 LTS (minimum 22.13); older versions do not have the SQLite API this backend uses.
5. Run:

```bash
npm install
npm run dev
```

This starts the backend on port 3001 and Vite on port 5173, and opens your browser. If 5173 is occupied, use the Local URL printed by Vite. Stop older project terminals with Control+C to avoid running several copies. Keep this terminal open. Control+C stops development.

No database account, API key or separate backend installation is needed locally. First startup creates SQLite tables and eight clearly labelled sample properties. Register your own account; there is no preset admin password.

## Try the website

- Search Buy or Rent, city/address, price and minimum bedroom count.
- Open a listing to view its photos and map and save it.
- Create an account, open My account → Create property listing, enter details and upload at least one image.
- Edit/delete your own listings; another user cannot modify them.
- Sign into a second account in an incognito browser to enquire about the first account's property.
- Check My account for received and sent enquiries, saved properties and your listings.
- Restart the server: accounts, listings, photos, sessions and enquiries persist.

Prices are GBP; rentals are per month. Size is in square metres. Enter latitude and longitude manually when publishing (the London values are defaults, not automatic address lookup). Sample properties are fictional and cannot receive enquiries.

## Implemented

React frontend; Node.js HTTP JSON API; SQLite database with foreign keys; salted scrypt password hashes; HttpOnly, SameSite cookies with seven-day sessions; authentication rate limit; request-origin checks; server-side validation; owner-only property updates/deletion; image signature/type and size checks; protected account routes; loading, empty and error states. Map code loads separately so it does not slow the home-page bundle.

Images: JPEG/PNG/WebP, up to eight per property and 4 MB per image. Uploaded files are stored in SQLite and served from `/api/images/…`. Sample images and OpenStreetMap tiles require internet access. All app data calls use `/api`; Vite proxies them locally, and the production server serves them on the same origin.

## Tests and production build

```bash
npm test
npm run build
npm start
```

After building, `npm start` serves BOTH frontend and backend at `http://localhost:3001`. The integration test uses a separate temporary database and checks accounts, login, owner permissions, validation, upload serving, filters, saved properties, enquiries, persistence after restart, deletion cascades, logout and origin checks.

## Deployment

This version is designed for one Node.js service serving both frontend and backend. It is NOT a frontend-only Vercel upload: the SQLite file must live on a persistent writable disk. A stateless/serverless filesystem will lose or fail to share data. Do not deploy this database to an ephemeral free-service disk expecting permanent storage.

Build: `npm ci && npm run build`
Start: `npm start`
Runtime: Node.js 24
Health check: `/api/health`

Set these platform environment variables:

- `PORT`: assigned by the host; local default 3001.
- `DATABASE_PATH`: absolute file path on a persistent mounted disk, e.g. `/data/estate.sqlite`.
- `APP_ORIGIN`: exact public origin, e.g. `https://your-project.example.com` (no trailing slash).
- `NODE_ENV=production`: enables Secure session cookies; production must use HTTPS.

Use ONE instance with this SQLite setup. Back up the database with SQLite's backup tooling, or stop the app before copying its data directory (including WAL files). Never commit the data directory: it contains user information. Environment variables are read from the host/shell; this project does not automatically load `.env` files.

## Scope and remaining production work

This is a functional portfolio demo, not a reviewed commercial property service. It does not implement payments, booking, live chat, email delivery, email verification, password reset, moderation, agent verification or an admin dashboard. Enquiries are stored messages visible in the sender's and owner's account; owners respond outside this demo. There is no address geocoding, antivirus scan or image recompression. Public image URLs may be viewed by anyone who has the link. Before handling real customers, add these operational and account-recovery features, abuse controls, storage quotas, backups and a production security review. Original frontend dependencies and Sass styles are retained; Sass emits deprecation warnings during build.

## Files

- `server/server.js`: API, authentication, SQLite schema and production static serving.
- `server/dev.js`: starts frontend and backend together.
- `server/api.test.js`: integration tests with isolated data.
- `src/lib/api.js`, `src/lib/auth.jsx`: API client and session state.
- `src/routes/`: connected pages, login/register and listing editor.
- `src/product.css`: forms, account pages, feedback and responsive additions.
- `server/data/`: local runtime data, created automatically and excluded from this ZIP and git.
