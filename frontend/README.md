# Haett Partner Management System

## Overview

This project was developed as part of the Haett Full-Stack Intern Assessment.

The application enables influencers, gyms, affiliates, and businesses to apply for the Haett Partner Program. Administrators can review applications, approve or reject applicants, and automatically generate discount codes for approved partners.

---

## Technology Stack

### Frontend

* Vue 3
* Vite
* Pinia
* Axios

### Backend

* FastAPI
* SQLAlchemy
* JWT Authentication

### Database

* PostgreSQL

---

## Features

### Visitor View

* Landing page introducing the Haett Partner Program
* Login call-to-action

### User View

* Partner application form
* Required validation
* Pending review status
* Reapply after rejection

### Approved Partner Dashboard

* View assigned discount codes
* Copy discount codes
* View code status

### Admin Dashboard

* Review applications
* Approve applications
* Reject applications with reason
* View application statistics
* Toggle discount code status

---

## Project Setup

### Backend

```bash
cd backend

pip install -r requirements.txt

alembic upgrade head

python seed.py

uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Test Credentials

### Admin

```text
Email: admin@haett.com
Password: Admin@123
```

### User

```text
Email: user@haett.com
Password: User@123
```

---

## Application Flow

Visitor
→ Login

User
→ Submit Partner Application

Application
→ Pending Review

Admin
→ Approve / Reject

Approved User
→ Partner Dashboard

Rejected User
→ Reapply

---

## Database

### Tables

* users
* partner_applications
* discount_codes

---

## Author

Vijay Kumar Chinta
B.Tech – Data Science & Big Data Analytics
KL University
