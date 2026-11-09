# TimeFlow Enterprise — Multi-Tenant SaaS Web Portal (`timeflow-web`)

![React](https://img.shields.io/badge/React-19.2-61DAFB.svg)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6.svg)

Modern, responsive **Multi-Tenant SaaS HRM, Geofenced Attendance, and BYOD Database Management Web Portal** built with **React 19, Vite 8, Tailwind CSS v4, Zustand, and React Leaflet**.

---

## Key Features

### 1. Multi-Tenant SaaS Onboarding & BYOD Database Console
* **Self-Service Organization Onboarding (`/auth/onboard`):** Provision a new organization workspace in seconds with automatic schema creation, default leave quotas, and initial `SUPER_ADMIN` provisioning.
* **Bring Your Own Database (BYOD) Support:** Connect a client-owned PostgreSQL instance (Neon, AWS RDS, Supabase, Azure, or On-Premise) with live **Database Connection & Latency Testing** before provisioning.
* **SaaS Infrastructure & Telemetry Console (`/app/admin/tenants`):** Monitor active warm database connection pools, L1/L2 Redis + Memory LRU cache hit rates, subscription plan quotas, and hot-swap tenant databases at runtime without downtime.

### 2. Real-Time Geofenced Attendance & Interactive Maps
* **Live Attendance Clock Widget:** Browser geolocation integration with real-time elapsed shift timers and out-of-branch exception reason submission.
* **Interactive Leaflet Branch Map Picker (`/app/admin/branches`):** Visually configure branch coordinates and geofence perimeter radii (`radiusMeters`) on an interactive map.
* **Company Attendance & Location Failure Audit (`/app/admin/attendance`):** Inspect organization-wide attendance logs, review GPS exception reasons, and export monthly CSV reports.

### 3. Leave Ledger & Workforce Management
* **Ledger-Backed Leave Management (`/app/leaves`):** Request `FULL`, `HALF` (`MORNING` / `AFTERNOON`), or `SHORT` leaves with acting employee selection and holiday-aware day validation.
* **Employee Directory & Email Invitations (`/app/employees`):** Invite staff via tokenized onboarding emails, approve pending registrations, and adjust individual employee leave balances.
* **Bulk CSV Data Import (`/app/admin/import`):** Drag-and-drop CSV importer powered by PapaParse for migrating legacy employees, attendance logs, and leave histories.

---

## Tech Stack
* **Framework:** React 19 + TypeScript + Vite 8
* **Styling:** Tailwind CSS v4 + Dark/Light Theme Engine (`themeStore`)
* **State Management:** Zustand (`authStore` with workspace slug persistence, `loader.store`)
* **Maps & Geospatial:** Leaflet + React-Leaflet
* **Authentication:** JWT with automatic refresh queue + `@react-oauth/google`

---

## Environment Configuration (`.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Type-check and build for production
npm run build
```

---

## Author
Designed and developed by **[Shamodha Sahan](https://shamodha.com)**.
