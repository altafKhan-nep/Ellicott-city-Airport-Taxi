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
| `ink` / `muted` | Text on off-white paper | `ink #0b0d0f`, `muted #667085`, `paper #f8f9fa` |
| Fonts | `--font-display` = **Fraunces** (serif, headings — elegant editorial), `--font-sans` = **Inter** (body, highly readable) | Google Fonts, loaded in `client/index.html` |

Usage rules:
- **Red leads**: `bg-brand-gradient` (deep red) is the primary surface for nav/hero/footer/CTA bands. CTAs use `btn-brand-gradient` (bright→deep red). `bg-brand-gradient-soft` (warm off-white wash) is the body background between bands. `text-brand-gradient` (red) highlights words/stats on light sections.
- **Gold accents on red**: hero accent words, live dots, stat numbers and phone numbers on red bands use `text-gold-300` / `bg-gold-400` (not red) so they pop against the red.
- **Black is a contrast accent only** — body headings (`ink`), dark icons, map pins; never a surface color.
- Pills everywhere (Uber-style touch targets): `rounded-full` inputs (`input-pill`), buttons, chips.
- Functional map colors are the ONLY allowed exceptions to the palette: pickup = circular green `map-pin-start` (#10b981), dropoff = red `map-pin-dropoff` (brand-700), driver = pulsing red `map-pin-driver` (brand-600), idle vehicles = `map-pin-vehicle` (white circle + black border). Route polyline is brand red `#c62828` (white casing) hardcoded in `BookingMap.jsx` and `RideTracking.jsx`.
- Depth comes from layered shadows: `.card-lift` (resting 2-layer shadow, float on hover) — no heavy borders.

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 18 + Vite + React Router v6 | Fast dev, modern bundler |
| Styling | Tailwind CSS | Rapid responsive UI |
| Maps | Leaflet + OpenStreetMap | Free, no API key |
| Backend | Express.js + Socket.io | Real-time events |
| Database | MongoDB + Mongoose | Flexible schema, geospatial queries |
| Auth | JWT (access + refresh tokens) | Stateless, scalable |

## Project Structure

```
ride-booking/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI (maps/, rides/, ui/, layout/, three/)
│   │   ├── pages/           # Route pages
│   │   │   ├── marketing/   # Public site: Home, About, Services, ServiceDetail, Fleet, Contact, Careers
│   │   │   ├── passenger/   # Reservations.jsx (booking), RideTracking, RideHistory
│   │   │   ├── driver/      # Dashboard.jsx
│   │   │   └── admin/       # Dashboard.jsx
│   │   ├── data/            # services.js (10 services shared across marketing pages + nav + footer)
│   │   ├── hooks/           # useSocket, useGeolocation, useAuth
│   │   ├── context/         # AuthContext
│   │   └── services/        # api.js, authService.js, socketService.js, rideService.js
│   └── public/
├── server/                  # Express backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Mongoose schemas (User, Ride, Location)
│   │   ├── routes/          # API routes
│   │   ├── middleware/       # auth.js, validate.js
│   │   ├── services/        # Business logic (rideService.js, driverService.js)
│   │   └── config/          # db.js, socket.js
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
| `/contact` | marketing/Contact.jsx | Public | Quote form (mailto to ridetaxis@gmail.com) + info |
| `/careers` | marketing/Careers.jsx | Public | Driver application form + PDF links |
| `/reservations` | passenger/Reservations.jsx | Public* | Booking flow: autocomplete + map + drivers strip |
| `/login`, `/register` | pages/Login.jsx, Register.jsx | Public | Auth |
| `/rides/history` | passenger/RideHistory.jsx | passenger | |
| `/rides/track/:id` | passenger/RideTracking.jsx | passenger | Live tracking + ETA |
| `/driver` | driver/Dashboard.jsx | driver | Accept rides, location broadcast |
| `/admin` | admin/Dashboard.jsx | admin | CRM + analytics |

\* `/reservations` is viewable by anyone, but the request button prompts login.

**Reservations flow** (`passenger/Reservations.jsx`):
1. `LocationSearch` (autocomplete → `GET /api/places/search`) sets pickup/dropoff.
2. `BookingMap` shows nearby vehicles (`GET /api/drivers/nearby`) once pickup is set.
3. Selecting a driver calls `GET /api/drivers/:id/eta` → draws dashed route to pickup + shows ETA strip.
4. Submit → `POST /api/rides` → navigate to `/rides/track/:id`.

## Real Business Info (from ridetaxis.com)

| Field | Value |
|-------|-------|
| Phone | (443) 546-4116 → `tel:4435464116` |
| Email | ridetaxis@gmail.com |
| Location | Columbia, Maryland |
| Social | facebook.com/ridetaxi.ridetaxi |
| Legal name | Ride Taxi LLC |

Used in `Footer.jsx` (contact column) and the `tel:`/`mailto:` CTAs on marketing pages.

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
  avatar, createdAt, updatedAt,
  driverDetails: {
    vehicleType: "sedan" | "suv" | "van",
    plateNumber, licenseNo, isAvailable: Boolean
  }
}
```

### Ride
```js
{
  _id,
  passenger: ref(User),
  driver: ref(User) | null,
  pickup: { address, lat, lng },
  dropoff: { address, lat, lng },
  vehicleType, passengerCount, bags,
  status: "pending" | "accepted" | "arriving" | "in_progress" | "completed" | "cancelled",
  fare: { estimated, final },
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

## API Endpoints

### Auth
- `POST /api/auth/register` - Register passenger
- `POST /api/auth/login` - Returns access + refresh tokens
- `POST /api/auth/refresh` - Get new access token
- `GET /api/auth/me` - Current user profile

### Rides
- `POST /api/rides` - Request ride (passenger)
- `GET /api/rides` - List rides (filtered by role)
- `GET /api/rides/:id` - Ride details
- `PATCH /api/rides/:id/accept` - Driver accepts
- `PATCH /api/rides/:id/status` - Update status (driver)
- `PATCH /api/rides/:id/cancel` - Cancel ride

### Drivers
- `GET /api/drivers/nearby?lat=&lng=&radius=&vehicleType=` - Find nearby drivers (returns driver + live coords)
- `GET /api/drivers/:id/eta?toLat=&toLng=` - Route + ETA from driver's last position (returns `distanceKm`, `durationMin`, `route` polyline, `from`)
- `PATCH /api/drivers/availability` - Toggle on/off duty

### Places
- `GET /api/places/search?q=` - Address autocomplete (Nominatim) for `LocationSearch`

### Admin/CRM
- `GET /api/admin/rides` - All rides with pagination
- `GET /api/admin/drivers` - Driver list
- `GET /api/admin/analytics` - Dashboard stats

## Socket.io Events

### Client → Server
- `authenticate` `{ userId, role }` - Join `user:{id}` room (drivers also join `drivers` room)
- `ride:join` `{ rideId }` - Join `ride:{rideId}` room (passenger + driver)
- `driver:location` `{ lat, lng, heading, speed }` - Driver position. **Server looks up the driver's active ride and forwards to `ride:{id}` room only.** Do NOT broadcast to all drivers/passengers.
- `ride:cancel` `{ rideId }` - Cancel ride (server re-validates)

### Server → Client
- `ride:update` `{ ride, status }` - Ride status changed
- `ride:new` `{ ride }` - New pending ride → all drivers (used for driver feed)
- `ride:driverFound` `{ driver, ride }` - Driver assigned (via REST accept → socket)
- `ride:completed` `{ ride, fare }` - Fare final
- `driver:location` `{ driverId, lat, lng, heading, speed }` - Live driver position (ride room)

## Auth Flow

1. Login → server returns `accessToken` (15min) + `refreshToken` (7d)
2. Client stores both in `localStorage` (`rt_access`, `rt_refresh`) via `services/api.js`
3. Axios request interceptor auto-attaches `Authorization: Bearer <token>`
4. On 401, queued-refresh pattern calls `/api/auth/refresh`, retries original request
5. On refresh failure, clears storage + redirects to `/login`

## Seed Credentials

```bash
cd server && npm run seed   # resets users + driver positions
```

| Role | Email | Password |
|------|-------|----------|
| admin | `admin@ridetaxi.com` | `admin123` |
| passenger | `passenger@ridetaxi.com` | `pass123` |
| driver (sedan) | `alex@ridetaxi.com` | `driver123` |
| driver (suv) | `sam@ridetaxi.com` | `driver123` |

Driver positions are seeded near Howard County, MD (~39.20, -76.85). "Nearby drivers" queries use these seeded `Location` docs — no drivers online until you run the seed.

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
| 7 | Payment Integration | Future |

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
