# Pexels Image Generation

[![Vite](https://img.shields.io/badge/Vite-5-purple?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-4-black?style=for-the-badge&logo=express)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

## Overview

Pexels Image Generation is a simple, privacy-friendly app that lets you log in, enter a prompt, and generate AI images. The UI is built with React + Vite and Tailwind, and the backend is a small Express server that proxies image generation to Replicate. JWT is used for basic auth.

Everything runs locally on your machine. Your session token is stored in your browser. The backend only talks to Replicate to generate images, and nothing is persisted beyond an in-memory/SQLite user store for auth.



## Requirements

- Node.js 18+
- A Replicate account and API token

## Quick Start (Local)

1) Install dependencies

```bash
# from project root
pnpm install
cd backend && pnpm install && cd ..
```

2) Configure environment variables

Create a `.env` in `backend/` with:

```bash
# backend/.env
REPLICATE_API_TOKEN=your_replicate_api_token
JWT_SECRET=your_long_random_secret
PORT=3000
```

3) Run backend and frontend

In separate terminals:

```bash
# Terminal A - backend
cd backend
pnpm start
```

```bash
# Terminal B - frontend
pnpm dev
```

Frontend will run on `http://localhost:5173` (Vite default). Backend runs on `http://localhost:3000`.

## Usage

1) Sign up or log in to obtain a JWT stored in `localStorage`.
2) Open the Image Generation form, enter a prompt, choose aspect ratio/format.
3) Click Generate. If Flux is unavailable, the app transparently falls back to Stable Diffusion.
4) Preview the result and click Download to save it.

## Environment Variables

- `REPLICATE_API_TOKEN` (required): Your Replicate API key. Used by the backend to generate images.
- `JWT_SECRET` (required): Secret used to sign JWTs for auth.
- `PORT` (optional): Backend server port. Defaults to 3000.

Ensure these are set in `backend/.env` for local development. This app is intended to run locally; no cloud services are required beyond Replicate for generation.

## Contributing

Contributions are welcome! Please open an issue or submit a PR.
