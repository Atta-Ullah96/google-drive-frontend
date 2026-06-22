# Storix Frontend

Storix is a Google Drive-style cloud storage application. This repository contains the Next.js frontend for authentication, file and folder management, direct-to-S3 uploads, file previews and downloads, storage quota visibility, administration, and pricing.

The frontend is designed to work with the separate Storix Express backend. Authentication is session-based: the backend owns the session cookie and the browser sends it automatically with API requests.

## Features

- Email/password registration and login
- Google OAuth authorization-code flow
- Cookie-based sessions with no tokens in `localStorage`
- File and folder grid/list views
- Nested folder navigation with breadcrumbs
- Create, rename, and delete folders
- Direct browser-to-S3 uploads using presigned URLs
- Multi-file upload progress and drag-and-drop uploads
- Rename, delete, download, and preview files
- Image, PDF, video, audio, text, and JSON preview support
- Storage usage and quota display
- Responsive admin console with role protection
- Admin user, file, activity, storage, health, and settings pages
- Public pricing page with Free, Pro, and Business plans

## Technology

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| HTTP client | Axios |
| Google authentication | `@react-oauth/google` |
| Authentication | Backend-managed session cookie |
| File storage | AWS S3/CloudFront through backend-generated URLs |

## Requirements

- Node.js 20 or newer
- npm
- Storix backend running locally or deployed
- MongoDB, Redis, AWS, and Google OAuth configured in the backend as needed

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

`NEXT_PUBLIC_API_URL` must contain only the backend origin. Do not append `/api/v1` or `/api/admin`.

3. Start the frontend:

```bash
npm run dev -- --port 3001
```

