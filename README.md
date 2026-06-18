# UptoSkills AI LMS

AI-powered learning platform where students learn courses from their favorite celebrities. Celebrity faces and voices are replicated via AI, while the actual educational content is delivered by expert AI mentors.

## Features

- **AI Celebrity Mentors** — Choose mentors like Elon Musk, Sundar Pichai, Oprah Winfrey, and more
- **Gamified Leagues** — Earn XP, maintain streaks, climb leaderboards (UptoSkills-style)
- **Course Player** — Immersive AI mentor video player with voice clone indicators
- **Role-based Access** — Student, Instructor, and Admin dashboards
- **Course Approval** — Admin workflow for reviewing new leagues

## Tech Stack

- React 19 + Vite
- React Router 7
- Tailwind CSS
- Axios (API layer)
- Context API (state management)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Demo Login

Use any email/password (6+ chars). Switch role tabs for Student, Instructor, or Admin access.

## Project Structure

```
src/
├── api/                → Axios instances, interceptors, and API endpoints
├── assets/             → Static files
├── components/
│   ├── common/         → Buttons, Inputs, Spinners
│   └── ui/             → Navbar, Sidebar, CourseCard, AIMentorPlayer
├── constants/          → API_URL, REGEX, ACTION_TYPES
├── hooks/              → useAuth, useFetchCourse, useCourseProgress
├── layouts/            → MainLayout, AuthLayout
├── pages/
│   ├── Auth/           → Login, Register
│   ├── Courses/        → List, Details
│   ├── Dashboard/      → Student/Instructor views
│   ├── Admin/          → User management, Course approval
│   └── Mentors/        → Celebrity mentor selection
├── routes/             → AppRouter, PrivateRoute
├── store/              → AuthContext, mock data
├── styles/             → tailwind.css
└── utils/              → formatCurrency, formatDate
```

## Environment

```env
VITE_API_URL=https://api.uptoskills.com
```
