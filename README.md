# UptoSkills AI LMS — Fullstack Industry-Grade Platform

An AI-powered Learning Management System (LMS) where students learn courses from **AI Celebrity Mentors** (Elon Musk, Sundar Pichai, Oprah Winfrey, Jensen Huang, Virat Kohli, Shah Rukh Khan, Satya Nadella, Ada Lovelace, Mark Zuckerberg, and Indra Nooyi). The mentors feature authentic celebrity speech synthesis, interactive doubt resolution in persona, and gamified XP leagues.

---

## 🌟 Key Features

1. **AI Celebrity Mentors & Voice Synthesis**:
   - 10 distinct celebrity personas with customized prompt engineering, philosophical viewpoints, and technical expertise.
   - Real-time speech synthesis with celebrity voice pitch, speech rate, and vocal cadence modulation.
   - Interactive doubt solver (*Ask Mentor Live*) with in-character responses.
   - Lip-sync viseme generator and reactive waveform animation.

2. **Gamified Leagues & XP System**:
   - League-based learning (Python Sprint, Startup League, ML League, Frontend League, Cloud League, etc.).
   - Earn XP, maintain daily streaks, and climb global leaderboards.
   - Automated certificate issuance upon 100% course completion with unique verification codes.

3. **Complete Industry-Ready Backend**:
   - **Framework**: Node.js & Express (ESM).
   - **Database**: Real MongoDB via Mongoose ODM with ObjectId references, compound indexes, and fail-fast connection verification.
   - **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing and Role-Based Access Control (Student, Instructor, Admin).
   - **AI Engine**: Google Gemini API integration with intelligent local persona fallback.

---

## 🛠 Tech Stack

### Frontend
- **React 19** + **Vite 6**
- **React Router 7**
- **Tailwind CSS** + Custom Design System
- **Lucide React** (icons)
- **Sonner** (notifications)
- **Web Speech API** (real-time voice synthesis)

### Backend & AI
- **Node.js** (v20+) + **Express.js** (ESM)
- **MongoDB** + **Mongoose ODM 8**
- **Google Generative AI SDK** (`@google/generative-ai`)
- **JWT** (`jsonwebtoken`) + **Bcrypt** (`bcryptjs`)
- **CORS**, **Helmet**, **Morgan**, **Express Rate Limit**, **Zod**

---

## 🗄 Database Architecture & Mongoose Models

The backend utilizes real MongoDB via Mongoose schemas with fail-fast initialization:

- **Config via `MONGO_URI`**: Fails fast with clear diagnostics if the database connection cannot be established; no silent fallback to temporary stores.
- **Indexes**:
  - `User.email`: Unique index (`{ unique: true }`).
  - `Enrollment`: Unique compound index on `{ userId: 1, courseId: 1 }` to prevent duplicate course enrollments.
  - `LessonProgress`: Unique compound index on `{ userId: 1, courseId: 1, lessonId: 1 }`.
  - `Certificate`: Unique index on `verificationCode`.
  - `Quiz`: Unique compound index on `{ leagueId: 1, partId: 1 }`.
  - `Review`: Unique compound index on `{ courseId: 1, userId: 1 }`.
- **Mongoose Models (`server/models/`)**:
  - `User`: Accounts, role-based access, profiles, XP, and streaks.
  - `Mentor`: AI celebrity mentor configurations, vocal profiles, and persona prompts.
  - `Course`: League courses, metadata, tags, and syllabus.
  - `Module`: Course curriculum sections.
  - `Lesson`: Structured lesson units with scripts, durations, and video links.
  - `Enrollment`: Student-to-course enrollments with completion tracking.
  - `LessonProgress`: Granular lesson-level progression.
  - `Quiz`: League mastery check assessments.
  - `QuizAttempt`: Student quiz submissions, scoring, and XP awards.
  - `Certificate`: Tamper-proof course graduation credentials with verification codes.
  - `ForumPost`: Community technical discussion threads.
  - `ForumComment`: Replies and discussion comments.
  - `Review`: Star ratings and course feedback.
  - `Notification`: In-app alerts, milestones, and announcements.
  - `ChallengeSubmission`: Daily coding challenge answers and test results.
  - `DailyChallenge`: Interactive problem challenges with unit tests.
  - `InstructorApplication`: Student applications for instructor role privileges.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB (v6.0+) running locally or via Docker

### 2. Environment Configuration

Copy the example environment files:
```bash
cp .env.example .env
cp server/.env.example server/.env
```

Ensure `MONGO_URI` is set in `server/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/uptoskills
```

### 3. Installation

Install frontend and backend dependencies:
```bash
npm install
cd server && npm install && cd ..
```

### 4. Database Seeding

Run the idempotent database seed script:
```bash
npm run seed
```
*(Can also be run via `cd server && npm run seed`)*

### 5. Running the Project

**Option A: Local Development in Two Terminals**

Terminal 1 (Backend Server on Port 5001):
```bash
npm run server
```

