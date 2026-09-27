# RideTaxi - Developer Guide

## Quick Start

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Environment setup
cp .env.example .env  # Add MongoDB URI, JWT secrets

# Run dev servers (separate terminals)
cd client && npm run dev    # http://localhost:5173
cd server && npm run dev    # http://localhost:5001
```

> **macOS gotcha**: Port `5000` is often taken by ControlCenter/AirPlay. The backend defaults to **5001**. If you change it, also update `client/vite.config.js` proxy targets.

## Design System (professional red + black + gold — user-chosen, RED-led)

All design tokens live in `client/src/index.css` inside the Tailwind `@theme` block.
**Keep token NAMES stable** (`brand-*`, `accent-*`) — component classes reference them by name,
so you change a color value, never a class.

| Token family | Role | Key values |
|--------------|------|------------|
| `brand-*` | **RED = primary brand**: nav/hero/footer bands, CTAs, live dots, red accent text | `brand-500 #e53935`, `brand-600 #d7332f`, `brand-700 #c62828`, `brand-800 #a11c1c`, `brand-950 #57100f` |
| `accent-*` | Neutral blacks/grays = contrast + secondary UI (never primary) | `accent-400 #8f8f9a`, `accent-500 #667085`, `accent-900 #0b0d0f` |
| `gold-*` | Warm gold = premium highlights / ratings / hero accent words on red | `gold-300 #efc964`, `gold-400 #f4b942`, `gold-500 #eaa82b` |
| `success-*` | Functional green = done / paid / online / confirmed (single green for UI **and** the map pickup pin) | `success-500 #10b981`, `success-600 #059669`, `success-700 #047857` |
| `ink` / `muted` | Text on off-white paper | `ink #0b0d0f`, `muted #667085`, `paper #f8f9fa` |
| Fonts | `--font-display` = **Fraunces** (serif, headings — elegant editorial), `--font-sans` = **Inter** (body, highly readable) | Google Fonts, loaded in `client/index.html` |

Usage rules:
- **Red leads**: `bg-brand-gradient` (deep red) is the primary surface for nav/hero/footer/CTA bands. CTAs use `btn-brand-gradient` (bright→deep red). `bg-brand-gradient-soft` (warm off-white wash) is the body background between bands. `text-brand-gradient` (red) highlights words/stats on light sections.
- **Gold accents on red**: hero accent words, live dots, stat numbers and phone numbers on red bands use `text-gold-300` / `bg-gold-400` (not red) so they pop against the red.
- **Black is a contrast accent only** — body headings (`ink`), dark icons, map pins; never a surface color.
- Pills everywhere (Uber-style touch targets): `rounded-full` inputs (`input-pill`), buttons, chips.
- Functional map colors are the ONLY allowed exceptions to the palette: pickup = circular green `map-pin-start` (`success-500`), dropoff = red `map-pin-dropoff` (brand-700), driver = pulsing red `map-pin-driver` (brand-600), idle vehicles = `map-pin-vehicle` (white circle + black border). Route polyline is brand red `#c62828` (white casing) hardcoded in `BookingMap.jsx` and `RideTracking.jsx`.
- Depth comes from layered shadows: `.card-lift` (resting 2-layer shadow, float on hover) — no heavy borders.

**Hard rule — no raw Tailwind palette colors.** Only `brand-*`, `accent-*`, `gold-*`, `success-*`, `ink`, `muted`, `paper`, `surface` may appear in components. Never `slate-*`, `blue-*`, `green-*`, `red-*`, `amber-*`, `yellow-*`, `gray-*`. Semantic mapping used across the app: red → `brand`, green → `success`, yellow/amber → `gold`, blue/slate/gray → `accent`, `bg-white` → `bg-surface` (so dark mode works).

**Shared surfaces & tones (use these, never re-declare):**
| Utility / module | Use for |
|------------------|---------|
| `.card` | Standard padded card (radius 1rem, `accent-200` border, `surface` bg, layered shadow, lifts on hover). Override padding with `card p-6` / `card p-8`. Defined in `@layer components`, so utilities win. |
| `.panel` | Same surface with **no** padding and no hover lift — tables, dropdowns, map frames (`panel overflow-hidden`). |
| `.card-lift` | Animation only, for image/media cards that define their own surface. |
| `lib/statusTone.js` | `rideTone()`, `payTone()`, `payAccent()`, `badgeTone()` — the only place status/payment colors are defined, so every page renders identical pills. Never re-declare a `STATUS_STYLE` map. |


## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 18 + Vite + React Router v6 | Fast dev, modern bundler |
| Styling | Tailwind CSS | Rapid responsive UI |
| Maps | Leaflet + OpenStreetMap | Free, no API key |
| Backend | Express.js + Socket.io | Real-time events |
| Database | MongoDB + Mongoose | Flexible schema, geospatial queries |
| Payments | Stripe (Payment Intents) + cash option; sandbox fallback | Real card charges, cash-at-end, no-key dev |
| Auth | Passport.js (local + OAuth2 + JWT strategies) | Stateless JWT, horizontally scalable |
| Email | Nodemailer (SMTP) | Optional — verification + password reset; console fallback in dev |
| Social | Passport Google/Facebook OAuth2 (redirect flow) | Server-side verification, no app secret needed for token flows |
| SMS/OTP | Twilio | Optional — phone code sign-in; console/devCode fallback in dev |
| Hardening | Helmet + express-rate-limit (+ optional Redis store) | Security headers + per-IP throttling that survives multi-instance |

## Project Structure

