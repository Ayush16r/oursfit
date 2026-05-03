# OursFit E-Commerce Platform

A minimal, premium, fast, and mobile-first full-stack e-commerce web application for a Gen-Z clothing brand.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion, TypeScript.
- **Backend**: Node.js, Express.js, MongoDB Atlas, JWT Authentication.

## Project Structure
- `/backend`: Node.js API server, Mongoose models, controllers, and routes.
- `/frontend`: Next.js React application with UI components and pages.

## Getting Started

### 1. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Update `.env` file with your `MONGODB_URI` and `JWT_SECRET`.
4. Start the server: `npm run dev` (Runs on port 5000)

### 2. Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Next.js dev server: `npm run dev` (Runs on port 3000)

## Deployment Guide

### Backend (Render / Heroku)
1. Push the `/backend` directory to a GitHub repository.
2. Connect the repository to Render (Web Service).
3. Set Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`).
4. Build Command: `npm install`
5. Start Command: `node server.js`

### Frontend (Vercel)
1. Push the `/frontend` directory to a GitHub repository.
2. Connect to Vercel.
3. Set the Root Directory to `frontend`.
4. Vercel will automatically detect Next.js and apply correct build settings.
5. Add any required frontend environment variables (like `NEXT_PUBLIC_API_URL`).

## Features Implemented
- JWT Authentication (Login/Signup).
- Product listing, filtering, and detailed views.
- Shopping Cart and Checkout Flow.
- Secure Admin Dashboard for managing products and orders.
- Smooth Framer Motion page transitions and micro-animations.
- Fully responsive mobile-first Tailwind design.
