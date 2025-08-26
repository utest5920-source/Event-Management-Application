# Event Management App

Full-stack web app with OTP login (no third-party), Admin and User roles.

## Tech
- Frontend: React (Vite)
- Backend: Node.js (Express) + SQLite (better-sqlite3)

## Run locally

1) Backend
```
cd server
cp .env .env.local 2>/dev/null || true
npm run dev
```
Server runs on http://localhost:4000

2) Frontend
```
cd client
npm run dev
```
Open the printed local URL (usually http://localhost:5173)

## OTP Flow (Demo)
- Enter mobile number (no SMS is sent). The server generates a 6-digit OTP and returns it in the API response for demo purposes. Enter the OTP to verify.
- After verification, a JWT is issued and used for authenticated requests.

## Roles
- Default users register as `USER`.
- To create an admin quickly, you can update the `users` table:
```
sqlite3 server/src/data.sqlite "update users set role='ADMIN' where mobile='<your-mobile>';"
```

## API
- Auth: `POST /auth/request-otp`, `POST /auth/verify-otp`, `GET /auth/me`, `PUT /auth/me/profile`
- Public: `GET /events`, `GET /events/:id`
- User: `POST /events/bookings`, `GET /bookings`
- Admin: `POST /admin/events`, `PUT /admin/events/:id`, `DELETE /admin/events/:id`, `POST /admin/events/:id/photos`, `GET /admin/bookings`, `PUT /admin/bookings/:id/status`

## Security Notes
- OTP stored hashed with SHA-256 and 5-minute expiry; attempts limited.
- JWT secret via `.env` (`JWT_SECRET`).
- Image uploads stored under `server/src/uploads`. Files validated for image MIME.

## License
MIT