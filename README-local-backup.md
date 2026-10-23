# SmartSave – Myntra-style store (React + Vite)

## Run
1. Frontend: `npm install` then `npm run dev` (http://localhost:5173)
2. OTP server (new terminal): `cd server && npm install && cp .env.example .env`, then from the project root `npm run server`
   - With no SMTP settings, OTPs print in the server terminal (dev mode). Fill SMTP_* in `server/.env` to email them.
3. Google login: copy `.env.example` to `.env` and set `VITE_GOOGLE_CLIENT_ID`.

## Editing products
Products live in `public/products.json` (no rebuild needed). Each item: id, name, brand, cat, gender (Men/Women/Unisex), price, old, rating, image, sizes.
To use a real database later, replace the `fetch("/products.json")` call in `src/App.jsx` with your API URL.
