# Storix Frontend

Next.js frontend for a Google Drive-style cloud storage app.

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Auth

The frontend uses session-based authentication. Axios is configured with `withCredentials: true`, so browser cookies are sent to the backend automatically.

Implemented auth calls:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/google`

Google auth uses `@react-oauth/google` with the auth-code flow. The frontend sends `{ code }` to the backend, and the backend should create the user session cookie.

See [AUTH_SETUP.md](./AUTH_SETUP.md) for the full auth setup.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
