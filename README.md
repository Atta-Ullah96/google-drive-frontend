# Storix Frontend

Storix is a Google Drive-style cloud storage application. This repository contains the Next.js frontend for authentication, file and folder management, direct-to-S3 uploads, file previews and downloads, storage quota visibility, Stripe subscription billing, administration, and pricing.

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
- Stripe Checkout and customer portal redirects through backend APIs
- User billing page with current plan, quota, cancellation, and resume actions
- Responsive admin console with role protection
- Admin user, file, activity, storage, subscription, payment, health, and settings pages
- Public pricing page with Free, Pro, and Business checkout flow

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
| Billing | Stripe Checkout and Billing Portal through backend APIs |

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
| `/dashboard/billing` | User subscription and billing management |
| `/billing/success` | Stripe Checkout success return page |
| `/billing/cancel` | Stripe Checkout cancel return page |

### Admin routes

| Route | Purpose |
| --- | --- |
| `/admin` | Platform overview |
| `/admin/users` | User search, filters, status, and deletion |
| `/admin/users/[id]` | User details, role, status, and storage quota |
| `/admin/storage` | Platform storage analytics |
| `/admin/subscriptions` | Subscription search, filters, and billing records |
| `/admin/subscriptions/[id]` | Subscription details, storage summary, and payment history |
| `/admin/payments` | Payment and invoice records |
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
  billing/                Stripe Checkout success and cancel pages
  dashboard/billing/      User billing management route
  pricing/                Public pricing route
  layout.js               Root layout, header, and Google provider
  page.js                 Drive workspace entry point

components/
  admin/                  Admin shell, guard, UI primitives, and pages
  billing/                User billing page components
  drive/                  Drive files, folders, upload, toolbar, and modals
  header/                 Global navigation and session-aware account menu
  home/                   Main Drive state and workflow orchestration
  pricing/                Pricing cards, comparison table, FAQ, and CTA
  providers/              Google OAuth provider

lib/
  admin/                  Admin response normalization utilities
  api/                    Axios clients and API helper modules
  billing/                Billing plan metadata and response normalization

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

### Billing API client

`lib/api/billing.jsx` uses a separate Axios instance because billing routes are mounted at:

```text
${NEXT_PUBLIC_API_URL}/api/billing/
```

The billing client also sets `withCredentials: true` so session cookies are sent to the backend. The frontend never exposes a Stripe secret key and does not directly upgrade a user plan. It only asks the backend for a Stripe Checkout or Billing Portal URL and then redirects the browser.

### API modules

| File | Responsibility |
| --- | --- |
| `lib/api/auth.jsx` | Register, login, logout, current user, Google OAuth |
| `lib/api/folderapi.jsx` | Create, list, rename, and delete folders |
| `lib/api/file.jsx` | Upload workflow, list, rename, preview, download, delete |
| `lib/api/user.jsx` | Current user's storage usage and quota |
| `lib/api/admin.jsx` | All admin APIs and mutations |
| `lib/api/billing.jsx` | Checkout, portal, current subscription, cancel, resume |

Response normalization belongs in `utils/drive/`, `lib/admin/adminData.js`, or `lib/billing/billingData.js`, not inside presentation components. This keeps components stable when backend payloads contain MongoDB `_id` values, populated references, or nested `data` objects.

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
- Subscription stats, subscription table, subscription detail, and payment records
- Activity filtering and pagination
- Service health and Node.js memory reporting
- Global system settings updates

Admin pages normalize backend objects before rendering. For example, `_id` becomes `id`, populated owners are flattened for tables, dates are formatted, and MIME types are grouped for analytics.

## Pricing

`/pricing` contains Free, Pro, and Business plans connected to the backend billing APIs.

- Free is `$0/month` with `8 GB` storage.
- Pro is `$9/month` with `100 GB` storage.
- Business is `$29/month` with `1 TB` storage.
- Logged-out users who choose a paid plan are sent to login with a return path.
- Logged-in users choosing Pro or Business see an upgrade confirmation modal.
- Continuing from the modal calls `POST /api/billing/create-checkout-session`.
- The frontend redirects to the Stripe Checkout URL returned by the backend.
- Paid users can open Stripe Billing Portal through `POST /api/billing/create-portal-session`.

The frontend does not collect card details. Stripe Checkout handles payment securely, and the backend finalizes plan changes from Stripe webhooks.

## Billing

User billing lives at `/dashboard/billing`.

It loads:

```text
GET /api/billing/my-subscription
```

It can call:

```text
POST /api/billing/create-portal-session
POST /api/billing/cancel-subscription
POST /api/billing/resume-subscription
```

The page shows the current plan, status, storage used, storage limit, current period end, cancel-at-period-end state, and invoice/payment history if the backend returns it.

Stripe return routes:

- `/billing/success` explains that payment completed and the backend webhook may need a few seconds.
- `/billing/cancel` explains that checkout was cancelled and the plan did not change.

## Admin Billing

Admin billing uses the existing admin guard and `/api/admin` client.

Connected endpoints:

```text
GET /api/admin/subscription-stats
GET /api/admin/subscriptions
GET /api/admin/subscriptions/:id
GET /api/admin/payments
```

Admin overview includes subscription cards for MRR, total revenue, active paid subscribers, Pro users, Business users, and failed payments when the backend returns stats.

Admin pages:

- `/admin/subscriptions` supports search, plan filter, status filter, sorting, pagination, and links to user/detail pages.
- `/admin/subscriptions/[id]` shows subscription metadata, user info, storage summary, and payment history.
- `/admin/payments` lists invoices/payments with status badges and invoice/PDF links.

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

## Billing Test Checklist

- Logged-out user clicks Pro on `/pricing` and is redirected to `/auth/login?redirect=/pricing`.
- Logged-in Free user clicks Pro or Business and sees the upgrade confirmation modal.
- Continue to Checkout calls the backend and redirects to Stripe Checkout.
- Stripe success returns to `/billing/success`.
- Stripe cancel returns to `/billing/cancel`.
- `/dashboard/billing` shows the updated plan after the backend webhook processes the subscription.
- Manage Billing opens the Stripe Billing Portal.
- Cancel and resume actions refetch the subscription after completion.
- Admin overview shows subscription stats when the backend returns them.
- `/admin/subscriptions` and `/admin/payments` show backend billing records.

## Related Documentation

- [Authentication setup](./AUTH_SETUP.md)
- Backend API documentation should be maintained in the backend repository's `README.md`.