```
ride-booking/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI (auth/, maps/, rides/, ui/, layout/, three/)
│   │   ├── pages/           # Route pages
│   │   │   ├── marketing/   # Public site: Home, About, Services, ServiceDetail, Fleet, Contact, Careers
│   │   │   ├── passenger/   # Reservations.jsx (booking), RideTracking, RideHistory
│   │   │   ├── driver/      # Dashboard.jsx
│   │   │   └── admin/       # Dashboard.jsx (Overview/Rides/Drivers/Users/Payments/Settings)
│   │   ├── data/            # services.js (10 services shared across marketing pages + nav + footer)
│   │   ├── hooks/           # useSocket, useGeolocation, useAuth
│   │   ├── context/         # AuthContext
│   │   └── services/        # api.js, authService.js, socketService.js, rideService.js, paymentService.js, notificationService.js, userService.js, adminService.js, settingsService.js
│   └── public/              # sw.js (web-push service worker)
├── server/                  # Express backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Mongoose schemas (User, Ride, Location, RefreshToken, OtpCode, Payment, Notification, AppSetting)
│   │   ├── routes/          # API routes
│   │   ├── middleware/       # auth.js (Passport JWT protect + roles), error.js
│   │   ├── services/        # Business logic (rideService, driverService, authService, mailService, smsService, userService, paymentService, notificationService, settingsService)
│   │   ├── utils/           # tokens.js (opaque token + SHA-256 hash)
│   │   └── config/          # db.js, socket.js, passport.js (Local/Google/Facebook/JWT strategies)
│   └── .env.example
└── AGENTS.md
```

## Frontend Routes

| Path | Page | Access | Notes |
|------|------|--------|-------|
| `/` | marketing/Home.jsx | Public | Landing (hero + 3D taxi, booking card, testimonials, service areas) |
| `/about` | marketing/About.jsx | Public | Company story + "Why Choose Us" |
| `/services` | marketing/Services.jsx | Public | Full grid of 10 services (data/services.js) |
| `/services/:slug` | marketing/ServiceDetail.jsx | Public | Data-driven per-service page |
| `/fleet` | marketing/Fleet.jsx | Public | Vehicle cards (Sedan/SUV/Van) + charter CTA |
| `/contact` | marketing/Contact.jsx | Public | Quote form (mailto to chriskbonsu@gmail.com) + info |
| `/careers` | marketing/Careers.jsx | Public | Driver application form + PDF links |
| `/reservations` | passenger/Reservations.jsx | Public* | Booking flow: autocomplete + map + drivers strip |
| `/login`, `/register` | pages/Login.jsx, Register.jsx | Public | Auth (email-or-phone, remember me, Google/Facebook) |
| `/forgot-password` | pages/ForgotPassword.jsx | Public | Email reset link |
| `/reset-password` | pages/ResetPassword.jsx | Public | New password (token from email) |
| `/verify-email` | pages/VerifyEmail.jsx | Public | Confirm email via emailed link |
| `/auth/social` | pages/SocialCallback.jsx | Public | OAuth redirect landing — stores tokens from query, hard-redirects to `/` |
| `/profile` | pages/Profile.jsx | auth | Edit name/phone, avatar, change password, enable web-push |
| `/rides/history` | passenger/RideHistory.jsx | passenger | Payments + pay/edit/track actions |
| `/rides/track/:id` | passenger/RideTracking.jsx | passenger | Live tracking + ETA + pay/refund/edit |
| `/driver` | driver/Dashboard.jsx | driver | Accept rides, location broadcast |
| `/admin` | modules/crm (live) | admin | Overview, Rides, Dispatch, Drivers, Fleet, Payments, Content, Users, Settings |
| `/admin/content` | modules/crm/features/content | admin | **Content & catalog hub** — Website content \| Fleet \| Services |

\* `/reservations` is viewable by anyone, but the request button prompts login.

**Content & catalog hub** (`modules/crm/features/content/`) — the one screen an owner uses to run the
business. `ContentPage.tsx` is a 3-tab shell over `ContentEditor.tsx` (site copy), `FleetManager.tsx`
and `ServicesManager.tsx`, sharing the primitives in `fields.tsx`.
- Site copy edits a local draft, shows per-section "unsaved" dots, a live hero preview, a sticky save
  bar (dirty count + discard) and supports `⌘/Ctrl+S`; `beforeunload` guards a tab close.
- Tabs are addressable (`#content` / `#fleet` / `#services`): the shell `pushState`s on click and
  listens for `hashchange`/`popstate`, so deep links and browser back/forward both switch tabs.
- Fleet/Services are immediate-save list managers: reorder arrows, a right slide-over `Drawer` for
  add/edit, `Confirm` dialogs that explain the delete guard, and a toast for the outcome.
  Lists carry `usage: { rides, drivers }` so the UI can warn *before* an admin hits a 409.
- Boot seeding never overwrites: `ensureCatalogDefaults()` only runs on an empty collection, and
  `restore-defaults` re-adds missing rows only. Deleting a class therefore sticks.

**Reservations flow** (`passenger/Reservations.jsx`):
1. `LocationSearch` (autocomplete → `GET /api/places/search`) sets pickup/dropoff.
2. `BookingMap` shows nearby vehicles (`GET /api/drivers/nearby`) once pickup is set.
3. Selecting a driver calls `GET /api/drivers/:id/eta` → draws dashed route to pickup + shows ETA strip.
4. Submit → `POST /api/rides` → navigate to `/rides/track/:id`.

## Real Business Info (from ellicottcityairporttaxi.com)

