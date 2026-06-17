# Smart Boarding House Management System - Frontend 🏠

Welcome to the **Frontend Repository** of the Smart Boarding House Management System! 

This web application serves as the user-facing landing page and tenant portal. It provides real-time room availability, highlights premium facilities, and presents an interactive location map. Our goal is to offer a highly responsive, modern, and premium web experience for prospective and current tenants.

---

## Tech Stack

This project is built using modern frontend technologies to ensure performance, type safety, and rapid UI development:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Prerequisites & Local Setup

To run this project locally, ensure you have **Node.js** (v18+ recommended) installed.

### Step-by-Step Setup:

1. **Clone the repository:**
   ```bash
   git clone <REPOSITORY_URL>
   cd ITPROJECTMANAGEMENTFINAL
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **View the app:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000). The page will auto-update as you edit files.

---

## Git Collaboration Workflow (CRITICAL)

To ensure smooth collaboration among **Michael, Fathan, and Theodore**, and to maintain clear progress for **Alfadzri (PM)** and **Nofi (BA)**, everyone **MUST** follow these strict Git rules to prevent merge conflicts.

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
# Example: git checkout -b feature/room-card
```

### 3. Work, Commit, and Push:
Commit your changes with clear, descriptive messages.
```bash
git add .
git commit -m "feat: add room card component"
git push origin feature/your-feature-name
```

### 4. Pull Request (PR) & Code Review:
- Go to the repository on GitHub/GitLab and open a **Pull Request (PR)** against the `main` branch.
- **DO NOT** merge your own PR immediately.
- Require **at least one code review** and approval from another developer before merging.
- Once approved, squash and merge into `main`.

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

## Project Folder Structure

This project follows the Next.js App Router conventions. All source code is located inside the `src/` directory.

```text
src/
├── app/                  # Next.js App Router (pages, layouts, global styles)
│   ├── globals.css       # Tailwind CSS and global styling configuration
│   ├── layout.tsx        # Root layout HTML and Metadata
│   └── page.tsx          # Main Landing Page
├── components/           # Reusable React components (UI building blocks)
│   ├── Facilities.tsx
│   ├── Hero.tsx
│   ├── LocationMap.tsx
│   └── RoomCard.tsx
├── data/                 # Mock data for frontend integration testing
│   └── mockRooms.ts
└── types/                # TypeScript interface and type definitions
    └── index.ts
```

---

## Coding Standards

To keep the codebase clean and consistent, please adhere to these simple rules:

- **Components:** Use **PascalCase** for component files and function names (e.g., `RoomCard.tsx`, `const RoomCard = () => {}`).
- **Variables & Functions:** Use **camelCase** (e.g., `const fetchRooms = () => {}`, `let isAvailable = true`).
- **Types/Interfaces:** Use **PascalCase** (e.g., `interface RoomProps {}`).
- **Styling:** Use standard Tailwind CSS utility classes. Avoid inline `style={{}}` unless dynamically calculating values.
- **Responsiveness:** Always design mobile-first. Start with base classes and add `sm:`, `md:`, and `lg:` prefixes for larger screens.

---
*If you run into any issues, please reach out in the developer group chat!*