4. Open [http://localhost:3001](http://localhost:3001).

The frontend port must match the backend CORS `FRONTEND_URL`. Next.js uses port `3000` by default, so either run the command above or update the backend origin consistently.

## Commands

```bash
npm run dev       # Start the development server
npm run build     # Create and validate a production build
npm run start     # Run the production build
npm run lint      # Run ESLint
```

Run `npm run build` before opening a pull request because it validates App Router pages and server/client component boundaries.

## Application Routes

### User-facing routes

| Route | Purpose |
| --- | --- |
| `/` | Main Drive workspace |
| `/auth/login` | Email/password and Google login |
| `/auth/signup` | Account registration |
| `/pricing` | Public pricing and plan comparison |

### Admin routes

| Route | Purpose |
| --- | --- |
| `/admin` | Platform overview |
| `/admin/users` | User search, filters, status, and deletion |
| `/admin/users/[id]` | User details, role, status, and storage quota |
| `/admin/storage` | Platform storage analytics |
| `/admin/files` | Platform file management |
| `/admin/activity` | Activity and audit logs |
| `/admin/health` | Backend service and process health |
| `/admin/settings` | Global storage, upload, and availability settings |

`components/admin/admin-guard.jsx` checks the current session and only renders admin routes when the user has `role: "admin"`. The backend also protects every admin API route. Frontend guards improve UX but are not a security boundary.

## Project Structure

```text
app/
  admin/                  Admin App Router pages and layout
  auth/                   Login and signup routes
  pricing/                Public pricing route
  layout.js               Root layout, header, and Google provider
  page.js                 Drive workspace entry point

components/
  admin/                  Admin shell, guard, UI primitives, and pages
  drive/                  Drive files, folders, upload, toolbar, and modals
  header/                 Global navigation and session-aware account menu
  home/                   Main Drive state and workflow orchestration
  pricing/                Pricing cards, comparison table, FAQ, and CTA
  providers/              Google OAuth provider

lib/
  admin/                  Admin response normalization utilities
  api/                    Axios clients and API helper modules

utils/
  drive/                  File/folder response normalization and formatting

public/                    Static assets
```

## API Architecture

### Standard API client

`lib/api/api.jsx` creates the shared Axios instance for normal user APIs:

```text
${NEXT_PUBLIC_API_URL}/api/v1/
```

It sets:

```js
withCredentials: true
```

This is required for the browser to send and receive the backend session cookie.

### Admin API client

`lib/api/admin.jsx` uses a separate Axios instance because admin routes are mounted at:

```text
${NEXT_PUBLIC_API_URL}/api/admin/
```

Do not call admin routes through the `/api/v1` client.

### API modules

| File | Responsibility |
| --- | --- |
| `lib/api/auth.jsx` | Register, login, logout, current user, Google OAuth |
| `lib/api/folderapi.jsx` | Create, list, rename, and delete folders |
| `lib/api/file.jsx` | Upload workflow, list, rename, preview, download, delete |
| `lib/api/user.jsx` | Current user's storage usage and quota |
| `lib/api/admin.jsx` | All admin APIs and mutations |

Response normalization belongs in `utils/drive/` or `lib/admin/adminData.js`, not inside presentation components. This keeps components stable when backend payloads contain MongoDB `_id` values, populated references, or nested `data` objects.

## Authentication

Storix uses backend-managed sessions.

- Tokens are not stored in `localStorage` or `sessionStorage`.
- The frontend does not create an `Authorization` header.
- The backend sets an `httpOnly` session cookie after login.
- Axios sends the cookie using `withCredentials: true`.
- The header calls `GET /api/v1/auth/me` to determine the current user.
- Login/logout dispatch an `auth-change` browser event so the header refreshes immediately.

Main auth endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/google
```

Registration redirects to `/auth/login`. Successful login redirects to `/`.

See [AUTH_SETUP.md](./AUTH_SETUP.md) for Google OAuth and cookie configuration details.

## File Upload Flow

Storix uploads files directly from the browser to S3 so the backend does not proxy large file bodies.

1. The user selects or drops a file.
2. The frontend sends file metadata to `POST /api/v1/file/request-upload`.
3. The backend validates quota and returns a file ID and presigned S3 URL.
4. `uploadToS3()` sends the file to S3 with `XMLHttpRequest`.
5. `XMLHttpRequest.upload.onprogress` updates the progress UI.
6. The frontend calls `POST /api/v1/file/complete-upload`.
7. The backend confirms the object and updates file/storage records.
8. The frontend refreshes the file list and storage information.

Do not send the session cookie or an authorization header to the presigned S3 URL. Only the file and its matching `Content-Type` are sent.

## Folder Navigation

The main Drive page stores the current location as a `folderPath` array. The final entry is the active folder. Folder listing and file listing requests use that folder's ID.

Creating a folder sends the current folder ID as its parent. Opening a folder appends it to the breadcrumb path. Selecting an earlier breadcrumb removes deeper entries and reloads that location.

## File Preview and Download

The frontend requests a temporary preview URL from:

```text
GET /api/v1/file/:id/preview
```

`PreviewModal.jsx` chooses the renderer using the MIME type:

- Images: `<img>`
- PDF/text/JSON: `<iframe>`
- Video: `<video>`
- Audio: `<audio>`
- Unsupported types: open-file fallback

Downloads use the backend download endpoint, which may redirect to a signed S3/CloudFront URL.

## Admin Console

The admin console uses live backend data rather than mock data.

Important behavior:

- Server-side pagination, search, filtering, and sorting
- User status and role updates
- User storage-limit updates in bytes
- User and file deletion confirmations
- Storage analytics and large-file reporting
- Activity filtering and pagination
- Service health and Node.js memory reporting
- Global system settings updates

Admin pages normalize backend objects before rendering. For example, `_id` becomes `id`, populated owners are flattened for tables, dates are formatted, and MIME types are grouped for analytics.

## Pricing

`/pricing` contains Free, Pro, and Business plan UI. It does not process payments yet.

- Free routes to signup.
- Pro routes to signup with a `plan=pro` query parameter.
- Business opens a sales email link.

Future billing work should replace these placeholders with checkout/session creation endpoints. TODO comments are located in `components/pricing/pricing-data.js`.

## Session Cookie Troubleshooting

If login returns `Set-Cookie` but the browser does not store or send the cookie, check:

1. Frontend and backend use the same hostname. Do not mix `localhost` and `127.0.0.1`.
2. Backend CORS uses the exact frontend origin and `credentials: true`.
3. Axios requests use `withCredentials: true`.
4. Local HTTP cookies use `secure: false`.
5. Local development usually uses `sameSite: "lax"`.
6. Do not set `domain: "localhost"`; allow a host-only cookie.
7. Check the browser Network request's Cookies tab for a rejection reason.

For cross-domain production deployments, cookies normally require `sameSite: "none"`, `secure: true`, HTTPS, and correct proxy trust settings.

## Upload Troubleshooting

If a presigned upload fails:

- Confirm the backend returned both `fileId` and `uploadUrl`.
- Confirm the request `Content-Type` matches the type used to sign the URL.
- Confirm the S3 bucket CORS configuration allows the frontend origin and `PUT`.
- Inspect the S3 request directly in the browser Network panel.
- Do not use the normal Axios API client for the S3 URL.
- Confirm the completion request runs only after S3 returns a successful status.

## Development Guidelines

- Keep route files small and compose UI from `components/`.
- Put HTTP requests in `lib/api/`, not directly in visual components.
- Normalize backend payloads in `utils/` or `lib/admin/`.
- Preserve session-cookie authentication; do not introduce frontend token storage.
- Keep destructive operations behind confirmation modals.
- Add loading, empty, and error states for every API-driven screen.
- Maintain responsive table overflow and mobile navigation behavior.
- Never commit `.env.local` or backend credentials.

## Current Payment TODOs

- Add Stripe or another billing provider.
- Create checkout and customer portal endpoints.
- Persist subscriptions and plan changes.
- Apply plan storage limits after payment confirmation.
- Add billing history and invoice UI.
- Replace pricing placeholder destinations with real checkout flows.

## Related Documentation

- [Authentication setup](./AUTH_SETUP.md)
- Backend API documentation should be maintained in the backend repository's `README.md`.