| Field | Value |
|-------|-------|
| Phone | (410) 365-5556 → `tel:4103655556` |
| Email | chriskbonsu@gmail.com |
| Address | 9019 Early April Way, Ellicott City, MD |
| Service area | Maryland, DC, Virginia (local & long distance, door-to-door) |
| Legal name | Ellicott City Airport Taxi |

Used in `Footer.jsx` (contact column) and the `tel:`/`mailto:` CTAs on marketing pages.

**Navbar** (`components/layout/Navbar.jsx`) — one `NAV_LINKS` array feeds both the desktop bar and the
mobile drawer, so a page can never appear in one and be missing from the other. Every control shares
one `h-10` height and one `rounded-full` radius; all text clears WCAG AA against the red band. The
drawer locks body scroll while open, `Escape` closes either menu and restores focus, and the Services
menu is a 2-up card that scrolls instead of overflowing. Role-gated links (`Admin` for any CRM role,
`Driver`) come from `lib/roles.js`, not an inline `role === 'admin'` test.

## 3D Hero Taxi (Home page)

`pages/marketing/Home.jsx` embeds a WebGL taxi behind the hero content (desktop/tablet only).
It is lazy-loaded so the ~265KB gzip three.js bundle only downloads when a supported,
non-mobile viewport actually renders it.

| File | Purpose |
|------|---------|
| `components/three/HeroTaxiScene.jsx` | `<Canvas>` + Suspense + lights + rig |
| `components/three/TaxiRig.jsx` | GSAP entrance, idle bob, mouse parallax (all lerped) |
| `components/three/TaxiModel.jsx` | Loads `/models/taxi.glb` if present, else procedural taxi |
| `components/three/ProceduralTaxi.jsx` | Real 3D sedan built from primitives (body, glass, wheels, decals) |
| `components/three/TaxiLights.jsx` | Ambient + key + warm fill + cyan rim |
| `components/three/StudioEnvironment.js` | `RoomEnvironment` PMREM → soft paint/glass reflections (no HDR file) |
| `components/three/ShadowDisc.jsx` | Soft radial shadow attached to the taxi group |
| `hooks/useMediaQuery.js`, `useWebGLSupport.js`, `three/useModelAvailable.js` | Responsive / feature detection |

**Dependencies** (v10+ of the app): `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`.

Rules:
- **GLB override**: drop a taxi model at `client/public/models/taxi.glb` — it is auto-detected
  (HEAD + content-type check) and normalized to ~4.6 units. A missing file 404s gracefully to the
  procedural model. No flat images, ever.
- **Layering**: taxi layer is `z-[6]`, `pointer-events-none`, `aria-hidden`; hero text + booking
  card are `z-10` above it. The card stays fully interactive.
- **Responsive**: hidden on `<768px` and when WebGL is unavailable; tablets get a compact variant.
- **Reduced motion**: `prefers-reduced-motion` disables entrance + parallax + idle; taxi is static.
- **Branding**: door decals ("RideTaxi · Howard County") + roof "TAXI" sign are canvas textures
  rendered at runtime — no external font/asset downloads.
- **Paint**: procedural model is a glossy black sedan (`#1c1c21` PBR, white DRLs, red taillights)
  — a realistic black car. Keep it black (never red/amber).

## Key Commands

```bash
# Frontend
cd client && npm run dev        # Start dev server
cd client && npm run build      # Production build
cd client && npm run lint       # ESLint

# Backend
cd server && npm run dev        # Start with nodemon
cd server && npm run start      # Production
cd server && npm run seed       # Seed test data
```

## Data Models

### User
```js
{
  _id, name, email, phone, password: (hashed),
  role: "passenger" | "driver" | "admin",
  avatar, createdAt, updatedAt,          // avatar = base64 data-URL (no external storage)
  emailVerified: Boolean,                // default false
  isSuspended: Boolean,                  // default false — protect + login reject suspended users
  pushSubscriptions: [{ endpoint, keys: { p256dh, auth } }],  // web-push endpoints
  authProvider: "local" | "google" | "facebook" | "phone",
  tokenVersion: Number,                  // bumped on logout / password reset to revoke JWTs
  verificationToken: { token, expiresAt } | null,  // hashed, 24h
  resetToken: { token, expiresAt } | null,          // hashed, 1h
  driverDetails: {
    vehicleType: "executive-sedan" | "economy-sedan" | "economy-suv" | "premium-suv" | "luxury-suv" | "van" | "mini-coach" | "school-bus" | "motorcoach",
    plateNumber, licenseNo, isAvailable: Boolean
  }
}
```
Statics: `findByEmail` / `findByPhone` / `findByLogin` (email-or-phone regex autodetect, all `.select('+password')`).

Fleet classes and services are **admin-managed catalog data**, not code. `data/vehicles.js` and
`data/services.js` are now only the offline fallback behind `CatalogContext`; the live source of
truth is the `FleetVehicle` / `ServiceOffering` collections (see below). Both are validated against
the catalog on every write path (ride create/edit, driver registration, CRM vehicle create/update),
so a key must exist and be active or the request 400s. A vehicle type that is referenced by rides or
drivers can be renamed in its `label` and deactivated, but **cannot be deleted or have its `key`
changed** (409) — deactivate it instead, which keeps history intact.