Terminal 2 (Frontend on Port 5173):
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker Deployment (`docker-compose`)

Run the full stack (MongoDB + Backend + Client) with a single command:

```bash
docker-compose up --build
```

Services started:
- **`mongo`**: Official MongoDB 7.0 container on port `27017`.
- **`server`**: Node.js Express ESM backend container on port `5001`.
- **`client`**: Production-optimized Nginx container serving React 19 on port `5173`.

To stop services:
```bash
docker-compose down
```

---

## 🧪 Testing

Run the automated test suite covering security hardening, authentication, Mongoose indexes, fail-fast DB connections, and idempotent seeding:

```bash
npm test
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Code (Admin) |
|------|-------|----------|---------------------|
| **Student** | `shailesh@uptoskills.com` | `student123` | N/A |
| **Admin** | `admin@uptoskills.com` | `admin123` | `123456` |
| **Instructor** | `priya.mentor@uptoskills.com` | `mentor123` | N/A |

---

## 📡 API Endpoints Specification

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new student account
- `POST /api/auth/login` — Sign in and receive JWT token
- `POST /api/auth/refresh` — Refresh access token via httpOnly cookie
- `POST /api/auth/logout` — Revoke session cookie
- `GET /api/auth/me` — Get authenticated user profile
- `PATCH /api/auth/profile` — Update user bio, preferences, skills
- `POST /api/auth/forgot-password` — Request 6-digit cryptographic reset OTP
- `POST /api/auth/verify-otp` — Verify single-use reset OTP
- `POST /api/auth/reset-password` — Set new password with verified OTP
- `POST /api/auth/apply-instructor` — Submit application to become an instructor

### Courses & Leagues (`/api/courses`)
- `GET /api/courses` — List all courses (supports `?tag=`, `?level=`, `?search=`, `?status=`)
- `GET /api/courses/:id` — Get course details, syllabus, and mentor metadata
- `POST /api/courses/:id/enroll` — Enroll user in league
- `PATCH /api/courses/:id/progress` — Update lesson completion and award XP
- `POST /api/courses` — Create new course (Instructors/Admins)

### AI Celebrity Engine (`/api/ai`)
- `POST /api/ai/chat` — Ask doubt to celebrity mentor (returns reply + visemes + voice config)
- `POST /api/ai/generate-lecture` — Dynamically generate an educational module
- `POST /api/ai/evaluate-code` — AI code analyzer for programming leagues
- `GET /api/ai/voice-profile/:mentorId` — Get mentor's pitch, rate, and voice configuration
- `GET /api/ai/avatar-config/:mentorId` — Get mentor avatar animation configuration
- `POST /api/ai/synthesize-audio` — Text-to-speech audio synthesis

### Admin & Analytics (`/api/admin`)
- `GET /api/admin/users` — List and manage all registered users
- `POST /api/admin/users/invite` — Invite new platform users
- `PATCH /api/admin/users/:id` — Update user status/role
- `DELETE /api/admin/users/:id` — Delete user account
- `PATCH /api/admin/courses/:id/approve` — Approve submitted courses
- `PATCH /api/admin/courses/:id/reject` — Reject submitted courses
- `GET /api/admin/analytics` — Platform KPI statistics and system health
- `GET /api/admin/instructor-applications` — Review pending instructor applications
- `PATCH /api/admin/instructor-applications/:id/approve` — Approve instructor application
- `PATCH /api/admin/instructor-applications/:id/reject` — Reject instructor application

### Forum & Certificates (`/api/forum`, `/api/certificates`)
- `GET /api/forum` — Community discussions
- `POST /api/forum` — Create new topic
- `POST /api/forum/:id/comments` — Reply to topic
- `PATCH /api/forum/:id/upvote` — Upvote discussion
- `GET /api/certificates` — Get user certificates
- `GET /api/certificates/verify/:code` — Public certificate verification

---

## 🧠 System Architecture

```
[React 19 Frontend Client (Port 5173)]
        │
        │ HTTP / REST / Bearer JWT
        ▼
[Node.js + Express API Gateway (Port 5001)]
   ├── Auth Middleware (JWT & RBAC)
   ├── Rate Limiter & Helmet Security Headers
   │
   ├── AI Celebrity Mentor Service
   │     ├── Google Gemini 1.5 LLM
   │     ├── Persona Prompt Engineering (Elon, Sundar, Oprah, Jensen, Virat...)
   │     ├── Voice Synthesis Configuration (Pitch, Rate, SSML)
   │     └── Avatar Lip-Sync Viseme Timeline Generator
   │
   └── Data Access Layer (MongoDB via Mongoose ODM)
         ├── Schemas: User, Mentor, Course, Lesson, Module, Enrollment,
         │            LessonProgress, Quiz, QuizAttempt, Certificate,
         │            ForumPost, ForumComment, Review, Notification,
         │            ChallengeSubmission, DailyChallenge, InstructorApplication
         └── Fail-Fast Connection Verification (MONGO_URI)
```
