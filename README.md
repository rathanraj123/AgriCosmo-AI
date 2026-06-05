[README.md](https://github.com/user-attachments/files/28631746/README.md)
<div align="center">
  <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Seedling/3D/seedling_3d.png" width="100" alt="AgriCosmo Logo"/>
  
  # 🌱 AgriCosmo-Vision 🔬
  
  **An AI-Driven Framework for Plant Pathology, Pharmacognosy, and Cosmetology Discovery.**
  
  *Transforming agricultural loss into pharmaceutical and cosmetological revenue.*

  <p align="center">
    <a href="#-about-the-project">About</a> •
    <a href="#-core-features">Features</a> •
    <a href="#%EF%B8%8F-system-architecture">Architecture</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-project-roadmap">Roadmap</a>
  </p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]()
  [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
  [![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)]()
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)]()
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)]()
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()
</div>

<br/>

## 📖 About The Project

Every year, farmers experience devastating financial losses due to unidentified crop diseases. Simultaneously, the pharmaceutical and cosmetic industries spend billions searching for novel natural compounds. 

**AgriCosmo-Vision** is a robust, full-stack platform designed to bridge this gap. By utilizing a decoupled API architecture and predictive cheminformatics, the platform identifies plant diseases and immediately maps the biological stress-response (Systemic Acquired Resistance) to high-value secondary metabolites.

Instead of burning diseased crops, farmers can now classify their bio-waste into profitable categories such as **Alkaloids** (pain management), **Flavonoids** (anti-inflammatory), and **Lycopene** (cosmetics).

---

## ✨ Core Features

- **📸 Instant Pathology Diagnostics:** Rapid visual diagnosis via a sleek, drag-and-drop React interface.
- **⚕️ Treatment Generation:** Step-by-step agricultural remediation guides tailored to the specific pathogen.
- **🧬 Pharmacognosy Engine:** Predictive drug classification (identifying Alkaloids, Terpenoids, etc.) based on the plant's metabolic stress response.
- **💄 Cosmetology Insights:** Discovery of valuable aesthetic compounds for the beauty industry.
- **📊 Global Dashboard:** A responsive, data-rich history tracker powered by TanStack Query and PostgreSQL JSONB indexing.

---

## 🏗️ System Architecture

Built on a modern **Modular Monolith** architecture utilizing `pnpm` workspaces. This guarantees end-to-end type safety between the client and server without relying on heavy build steps or external compilers.

### 💻 The Tech Stack
| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | React 19, Vite, Wouter | Ultra-fast rendering, minimal bundle size (wouter), and instantaneous HMR (Vite). |
| **UI Design** | TailwindCSS, Shadcn UI | Accessible, unstyled primitives allowing 100% design ownership without library bloat. |
| **State Mgt** | TanStack React Query | Eliminates Redux boilerplate; manages server-state caching and loading UI automatically. |
| **Backend** | Node.js, Express 5.0 | High-concurrency API Gateway optimized for asynchronous I/O routing. |
| **Validation** | Zod | Strictly enforces boundary payloads, shared directly from a monorepo workspace package. |
| **Database** | PostgreSQL, Drizzle ORM | High-performance SQL building combined with `JSONB` for unstructured Pharmacognosy arrays. |

### 🧠 A Note on AI & Decoupling
To ensure synchronous development across UI, Database, and API teams, the AI inference engine is currently implemented as a stochastic architectural mock. This strategic **Decoupled Architecture** finalized the API contract first. In production, this mock is cleanly swapped for an external gRPC/HTTP call to a dedicated Python GPU microservice running a CNN (e.g., ResNet50), requiring zero rewrites to the core TypeScript gateway.

---

## 🚀 Quick Start

Follow these steps to get the project running locally.

### Prerequisites
- Node.js (v18+)
- PNPM (`npm install -g pnpm`)
- PostgreSQL database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/AgriCosmo-Vision.git
   cd AgriCosmo-Vision
   ```

2. **Install Workspace Dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in `artifacts/api-server/` with your database credentials:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/agricosmo_db
   ```

4. **Initialize Database:**
   ```bash
   # Push Drizzle schema to your PostgreSQL database
   cd artifacts/api-server
   pnpm run db:push
   ```

5. **Start Development Servers:**
   ```bash
   # From the root workspace, starts both Vite and Express concurrently
   pnpm run dev
   ```

---

## 🛣️ Project Roadmap

- [x] **Phase 1:** Core Monorepo Setup & End-to-End Type Safety (`Zod`).
- [x] **Phase 2:** Database Design (`PostgreSQL` JSONB architecture).
- [x] **Phase 3:** MVP API Integration & AI Mock implementation.
- [ ] **Phase 4:** Cloud Migration: Direct-to-S3 Pre-signed URLs to protect the Node event loop.
- [ ] **Phase 5:** Security: JWT Authentication integration via Supabase/Clerk.
- [ ] **Phase 6:** Python GPU Worker: Integration of real CNN inference model.

---
<div align="center">
  <i>Bridging the gap between Agriculture, Pharmacology, and Software Engineering.</i>
</div>