### Ride
```js
{
  _id,
  passenger: ref(User),
  driver: ref(User) | null,
  pickup: { address, lat, lng },
  dropoff: { address, lat, lng },
  vehicleType,                    // FleetVehicle.key — admin-managed, validated on write
  serviceType,                    // ServiceOffering.slug, or "" for none — admin-managed, validated on write
  passengerCount, bags,
  status: "pending" | "accepted" | "arriving" | "in_progress" | "completed" | "cancelled",
  fare: { estimated, final, currency, distanceKm, durationMin },
  route: [{ lat, lng }],           // Polyline from OSRM
  timestamps: { requested, accepted, arrived, started, completed },
  payment: { method, status, transactionId }
}
```

### Location (driver positions)
```js
{
  driver: ref(User),
  coordinates: { lat, lng },
  heading, speed,
  updatedAt                        // TTL index for auto-cleanup
}
```

### RefreshToken (server-side sessions)
```js
{
  user: ref(User),
  tokenHash,                       // SHA-256 of the opaque refresh token
  expiresAt,                       // TTL index -> MongoDB auto-deletes expired
  revokedAt: Date | null,
  rememberMe, userAgent, ip,
  createdAt, updatedAt
}
```

### OtpCode (phone sign-in)
```js
{
  phone,                          // indexed
  codeHash,                       // SHA-256 of the 6-digit code
  expiresAt,                      // TTL index (10 min)
  attempts,                       // max 5 before the code is voided
  createdAt, updatedAt
}
```

### Payment (Stripe + cash + sandbox fallback)
```js
{
  user: ref(User), ride: ref(Ride),
  amount, currency,
  method: "card" | "wallet" | "cash",
  provider: "stripe" | "sandbox" | "cash",
  status: "pending" | "succeeded" | "failed" | "refunded" | "cash",
  transactionId,                  // unique + sparse; pi_… for Stripe, txn_… for sandbox
  idempotencyKey,                 // unique + sparse — caller key prevents double-charge
  failureReason, cardLast4,
  refundedAt, refundTransactionId,
  createdAt, updatedAt
}
```
**Cash**: `POST pay` with `{ method: "cash" }` records a no-charge payment (status
`cash`, provider `cash`); the passenger pays the driver at trip end. Never
refundable, allowed even when `paymentsEnabled=false`. Once a ride is settled
(either `succeeded` or `cash`) it is returned as-is — never charged again.

**Stripe (online card)**: when `STRIPE_SECRET_KEY` is set in `server/.env`,
card payments go through real Stripe Payment Intents. Flow:
1. `POST /api/rides/:rideId/payment-intent` → `{ clientSecret, amount }` (idempotent per ride).
2. Client confirms with the Payment Element (`stripe.confirmPayment`, `redirect: 'if_required'`).
3. `POST pay` with `{ method: "card", paymentIntentId }` — server retrieves the
   intent, verifies `status === 'succeeded'` and amount == ride fare, then records
   it (provider `stripe`, transactionId = `pi_…`).
Unconfirmed/declined intents are rejected (400). Refunds call `stripe.refunds.create`.
The account's Payment Method Configuration is applied automatically via
`automatic_payment_methods: { enabled: true }` — the `pmd_…` Payment Method
Domain id in `server/.env` is informational (dashboard config); do NOT pass it as
`payment_method_configuration` (that param needs a `pmc_…` id).

**Sandbox (fallback)**: when `STRIPE_SECRET_KEY` is unset, card payments use the
simulated gateway — card ending `0002` always declines, `0000` always succeeds,
otherwise ~95% success. Stripe is preferred once configured.

### Notification (in-app)
```js
{
  user: ref(User, indexed),
  type: "ride" | "payment" | "account" | "system",
  title, message,
  data: {},                        // e.g. { rideId } for deep links
  read: Boolean, readAt,
  createdAt
}
```
`notificationService.notify()` writes the row and fans out to the socket room
`user:{id}` (`notification:new`), plus email / SMS / web-push when configured.
`Notification` is the ONLY persisted record — external channels are fire-and-forget.

### FleetVehicle (admin-managed fleet catalog)
```js
{
  key,                             // unique + immutable once in use: "executive-sedan"
  label, desc, capacity,           // display copy ("Executive Sedan", "1–4 passengers")
  seats, bags,                     // numeric, used to pre-fill the booking form
  image,                           // path in client/public, "" = fall back to the icon
  tagline, features: [],           // public Fleet page copy
  icon,                            // a name from client/src/lib/iconMap.js ICONS
  fare: { base, perKm, perMin },   // class rates; global AppSetting overrides still win
  active, sortOrder,
}
```
`catalogService.FLEET_DEFAULTS` holds the 9 seeded classes and is inserted on boot **only when the
collection is empty** — deleting a class is not undone by a restart. `POST /api/admin/fleet/restore-defaults`
re-adds any *missing* default without touching classes an admin has edited.

### ServiceOffering (admin-managed service catalog)
```js
{
  slug,                            // unique + immutable once in use: "airport"
  name, short, tagline, summary,
  features: [],
  icon,                            // a name from client/src/lib/iconMap.js ICONS
  featured,                        // shows in the Home featured band
  active, sortOrder,
}
```
`catalogService.SERVICE_DEFAULTS` holds the 10 seeded services, seeded the same way.

