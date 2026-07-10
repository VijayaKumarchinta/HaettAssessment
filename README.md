<div align="center">
  <h1>🍱 Haett Partner Portal</h1>
  <p><strong>Full-Stack Partner Management System</strong></p>

  [![Vue 3](https://img.shields.io/badge/Vue_3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
  [![Cloudflare Workers](https://img.shields.io/badge/Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
  [![D1](https://img.shields.io/badge/D1-FF6B35?style=for-the-badge&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
  [![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

  [![Frontend](https://img.shields.io/github/actions/workflow/status/VijayaKumarchinta/HaettAssessment/deploy-frontend.yml?branch=main&style=for-the-badge&logo=github&label=Frontend)](https://github.com/VijayaKumarchinta/HaettAssessment/actions)
  [![API](https://img.shields.io/github/actions/workflow/status/VijayaKumarchinta/HaettAssessment/deploy-worker.yml?branch=main&style=for-the-badge&logo=github&label=API)](https://github.com/VijayaKumarchinta/HaettAssessment/actions)
  [![Frontend](https://img.shields.io/badge/FRONTEND-8A2BE2?style=for-the-badge&logo=cloudflare&logoColor=white)](https://vijayakumarchinta-haett-portal.pages.dev)
  [![API](https://img.shields.io/badge/API-8A2BE2?style=for-the-badge&logo=cloudflare&logoColor=white)](https://haett-assessment-api.vijayakumar-chinta15.workers.dev)

  <p>A self-serve partner ecosystem with application flows, admin dashboard, and automated discount code generation for the Haett health & wellness brand.</p>
  <p><sub>Built for the <strong>Haett Full-Stack Intern Assessment</strong></sub></p>
</div>

<br>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [🔄 Partner Lifecycle](#-partner-lifecycle)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [🔑 Test Credentials](#-test-credentials)
- [📡 API Endpoints](#-api-endpoints)
- [🗄️ Database Schema](#️-database-schema)
- [📸 Screenshots](#-screenshots)
- [📝 License](#-license)

---

## 🌟 Overview

Haett wanted to grow its reach through **brand partners** — influencers, gym owners, affiliates, and corporate collaborators. Instead of manually managing applications and discount codes, this portal provides:

| Feature | Description |
|---------|-------------|
| ✨ **Seamless Application Flow** | Partners sign up and track their application status |
| 👑 **Admin Dashboard** | Review, approve, and manage partners |
| 🎫 **Auto-generated Discount Codes** | Unique codes for approved partners |
| 🔄 **Real-time Code Management** | Activate/deactivate codes on demand |

---

## 🔄 Partner Lifecycle

```
Visitor → Apply Now → Login → Form → Pending → Approved/Rejected
                                                   ↓         ↓
                                              Dashboard   Reapply
                                                             ↓
                                                        New Form
```

| # | State | What the User Sees |
|:-:|-------|-------------------|
| **1** | **Visitor** (not logged in) | Landing page → "Apply Now" opens Login modal |
| **2** | **Applicant** (no app yet) | Validated Application Form |
| **3** | **Pending** (submitted) | "Application Under Review" status card |
| **4** | **Rejected** | Rejection reason + "Reapply Now" button |
| **5** | **Approved Partner** | Dashboard with analytics + discount codes |
| **6** | **Admin** | Review panel + approve/reject + toggle codes |

> **💡 Key Flow:** Clicking "Apply Now" opens the **login modal**, not the form directly. After login, the view adapts based on application status.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vue 3 + Vite + Pinia + Vue Router | Modern SPA |
| **Backend** | Cloudflare Workers (JS) | Serverless API |
| **Database** | D1 (SQLite on Cloudflare) | Free tier forever |
| **Auth** | JWT (HMAC-SHA256 via Web Crypto) | Secure authentication |
| **CI/CD** | GitHub Actions → Cloudflare | Auto-deploy on push |

---

## 🚀 Quick Start

<details>
<summary><strong>Click to expand setup instructions</strong></summary>

### Prerequisites

- Node.js 18+
- npm

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

### Worker API (Local)

```bash
cd worker
npm install
npx wrangler dev
```

### Environment

Create `frontend/.env`:
```
VITE_API_URL=https://haett-assessment-api.vijayakumar-chinta15.workers.dev
```

</details>

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@haett.com` | `Admin@123` |
| **User** | `user@haett.com` | `User@123` |

---

## 📡 API Endpoints

<details>
<summary><strong>Authentication</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login (returns JWT) |
| GET | `/auth/me` | Get current user |
</details>

<details>
<summary><strong>Partner</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| POST | `/partner/apply` | Submit application |
| GET | `/partner/application` | Get my application |
| GET | `/partner/codes` | Get my discount codes |
| POST | `/partner/reapply` | Resubmit rejected app |
</details>

<details>
<summary><strong>Admin</strong></summary>

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/applications` | List applications (filter + search) |
| POST | `/admin/applications/{id}/approve` | Approve + auto-create code |
| POST | `/admin/applications/{id}/reject` | Reject with reason |
| POST | `/admin/codes/{id}/activate` | Activate discount code |
| POST | `/admin/codes/{id}/deactivate` | Deactivate discount code |
| GET | `/admin/summary` | Application counts by status |
</details>

---

## 🗄️ Database Schema

<details>
<summary><strong>Click to view schema</strong></summary>

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK |
| name | VARCHAR | |
| email | VARCHAR | UNIQUE |
| password_hash | VARCHAR | PBKDF2 |
| role | VARCHAR | `ADMIN` or `USER` |

### `partner_applications`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK |
| user_id | INTEGER | FK → users |
| status | VARCHAR | PENDING/APPROVED/REJECTED |
| partner_type | VARCHAR | AFFILIATE/INFLUENCER/GYM/CORPORATE |

### `discount_codes`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PK |
| application_id | INTEGER | FK → applications |
| code | VARCHAR | UNIQUE, auto-generated |
| is_active | BOOLEAN | Toggle on/off |
</details>

---

## 📸 Screenshots

| View | Preview |
|------|---------|
| **Landing Page** | <img src="screenshots/01-visitor-landing.png" width="400" alt="Landing Page"> |
| **Login Modal** | <img src="screenshots/02-login-modal.png" width="400" alt="Login Modal"> |
| **Application Form** | <img src="screenshots/03-application-form.png" width="400" alt="Application Form"> |
| **Pending Review** | <img src="screenshots/04-pending-review.png" width="400" alt="Pending Review"> |
| **Admin Panel** | <img src="screenshots/05-admin-panel.png" width="400" alt="Admin Panel"> |
| **Rejected View** | <img src="screenshots/06-rejected.png" width="400" alt="Rejected"> |
| **Partner Dashboard** | <img src="screenshots/07-approved-dashboard.png" width="400" alt="Partner Dashboard"> |

---

## 📝 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <sub>
    Built by <a href="https://github.com/VijayaKumarchinta">Vijaya Kumar Chinta</a>
    <br>
    🏠 <a href="https://github.com/VijayaKumarchinta/portfolio">View my complete portfolio</a>
  </sub>
</div>
