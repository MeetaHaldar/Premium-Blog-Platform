# Premium Blog Platform

A full-stack blog platform with premium content, OTP auth, and Razorpay payments.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, React Hook Form, Zod, TipTap
- **Backend**: Node.js, Express, TypeScript, MongoDB/Mongoose, JWT, Nodemailer, Razorpay

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your credentials in .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your credentials in .env.local
npm run dev
```

Visit `http://localhost:3000`

## Features

- OTP email verification on registration
- JWT auth with HTTP-only cookies
- Rich text blog editor (TipTap)
- Premium blogs with Razorpay payment
- Like/unlike blogs
- Admin role support
- Responsive design

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/verify-otp | Verify email OTP |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/forgot-password | Send reset link |
| POST | /api/auth/reset-password | Reset password |
| GET | /api/blogs | List published blogs |
| GET | /api/blogs/my-blogs | My blogs (auth) |
| GET | /api/blogs/:slug | Single blog |
| POST | /api/blogs | Create blog (auth) |
| PUT | /api/blogs/:id | Update blog (auth) |
| DELETE | /api/blogs/:id | Delete blog (auth) |
| POST | /api/blogs/:id/like | Toggle like (auth) |
| POST | /api/payments/create-order | Create Razorpay order |
| POST | /api/payments/verify | Verify payment |
| GET | /api/payments/history | Payment history |

## Environment Variables

See `backend/.env.example` and `frontend/.env.example`.