### AppSetting (admin-editable key/value)
```js
{ key: String, unique, value: Mixed }
```
Known keys (defaults in `settingsService.DEFAULTS`): `baseFare`, `perKm`,
`perMin` (optional fare overrides on top of the per-class `FleetVehicle.fare` rates — `null`/0 = use
the class rates), `paymentsEnabled` (toggle), `supportPhone`, `supportEmail`, and `siteContent` (see
the Website content section). `GET /api/settings` exposes a public subset.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register (validates name/email/password >= 6/phone format; 409 on duplicate email). Creates unverified user + sends verification email; returns `verificationLink` in non-production.
- `POST /api/auth/login` - Login with **email OR phone** + password (Passport LocalStrategy). Body: `{ identifier, rememberMe }` (or `{ email }`/`{ phone }`). `rememberMe` = true → 30d refresh, else 7d.
- `POST /api/auth/refresh` - **Rotates** the opaque refresh token (old one is revoked atomically). Rejects replays/concurrent reuse (exactly one success). Rejects if `tokenVersion` changed.
- `POST /api/auth/logout` - **Auth required.** Body `{ refreshToken }` — revokes that device's session.
- `GET /api/auth/google` / `GET /api/auth/facebook` - Passport OAuth2 **redirect** start. 503 if provider not configured. On success the provider bounces back to the callback which issues tokens and redirects to `{CLIENT_ORIGIN}/auth/social?accessToken=&refreshToken=`.
- `GET /api/auth/google/callback` / `GET /api/auth/facebook/callback` - OAuth2 callback → find-or-create/link user → tokens → SPA.
- `POST /api/auth/otp/send` - Body `{ phone }`. Sends a 6-digit SMS code (Twilio, or console + `devCode` in dev). Rate-limited (5/10min/IP).
- `POST /api/auth/otp/verify` - Body `{ phone, code }`. One-time code (10 min TTL, 5 attempts). Find-or-creates a `phone`-provider user and issues tokens.
- `POST /api/auth/verify-email` - Body `{ token }`. Marks `emailVerified`, clears `verificationToken` (24h expiry).
- `POST /api/auth/resend-verification` - Body `{ email }`.
- `POST /api/auth/forgot-password` - Body `{ email }`. Sends reset link (1h expiry); returns `resetLink` in non-production.
- `POST /api/auth/reset-password` - Body `{ token, password }`. Also bumps `tokenVersion` (signs out all sessions).
- `GET /api/auth/me` - Current user profile (auth required)

### Rides
- `POST /api/rides` - Request ride (passenger)
- `GET /api/rides` - List rides (filtered by role)
- `GET /api/rides/:id` - Ride details
- `PATCH /api/rides/:id` - **Edit pending ride** (passenger): pickup/dropoff/vehicleType/serviceType/passengerCount/bags. Changed locations are re-geocoded + fare/route recomputed. Blocked once a driver accepts.
- `PATCH /api/rides/:id/accept` - Driver accepts
- `PATCH /api/rides/:id/status` - Update status (driver). Sets `fare.final` on completion.
- `PATCH /api/rides/:id/cancel` - Cancel ride
- `POST /api/rides/:id/rate` - Rate completed ride (passenger)
- `POST /api/rides/:rideId/pay` - Charge/settle a ride (passenger): `{ method: "cash" }`
  records a no-charge cash payment; `{ method: "card", paymentIntentId }` records a
  Stripe charge. Idempotent (see Payment model).
- `POST /api/rides/:rideId/payment-intent` - Stripe PaymentIntent `{ clientSecret, amount }`
  for the card tab of the pay modal (idempotent per ride).

### Users / Profile
- `GET /api/users/me` - Profile (name, email, phone, avatar, role)
- `PATCH /api/users/me` - Edit name / phone
- `POST /api/users/me/avatar` - Body `{ dataUrl }` (base64 image, ≤512KB). Stored in Mongo.
- `DELETE /api/users/me/avatar` - Remove avatar
- `PATCH /api/users/me/password` - Body `{ currentPassword, newPassword }` (≥6 chars). Keeps current session.

### Payments
- `POST /api/rides/:rideId/pay` - Settle a ride (see Rides above: cash or Stripe card)
- `GET /api/payments` - User's payments (with ride ref)
- `GET /api/payments/:id` - Payment detail
- `POST /api/payments/:id/refund` - Refund a succeeded payment (payer or admin); cash payments are rejected

