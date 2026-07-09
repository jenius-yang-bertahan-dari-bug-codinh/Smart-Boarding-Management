# Smart Boarding House Management System

Welcome to the **Smart Boarding House Management System**! 

This is a comprehensive full-stack web application designed to manage boarding houses (kost/kontrakan). It features a modern, user-facing landing page for prospective tenants and a powerful, integrated Admin Panel for landlords/managers to handle rooms, members, reservations, billing, and maintenance.

---

## 🚀 Key Features

- **Dynamic Landing Page**: Showcases room availability, premium facilities, and location map.
- **Admin Dashboard**: Real-time overview of occupancy, monthly revenue, and system health.
- **Room Management**: Full CRUD operations for rooms, including dynamic status updates and member assignments.
- **Resident (Member) Directory**: Manage tenant profiles, view contract details, and handle room assignments.
- **Billing & Invoicing**: Track payments, pending invoices, and monthly revenue trends.
- **Maintenance Tracking**: Log, schedule, and track repairs and maintenance requests.
- **Reservation System**: Handle incoming booking requests from prospective tenants.

---

## 🛠 Tech Stack

This project is built using modern full-stack technologies to ensure performance, type safety, and rapid development:

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Database:** [SQLite](https://www.sqlite.org/) via [Prisma ORM](https://www.prisma.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📦 Prerequisites & Local Setup

To run this project locally, ensure you have **Node.js** (v18+ recommended) installed.

### Step-by-Step Setup:

1. **Clone the repository:**
   ```bash
   git clone <REPOSITORY_URL>
   cd ITPROJECTMANAGEMENTFINAL/Smart-Boarding-Management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the Midtrans Sandbox credentials:
   ```env
   MIDTRANS_MERCHANT_ID="G105380640"
   MIDTRANS_CLIENT_KEY="SB-Mid-client-PLcINWELsBNsoBdN"
   MIDTRANS_SERVER_KEY="SB-Mid-server-k5VnZZNVNdRTXqed22jd4LRD"
   MIDTRANS_IS_PRODUCTION="false"
   ```

4. **Set up the Database (Prisma):**
   This project uses SQLite for ease of development. Generate the Prisma client and push the schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **View the app:**
   - Landing Page: [http://localhost:3000](http://localhost:3000)
   - Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🤝 Git Collaboration Workflow (CRITICAL)

To ensure smooth collaboration among the team (Michael, Fathan, Theodore) and to maintain clear progress for Alfadzri (PM) and Nofi (BA), everyone **MUST** follow these strict Git rules:

> **CRITICAL RULE:** 🛑 **NEVER** push or commit directly to the `main` branch!

### 1. Update your local `main` branch before starting work:
Always make sure you are up to date with the latest code before creating a new branch.
```bash
git checkout main
git pull origin main
```

### 2. Create a new Feature Branch:
Branch names should be descriptive of the task you are working on.
```bash
git checkout -b feature/your-feature-name
# Example: git checkout -b feature/admin-dashboard
```

### 3. Work, Commit, and Push:
Commit your changes with clear, descriptive messages.
```bash
git add .
git commit -m "feat: add admin dashboard layout"
git push origin feature/your-feature-name
```

### 4. Pull Request (PR) & Code Review:
- Go to the repository on GitHub/GitLab and open a **Pull Request (PR)** against the `main` branch.
- **DO NOT** merge your own PR immediately.
- Require **at least one code review** and approval from another developer before merging.

### 5. Keeping your branch updated (Avoiding Conflicts):
If someone else merges code into `main` while you are working, update your branch safely:
```bash
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main
# Resolve any conflicts locally, then push again
```

---

## 📁 Project Folder Structure

```text
src/
├── app/                  # Next.js App Router (pages, layouts, server actions)
│   ├── admin/            # Admin Panel Pages (Dashboard, Rooms, Members, etc.)
│   ├── actions/          # Next.js Server Actions for database mutations
│   ├── globals.css       # Tailwind CSS and global styling configuration
│   └── page.tsx          # Main Landing Page
├── components/           # Reusable React components (AdminNavbar, Modals, UI blocks)
├── lib/                  # Library configurations (Prisma client)
├── data/                 # Mock data (if any remaining)
└── types/                # TypeScript interface and type definitions
prisma/
└── schema.prisma         # Prisma database schema definition
```

---

## 🧑‍💻 Coding Standards

- **Components:** Use **PascalCase** for component files and function names (e.g., `AdminNavbar.tsx`).
- **Variables & Functions:** Use **camelCase** (e.g., `const fetchRooms = () => {}`).
- **Types/Interfaces:** Use **PascalCase** (e.g., `interface RoomProps {}`).
- **Server Actions:** Keep database queries inside `src/app/actions/` and use `"use server"`.
- **Styling:** Use standard Tailwind CSS utility classes. Avoid inline `style={{}}`.

---
*If you run into any issues, please reach out in the developer group chat!*
