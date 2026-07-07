# 🍱 Haett Partner Portal

A full-stack partner management system for **Haett** — a health & wellness brand.  
Built as part of the **Haett Full-Stack Intern Assessment**.

> **📍 Live:** Frontend: [haett-assessment.pages.dev](https://haett-assessment.pages.dev) • API: [haett-assessment-api.vijayakumar-chinta15.workers.dev](https://haett-assessment-api.vijayakumar-chinta15.workers.dev)

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/VijayaKumarchinta/HaettAssessment/deploy-frontend.yml?branch=main&logo=github&label=Frontend" alt="Frontend Deploy" />
  <img src="https://img.shields.io/github/actions/workflow/status/VijayaKumarchinta/HaettAssessment/deploy-worker.yml?branch=main&logo=github&label=API" alt="API Deploy" />
  <img src="https://img.shields.io/badge/Vue_3-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white" alt="Workers" />
  <img src="https://img.shields.io/badge/D1-FF6B35?logo=cloudflare&logoColor=white" alt="D1" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
</p>

---

## 🌟 Why This App?

Haett wants to grow its reach through **brand partners** — influencers, gym owners, affiliates, and corporate collaborators. Instead of manually managing applications and discount codes, this portal provides:

- **A seamless application flow** for potential partners to sign up
- **An admin dashboard** to review, approve, and manage partners
- **Automatic discount code generation** for approved partners
- **Real-time code activation/deactivation** to control campaigns

The result: a self-serve partner ecosystem that scales.

---

## 🧩 The 6 Partner Lifecycle States

```
Visitor → Apply Now → Login → Application Form → Pending → Approved/Rejected
                                                              ↓         ↓
                                                         Dashboard   Reapply
                                                                        ↓
                                                                   Form again
```

| # | State | What the user sees |
|---|---|---|
| **1** | **Visitor** (not logged in) | Landing page explaining the partner programme. Clicking **"Apply Now"** opens the **Login modal** — users must authenticate first. |
| **2** | **Applicant** (no application yet) | A validated **Application Form** with partner type selector, business info, phone, website, audience size, and description. |
| **3** | **Pending** (submitted) | Status card — **"Application Under Review"** with the submission date. No action needed. |
| **4** | **Rejected** | Rejection reason from the admin + **"Reapply Now"** button. Clicking it shows the Application Form again for a fresh submission. |
| **5** | **Approved Partner** | Profile card with business name + **Partner Dashboard** showing analytics stats and discount codes with **Copy** buttons. |
| **6** | **Admin** | Full review panel — summary stats, search/filter, approve/reject applications, toggle discount codes on/off. |

> **💡 Key flow:** Clicking "Apply Now" on the landing page opens the **login modal**, not the application form directly. After logging in, the app shows different views depending on the user's current application status (none → form, pending → waiting card, rejected → rejection + reapply, approved → dashboard).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vue 3 + Vite + Pinia + Vue Router |
| **Backend** | FastAPI (Python) + SQLAlchemy + JWT Auth |
| **Database** | PostgreSQL |
| **Styling** | CSS custom properties, glassmorphism cards |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL 16+
- pip / npm

### 1. Database Setup

Create a PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE haett_db;"
```

### 2. Backend Setup

```bash
cd backend

# Create environment file
echo 'DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/haett_db' > .env
echo 'SECRET_KEY=your-secret-key-change-in-production' >> .env
echo 'ALGORITHM=HS256' >> .env
echo 'ACCESS_TOKEN_EXPIRE_MINUTES=1440' >> .env

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed test users
python seed.py

# Start backend
uvicorn app.main:app --reload
```

Backend runs at **http://127.0.0.1:8000**  
API docs at **http://127.0.0.1:8000/docs**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## 🔑 Test Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@haett.com` | `Admin@123` |
| **User** | `user@haett.com` | `User@123` |

---

## 📡 API Endpoints

### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Login (returns JWT) |
| GET | `/auth/me` | Get current user |

### Partner
| Method | Path | Description |
|---|---|---|
| POST | `/partner/apply` | Submit partner application |
| GET | `/partner/application` | Get my application |
| GET | `/partner/codes` | Get my discount codes |
| POST | `/partner/reapply` | Resubmit rejected application |

### Admin
| Method | Path | Description |
|---|---|---|
| GET | `/admin/applications?status=&search=` | List applications (filter + search) |
| GET | `/admin/applications/{id}/codes` | Get codes for an application |
| POST | `/admin/applications/{id}/approve` | Approve application (auto-creates code) |
| POST | `/admin/applications/{id}/reject` | Reject application with reason |
| POST | `/admin/codes/{id}/activate` | Activate a discount code |
| POST | `/admin/codes/{id}/deactivate` | Deactivate a discount code |
| GET | `/admin/summary` | Application counts by status |

---

## 🗄️ Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | PK |
| name | VARCHAR(255) | |
| email | VARCHAR(255) | UNIQUE |
| password_hash | VARCHAR(255) | bcrypt |
| role | VARCHAR(20) | `ADMIN` or `USER` |
| created_at | TIMESTAMP | |

### `partner_applications`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | PK |
| user_id | INTEGER | FK → users |
| partner_type | VARCHAR(50) | AFFILIATE, INFLUENCER, GYM, CORPORATE, PARTNER_ASSOCIATE |
| business_name | VARCHAR(255) | |
| phone, website | VARCHAR | Optional |
| audience_size | INTEGER | Optional |
| description | TEXT | Optional, max 500 chars |
| status | VARCHAR(20) | PENDING, APPROVED, REJECTED |
| rejection_reason | TEXT | Set on reject |
| applied_at | TIMESTAMP | Auto-set |
| approved_at | TIMESTAMP | Set on approve |

### `discount_codes`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | PK |
| application_id | INTEGER | FK → partner_applications |
| code | VARCHAR(100) | UNIQUE, auto-generated |
| discount_type | VARCHAR(20) | PERCENTAGE or FLAT |
| discount_value | FLOAT | |
| is_active | BOOLEAN | Toggle on/off |
| usage_count | INTEGER | |
| total_discount_given | FLOAT | |
| expiry_date | TIMESTAMP | Optional |
| created_at | TIMESTAMP | Auto-set |

---

## 📸 Screenshots

All 6 partner lifecycle states captured from the live application:

### 1. Visitor — Landing Page
<img src="screenshots/01-visitor-landing.png" alt="Landing Page" width="700" />

The landing page introduces the Haett Partner Program with hero section and feature cards. Clicking **"Apply Now"** opens the login modal.

### 2. Login Modal
<img src="screenshots/02-login-modal.png" alt="Login Modal" width="700" />

Users sign in with their email and password. After login, the correct view is shown based on the user's application status.

### 3. Applicant — Application Form
<img src="screenshots/03-application-form.png" alt="Application Form" width="700" />

A validated form with partner type selection, business details, audience info, and description. Only shown to users without an existing application (or rejected users who clicked "Reapply Now").

### 4. Pending — Under Review
<img src="screenshots/04-pending-review.png" alt="Pending Review" width="700" />

After submission, the applicant sees this status card with their submission date. No action needed — they wait for admin review.

### 5. Admin — Review Panel
<img src="screenshots/05-admin-panel.png" alt="Admin Panel" width="700" />

Admins can view summary stats, search/filter applications, approve or reject with a reason, and toggle discount codes on/off.

### 6. Rejected — Rejection View
<img src="screenshots/06-rejected.png" alt="Rejected View" width="700" />

Rejected applicants see the reason provided by the admin. They can click **"Reapply Now"** to fill a fresh application form.

### 7. Approved — Partner Dashboard
<img src="screenshots/07-approved-dashboard.png" alt="Partner Dashboard" width="700" />

Approved partners get a profile card, analytics stats (total codes, uses, discount), and a table of discount codes they can copy with one click.

---

<div align="center">
  <sub>Built with ❤️ for the Haett Partner Portal</sub>
  <br><br>
  <sub>🏠 <a href="https://github.com/VijayaKumarchinta/portfolio">View my complete portfolio</a></sub>
</div>

---

## 👨‍💻 Author

**Vijay Kumar Chinta**  
B.Tech – Data Science & Big Data Analytics  
KL University