### Notifications
- `GET /api/notifications` - User's notifications (50 newest)
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/:id/read` / `PATCH /api/notifications/read-all`
- `POST /api/notifications/subscribe` - Body `{ subscription }` (web-push; 503 if VAPID unset)
- `POST /api/notifications/unsubscribe` - Body `{ endpoint }`

### Drivers
- `GET /api/drivers/nearby?lat=&lng=&radius=&vehicleType=` - Find nearby drivers (returns driver + live coords)
- `GET /api/drivers/:id/eta?toLat=&toLng=` - Route + ETA from driver's last position (returns `distanceKm`, `durationMin`, `route` polyline, `from`)
- `PATCH /api/drivers/availability` - Toggle on/off duty

### Catalog (public — the live fleet + services)
- `GET /api/fleet` - Active vehicle classes, in `sortOrder` (no fares — public pricing stays private)
- `GET /api/services` - Active service offerings; `featured: true` marks the Home featured band
- `GET /api/services/:slug` - One service; 404 when unknown **or inactive**

### Places
- `GET /api/places/search?q=` - Address autocomplete (Nominatim) for `LocationSearch`

### Settings (public)
- `GET /api/settings` - Public subset: `paymentsEnabled`, `supportPhone`, `supportEmail`, `vapidPublicKey`

### Admin/CRM
- `GET /api/admin/rides` - All rides with pagination
- `PATCH /api/admin/rides/:id/driver` - **Dispatch**: body `{ driverId }` assigns a driver (status → `accepted`, notified via socket + in-app); body `{ driverId: null }` removes the assigned driver (status → `pending`, back on the board). Rejects suspended drivers, drivers already on an active ride (409), and rides that are completed/cancelled.
- `GET /api/admin/drivers` - Driver list
- `GET /api/admin/analytics` - Dashboard stats
- `GET /api/admin/users?search=&role=&page=&limit=` - User list (search name/email/phone)
- `PATCH /api/admin/users/:id/suspend` / `PATCH /api/admin/users/:id/unsuspend` - Suspend/restore (kills active sessions)
- `DELETE /api/admin/users/:id` - Permanently delete a user + their rides/payments/locations (admins protected)
- `GET /api/admin/payments?status=&page=&limit=` - Payment reports + status summary
- `GET /api/admin/settings` / `PATCH /api/admin/settings` - App settings (fares, toggles, support info)
- `GET /api/admin/content` / `PATCH /api/admin/content` - `siteContent` (all website copy)
- `GET /api/admin/fleet` - Every class incl. inactive, with `fare` + `usage: { rides, drivers }`
- `POST /api/admin/fleet` - Create (key auto-validated, must be kebab-case)
- `PATCH /api/admin/fleet/:id` - Update; `fare` is merged, `key` is immutable once referenced (409)
- `DELETE /api/admin/fleet/:id` - Delete; **409** when rides or drivers still reference the key
- `PATCH /api/admin/fleet/reorder` - Body `{ ids: [...] }`, applied in order
- `POST /api/admin/fleet/restore-defaults` - Re-add *missing* defaults, never overwrite admin edits
- `GET /api/admin/services`, `POST /api/admin/services`, `PATCH /api/admin/services/:id`,
  `DELETE /api/admin/services/:id`, `PATCH /api/admin/services/reorder`,
  `POST /api/admin/services/restore-defaults` - Same shape as the fleet routes (`usage: { rides }`)

## Socket.io Events

**Handshake is JWT-only.** The client sends `{ auth: { token } }` (`socketService.connectSocket(role)`); the server verifies it, loads the `User`, and derives the role from the database. The legacy `{ userId, role }` handshake is **ignored** — trusting it let any socket claim `admin` and read every room. A socket with no token is allowed to connect but joins no rooms and receives no privileged events. `tokenVersion` (logout-all / password reset) and `isSuspended` are both re-checked on connect.

### Client → Server
- `authenticate` `{ userId, role }` - Join `user:{id}` room (drivers also join `drivers` room; admins join `admins` room)
- `ride:join` `{ rideId }` - Join `ride:{rideId}` room. **Authorized only for the ride's passenger, its assigned driver, or admins** (locations flow through these rooms — unauthenticated joins are rejected).
- `driver:location` `{ lat, lng, heading, speed }` - Driver position. **Server looks up the driver's active ride and forwards to `ride:{id}` room only.** Do NOT broadcast to all drivers/passengers.
- `passenger:location` `{ lat, lng, heading, speed }` - Passenger position. Mirror of `driver:location` — forwarded to the passenger's active `ride:{id}` room so the assigned driver sees them live.
- `ride:chat` `{ rideId, text }` - Chat message. Restricted to the ride's passenger, its driver, or admins.
- `ride:cancel` `{ rideId }` - Cancel ride (server re-validates)

### Server → Client
- `ride:update` `{ ride, status }` - Ride status changed (ride room; admins also receive via `admins` room for live dispatch UI)
- `ride:new` `{ ride }` - New pending ride → **only the nearby, available drivers whose vehicle matches** (per-driver `user:{id}` rooms; the ride's passenger + admin also see it via `notification:new`). Used for the driver feed.
- `ride:driverFound` `{ driver, ride }` - Driver assigned (via REST accept → socket)
- `ride:completed` `{ ride, fare }` - Fare final
- `driver:location` `{ driverId, lat, lng, heading, speed }` - Live driver position (ride room)
- `passenger:location` `{ passengerId, lat, lng, heading, speed }` - Live passenger position (ride room)
- `notification:new` `{ _id, type, title, message, data, read, createdAt }` - New in-app notification (user room)

## Seed Credentials

```bash
cd server && npm run seed   # resets users, driver positions and app settings
```

Each account exists on **two domains** — the current `@ridetaxi.com` brand domain and the
legacy `@ellicot.com` domain — with different phone numbers, because sign-in also resolves a
bare phone number. Either login works.

| Role | Email | Password |
|------|-------|----------|
| admin | `admin@ridetaxi.com` | `admin123` |
| passenger | `passenger@ridetaxi.com` | `pass123` |
| driver (sedan) | `alex@ridetaxi.com` | `driver123` |
| driver (suv) | `sam@ridetaxi.com` | `driver123` |
| admin (legacy) | `admin@ellicot.com` | `admin123` |
| passenger (legacy) | `passenger@ellicot.com` | `pass123` |
| driver (legacy) | `alex@ellicot.com` / `sam@ellicot.com` | `driver123` |

Driver positions are seeded near Howard County, MD (~39.20, -76.85). "Nearby drivers" queries use these seeded `Location` docs — no drivers online until you run the seed.

> **Database is per-app.** `MONGO_URI` must point at `ellicottaxi`, **not** `ridetaxi`. The
> `ridetaxi` database on this machine belongs to a different project (`../RLS`). Sharing it let
> that project's admin accounts authenticate here and granted them Ellicot admin access, and its
> support-phone/email settings overrode ours. Never point two apps at the same database.

## Auth Flow

1. Register → user created `emailVerified:false` + `verificationToken` (hashed, 24h) → verification email sent (SMTP, or console + `verificationLink` **only when `EXPOSE_DEV_TOKENS=true`**). Account is auto-logged-in and the page shows an "Account created" confirmation (it does not auto-redirect).
2. `POST /verify-email?token=` (`/verify-email` page) verifies the account; `VerifyEmailBanner` (App.jsx) shows "verify your email" with a resend button for any logged-in unverified user.
3. Login (`POST /api/auth/login`) is handled by **Passport LocalStrategy** (`usernameField: 'identifier'` → email-or-phone). On success the controller issues a 15m access JWT + an opaque refresh token.
4. Access token embeds `{ id, role, v: tokenVersion }`; `protect` uses the **Passport JWT strategy** and rejects when `v` changes (password reset / logout-all). `TOKEN_EXPIRED` code triggers the client refresh.
5. Refresh tokens are **opaque, stored hashed** in the `RefreshToken` collection with a TTL index (auto-cleanup). `POST /refresh` **atomically rotates** (`findOneAndUpdate` on `revokedAt: null`) → replaying or racing the same token yields exactly one success. `POST /logout` revokes that device's token. Password reset revokes all + bumps `tokenVersion`. There is no `JWT_REFRESH_SECRET` — refresh tokens are not JWTs.
6. Social login is the **Passport OAuth2 redirect flow**: `/auth/google` → Google → `/auth/google/callback` → find-or-create/link user → redirect to `/auth/social?accessToken=&refreshToken=` (SPA stores tokens, hard-redirects to `/`). Strategies register only when `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` or `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` are set; buttons render only when `VITE_GOOGLE_CLIENT_ID`/`VITE_FACEBOOK_APP_ID` are set in `client/.env`. A suspended user is rejected on the callback too, so OAuth cannot be used to bypass a suspension.
7. Phone OTP (`/otp/send` + `/otp/verify`) find-or-creates a `phone`-provider user and issues tokens. One-time code (10 min TTL, 5 attempts); without Twilio the code is logged and returned as `devCode` **only when `EXPOSE_DEV_TOKENS=true`**. Both endpoints coerce `phone` to a string and only accept a 6-digit `code`, so NoSQL operator payloads are rejected rather than executed. OTP send is rate-limited per IP. **Currently disabled in the frontend** (no phone button on Login/Register) — backend endpoints remain for later re-enable.
8. On 401, `api.js` queued-refresh pattern calls `/refresh`, stores the rotated token, retries; on failure clears storage + redirects to `/login`. A `403 Insufficient permissions` also clears + redirects.
9. **Per-role client sessions**: `api.js` stores tokens under per-role keys (`rt_<role>_access` / `rt_<role>_refresh`) with a per-tab active-role marker in `sessionStorage`, so admin/driver/passenger can stay signed in simultaneously in different tabs without overwriting each other. `tokenStore.setActiveRole()` is set on login/register/social and after `getMe`.
10. **The socket handshake never trusts the client's identity**: `socketService.connectSocket(role)` reads the access token and sends only `{ auth: { token } }`. The server re-derives the user and role from the database — see Socket.io Events.

> **Stateless & scalable**: every Passport strategy runs `session:false` — no session store, no sticky sessions, any instance serves any request. Rate limits are per-IP and in-memory per instance (use Redis or a shared store for multi-instance).

## Production Hardening (index.js)

- `helmet()` security headers; `express.json({ limit: '1mb' })`.
- `express-rate-limit`: global API limiter (default 600/15min), auth limiter (60/15min), login limiter (10/15min), OTP limiter (5/10min) — all configurable via `RATE_LIMIT_*` env vars. 429 when exceeded. All four are built by one `limiter()` factory so they cannot drift apart.
- **IPv6**: keys go through `ipKeyGenerator(req.ip)`. Do not use `req.ip` directly in a `keyGenerator` — the library throws in `validate.xForwardedForHeader`, and a naive key also lets a single IPv6 host rotate through `/64`s to bypass the cap.
- **Redis** (`config/redis.js`) is optional. Without `REDIS_URL` the limiters use the in-memory store (per instance); with it they use a `rate-limit-redis` store. `initRedis()` runs before any limiter is constructed — the store cannot be swapped afterwards.
- **Boot-time env validation** (`config/env.js`): `assertEnv()` runs at startup and **throws** in production on a missing/short `<32`-char `JWT_ACCESS_SECRET`, a placeholder-looking secret, `EXPOSE_DEV_TOKENS=true`, a login limit above 20, or a localhost `MONGO_URI`. A misconfigured deploy fails immediately instead of running insecurely.
- **Dev-token gate**: registration/OTP/forgot-password only return `verificationLink` / `resetLink` / `devCode` in the response when `EXPOSE_DEV_TOKENS=true`. This is an explicit opt-in, **not** `NODE_ENV` — the app is frequently run in production mode locally, which used to leak live reset links.
- `TRUST_PROXY=true` when behind nginx/Render/Vercel so `req.ip` and rate limits see the real client IP.
- Strict CORS to `CLIENT_ORIGIN` only.
- `process.on('unhandledRejection')` logs; `uncaughtException` logs and exits 1.
- Socket handlers are all wrapped so a bad `ObjectId` or a failed query can never take the process down.

## Deployment

| Target | What to do |
|--------|------------|
| **Vercel** (client) | `client/vercel.json` already rewrites all paths to `/index.html` for the SPA. Point the project at `client/`, or set the root directory accordingly. Set `VITE_*` build vars. |
| **Render** (server) | No Render config is committed. Use `npm start` from `server/` (or `render.yaml` if one is added) and set every env var from `server/.env.example` as a **secret**. `PORT` is supplied by Render — do not hardcode it. |
| **MongoDB Atlas** | Atlas is **not** deployed from this repo. Create the cluster, add the IP allowlist for Render, and set `MONGO_URI` as a Render secret. The database name must stay `ellicottaxi`. |

Required in production: `NODE_ENV=production`, `MONGO_URI`, `JWT_ACCESS_SECRET` (32+ chars, random), `CLIENT_ORIGIN`, `TRUST_PROXY=true`, plus `REDIS_URL` and the third-party keys you actually use. **Never** set `EXPOSE_DEV_TOKENS`.

## Audit Log

`middleware/audit.js` wraps `res.json` and writes an `AuditLog` row (actor, actorEmail, actorRole, action, targetType, targetId, ip, userAgent, statusCode, durationMs, path) on a fire-and-forget basis. `targetId` prefers `req.params.id`, then any `_id` in the response, then `key`/`slug`.

**Every mutating admin route must be wrapped in `audit(...)`** — `routes/admin.js` (assign driver, driver toggle, suspend/unsuspend/delete user, content, settings, all fleet + service catalog writes) and `routes/crm.js` (dispatch, no-show, vehicle create/update, ticket create/update). The Audit Log tab is only as trustworthy as that coverage; a new `POST`/`PATCH`/`DELETE` route that mutates state without `audit()` is a gap.


## External API Dependencies (no keys, but need network)

- **Nominatim** (`rideService.geocode`) - free geocoding; sets `User-Agent: RideTaxi/1.0`. Rate-limited (1 req/s).
- **OSRM** (`rideService.getRoute`) - free routing; returns distance/duration/polyline used for fares + map route.

## Development Phases

| Phase | What | Status |
|-------|------|--------|
| 1 | Auth + Booking Form + Basic Map | Done |
| 2 | Driver Dashboard + Accept Rides | Done |
| 3 | Real-time Tracking (Socket.io) | Done |
| 4 | Ride History + Ratings | Done |
| 5 | Admin CRM Dashboard | Done |
| 6 | Public marketing site (Home, Services, Careers) | Done |
| 7 | User Profile (avatar/password) + Ride Editing | Done |
| 8 | Sandbox Payments + Refunds | Done |
| 9 | Notifications (in-app + email + SMS + web-push) | Done |
| 10 | Admin Users/Payments/Settings management | Done |

## Key Patterns

### Geospatial Query (find nearby drivers)
```js
// MongoDB 2dsphere query
Location.find({
  coordinates: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: radiusInMeters
    }
  }
}).populate('driver');
```

### Socket.io Room Pattern
```js
// Join ride-specific room
socket.join(`ride:${rideId}`);

