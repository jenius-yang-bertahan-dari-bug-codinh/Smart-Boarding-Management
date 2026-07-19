# 🏠 Papikost — Smart Boarding Management System

> A full-stack web application for managing modern boarding houses (kos-kosan). Built for landlords and property managers who want to automate operations, track residents, and monitor payments — all from one dashboard.

---

## ✨ Features

### 🖥 Admin Panel
| Feature | Description |
|---|---|
| **Dashboard** | Real-time KPIs — occupancy rate, revenue, pending maintenance, and new reservations. Interactive monthly/weekly revenue chart. |
| **Quick Actions** | One-click shortcuts: Add Resident, Generate Invoices, Open Maintenance Tickets, Broadcast Announcements. |
| **Recent Activity Modal** | Unified view of latest payments, member events, and maintenance updates in one place. |
| **Room Management** | Full CRUD for rooms. Status tracking: `Available`, `Occupied`, `Maintenance`. |
| **Resident (Member) Management** | Onboard residents, assign rooms, manage contracts and payment history. |
| **Billing & Invoices** | Auto-generated invoices, payment verification queue, overdue tracking, and Payment Trends chart. |
| **Maintenance Tickets** | Log and track repair requests submitted by residents. Resolve tickets with notes. |
| **Reservations** | Handle incoming booking requests from prospective tenants. |
| **Admin Guide** | In-app documentation page at `/admin/guide` with step-by-step instructions for all modules. |
| **Settings** | Profile, notification preferences, security (password change), and appearance. |

### 🌐 Public Landing Page
- Room showcase with live availability
- Facility highlights and location map
- Online checkout & booking flow powered by **Midtrans** payment gateway

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) — App Router, Server Actions, Server Components |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Database** | [SQLite](https://www.sqlite.org/) via [Prisma ORM 6](https://www.prisma.io/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Icons** | [Lucide React](https://lucide.dev/) |
| **Auth** | [jose](https://github.com/panva/jose) (JWT) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Payments** | [Midtrans](https://midtrans.com/) Sandbox |
| **PDF** | [PDFKit](https://pdfkit.org/) |
| **Runtime** | [Node.js](https://nodejs.org/) 18+ |

---

## 📦 Local Setup

### Prerequisites
- **Node.js** v18 or later
- **npm** v9 or later

### 1. Clone the repository
```bash
git clone <REPOSITORY_URL>
cd Smart-Boarding-Management
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```env
# Midtrans Payment Gateway (Sandbox)
MIDTRANS_MERCHANT_ID="G105380640"
MIDTRANS_CLIENT_KEY="SB-Mid-client-PLcINWELsBNsoBdN"
MIDTRANS_SERVER_KEY="SB-Mid-server-k5VnZZNVNdRTXqed22jd4LRD"
MIDTRANS_IS_PRODUCTION="false"
```

### 4. Set up the database
```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to SQLite
npx prisma db push

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 5. Start the dev server
```bash
npm run dev
```

### 6. Open the app
| URL | Description |
|---|---|
| `http://localhost:3000` | Public landing page |
| `http://localhost:3000/admin` | Admin dashboard |
| `http://localhost:3000/login` | Admin login |

### Useful scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint

npx prisma studio       # Open Prisma DB browser at localhost:5555
npx prisma db push      # Sync schema changes to DB
npx prisma db seed      # Re-seed with sample data
```

---

## 📁 Project Structure

```text
Smart-Boarding-Management/
├── prisma/
│   ├── schema.prisma        # Database schema (Rooms, Members, Payments, Complaints)
│   └── seed.ts              # Sample data seeder
├── src/
│   ├── app/
│   │   ├── admin/           # Admin panel pages
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── guide/           # In-app Admin Guide documentation
│   │   │   ├── billing/         # Billing & invoices
│   │   │   ├── members/         # Resident management
│   │   │   ├── rooms/           # Room management
│   │   │   ├── maintenance/     # Maintenance tickets
│   │   │   ├── reservations/    # Booking requests
│   │   │   ├── settings/        # Admin settings
│   │   │   └── landing-page/    # Landing page editor
│   │   ├── actions/         # Next.js Server Actions (DB mutations)
│   │   │   ├── dashboard.ts
│   │   │   ├── billing.ts
│   │   │   ├── members.ts
│   │   │   ├── maintenance.ts
│   │   │   ├── properties.ts
│   │   │   └── quick-actions.ts
│   │   ├── api/             # API route handlers
│   │   │   ├── auth/            # Login / logout
│   │   │   └── checkout/        # Midtrans payment integration
│   │   ├── globals.css      # Global styles
│   │   └── page.tsx         # Public landing page
│   ├── components/          # Reusable React components
│   │   ├── AdminNavbar.tsx
│   │   ├── Footer.tsx
│   │   └── Logo.tsx
│   └── lib/
│       └── prisma.ts        # Prisma client singleton
└── .env                     # Environment variables (not committed)
```

---

## 🤝 Git Collaboration Workflow

> 🛑 **NEVER push or commit directly to `main`.** All changes go through feature branches and Pull Requests.

### Daily workflow

```bash
# 1. Always start from an up-to-date main
git checkout main
git pull origin main

# 2. Create a feature branch
git checkout -b feature/your-feature-name
# e.g. git checkout -b feature/billing-overdue-alert

# 3. Work, then commit with a clear message
git add .
git commit -m "feat: add overdue payment alert to billing page"
git push origin feature/your-feature-name

# 4. Open a Pull Request on GitHub → target branch: main
# 5. Request a review from at least one teammate before merging
```

### Keeping your branch up to date

```bash
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main
# Resolve conflicts locally, then push
```

### Commit message convention

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `style:` | UI/CSS changes only |
| `refactor:` | Code restructure, no behavior change |
| `chore:` | Config, deps, tooling |
| `docs:` | README or documentation updates |

---

## 🧑‍💻 Coding Standards

- **Components:** `PascalCase` filenames and function names — e.g., `AdminNavbar.tsx`
- **Variables & functions:** `camelCase` — e.g., `const fetchRooms = () => {}`
- **Types / Interfaces:** `PascalCase` — e.g., `interface RoomProps {}`
- **Server Actions:** All DB queries live in `src/app/actions/` and must start with `"use server"`
- **Styling:** Use Tailwind CSS utility classes. Avoid inline `style={{}}` unless strictly necessary.
- **No implicit `any`:** Always type your parameters explicitly in callbacks and reduce functions.

---

## 👥 Team

| Role | Name |
|---|---|
| Developer | Michael |
| Developer | Fathan |
| Developer | Theodore |
| Project Manager | Alfadzri |
| Business Analyst | Nofi |

---

*Questions or issues? Reach out in the developer group chat.*
