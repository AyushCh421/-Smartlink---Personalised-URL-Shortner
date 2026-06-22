# SmartLink — Enterprise URL Management Platform

A full-stack URL shortener with custom aliases, QR codes, click analytics (geo + device + browser), link expiration, password protection, and an admin panel. Built to look and behave like a real production SaaS product, not a toy CRUD app.

## Stack

**Frontend:** React, Tailwind CSS, React Router, Axios, Recharts, lucide-react
**Backend:** Node.js, Express
**Database:** MongoDB (Atlas)
**Caching:** Redis
**Auth:** JWT + bcrypt
**Other:** QR code generation, rate limiting, Winston logging, geo-IP lookup, UA parsing

## Project structure

```
smartlink/
├── backend/
│   ├── config/          # db + redis connections
│   ├── controllers/     # business logic
│   ├── middleware/      # auth, rate limiting, error handling
│   ├── models/          # User, Url, Analytics schemas
│   ├── routes/          # API route definitions
│   ├── utils/           # logger
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # reusable UI, links, analytics widgets
        ├── context/     # auth state
        ├── pages/       # route-level pages
        └── services/    # axios instance
```

## Local setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `MONGO_URI` — get this free from MongoDB Atlas (create a cluster, add a DB user, whitelist your IP or 0.0.0.0/0 for dev)
- `JWT_SECRET` — any long random string
- `REDIS_URL` — if you don't want to install Redis locally, run `docker run -p 6379:6379 redis` or just use a free Redis Cloud instance

```bash
npm run dev
```

Server runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Runs on `http://localhost:3000`.

### 3. Create an admin user

By default every signup gets `role: "user"`. To make yourself admin, register normally then flip the role directly in MongoDB Atlas (or via a quick script):

```js
// in mongo shell / Atlas UI
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Deployment

- **Frontend → Vercel**: connect the repo, set root directory to `frontend`, add the `REACT_APP_API_URL` and `REACT_APP_BASE_URL` env vars pointing to your deployed backend.
- **Backend → Render/Railway**: connect the repo, set root directory to `backend`, add all `.env` vars from `.env.example`, start command `node server.js`.
- **Database → MongoDB Atlas**: free M0 cluster is enough for a portfolio project.
- **Redis → Redis Cloud** (free tier) or Upstash.

Update `BASE_URL` in the backend `.env` to your deployed backend URL once live — this is what gets used to generate the actual short links and QR codes.

## How the redirect + caching flow works

When someone hits `smartlink.com/abc123`:
1. Backend checks Redis for a cached mapping of `abc123 → original URL`.
2. Cache hit → skip the DB entirely, redirect immediately.
3. Cache miss → query MongoDB, cache the result for an hour, then redirect.
4. Click metadata (browser, OS, device, IP-based geo) gets written to the `Analytics` collection asynchronously after the redirect fires, so the user's redirect isn't held up waiting on a geo-IP lookup.

Password-protected and expired links skip the cache and get routed to a frontend interstitial page instead of redirecting straight through.

## API (for the developer/API-key feature)

Every user gets an API key on signup, visible in Settings. It can be used to create links programmatically without a login session:

```bash
curl -X POST http://localhost:5000/api/urls \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com/some/long/path"}'
```

## Notes on what's intentionally simplified

This is a portfolio-scale build, so a few things are simplified from what a real production system would need:
- Geo-IP lookup uses the free `ip-api.com` endpoint (rate-limited, fine for a demo, would swap for a paid provider like MaxMind at real scale).
- No email verification flow on signup (Nodemailer is wired up in package.json for future password-reset/email-verification work, not currently called).
- Redis cache invalidation is manual (on update/delete) rather than using pub/sub.

These are good honest talking points in an interview — better to know your own project's limits than to pretend it's bulletproof.