// Broadcast to room
io.to(`ride:${rideId}`).emit('ride:update', { ride, status });
```

### Route Calculation (OSRM - free)
```js
// GET http://router.project-osrm.org/route/v1/driving/{lng},{lat};{lng},{lat}?overview=full
// Returns polyline geometry for map display
```

## Common Pitfalls

1. **Token refresh race condition**: Queue failed requests while refresh is in progress
2. **Location updates**: Throttle driver position updates to 1 per 2 seconds max
3. **Map markers**: Use `useMemo` for Leaflet markers to prevent re-render lag
4. **MongoDB geospatial**: Create `2dsphere` index on Location.coordinates
5. **CORS**: Backend must allow `http://localhost:5173` in dev
6. **Rename colors, not classes**: change values in `index.css` `@theme`, never Tailwind class names in components (see Design System)
7. **Don't hardcode new brand hexes in components**: route polyline `#b3221a` is the only allowed exception (Leaflet path options need raw hex)
8. **Payment idempotency**: the client sends a fresh `idempotencyKey` per attempt; a failed attempt's key is burned (409 on replay). `Payment.transactionId`/`idempotencyKey` are `sparse` unique — do not revert to non-sparse (duplicate-key crashes on pending/failed rows).
9. **`paymentsEnabled=false`**: `paymentService` rejects with 403; the UI surfaces the disable notice (PaymentModal fetches `GET /api/settings`). Re-enable via admin Settings tab.
10. **Suspension**: login (`passport.js`), every protected route (`middleware/auth.js`), and refresh rotation all reject `isSuspended` users; admin suspend also revokes their refresh tokens.
11. **Lowercase JSX tags are DOM, not components**: `<icon />` where `icon` is a prop holding a component renders a literal `<icon>` element and logs "unrecognized tag". Always alias it — `const Icon = icon;` then `<Icon />`. Same class of bug for catalog strings: render them through `ui/ServiceIcon.jsx` (`<s.icon />` silently produced `<s>` with an unknown attribute).
12. **One role vocabulary**: import `ADMIN_ROLES` / `hasRole` from `client/src/lib/roles.js` for guards *and* nav. An earlier guard allowed 6 CRM roles while the navbar only linked `role === 'admin'`, so a dispatcher could reach the CRM by URL but had no way to navigate there.
13. **Hash tabs must listen to the URL**: `ContentPage` seeds its tab from `location.hash` on mount, `pushState`s on click, and subscribes to `hashchange`/`popstate`. Without those listeners a deep link opened on an already-mounted page kept the old tab and browser back did nothing.
14. **Catalog writes are audited**: adding an admin `POST`/`PATCH`/`DELETE` without `audit(...)` silently shrinks the Audit Log. See the Audit Log section.
