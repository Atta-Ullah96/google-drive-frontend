# Auth Setup

This frontend uses session-based authentication. It does not store tokens in `localStorage`, does not attach `Authorization` headers, and does not manage auth tokens on the client.

## Environment

Required frontend variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

`NEXT_PUBLIC_API_URL` should point to the backend origin, without `/api/v1`.

## Axios

The shared axios client is in `lib/api/api.jsx`.

```js
withCredentials: true
```

This allows browser session cookies to be sent with requests.

## API Helpers

Auth helpers live in `lib/api/auth.jsx`.

Current endpoints:

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/google
```

## Register

The signup page calls:

```js
register({ name, email, password })
```

On success, it redirects to `/auth/login`.

## Login

The login page calls:

```js
login({ email, password })
```

On success, the backend should set the session cookie. The frontend redirects to `/`.

## Current User

The header calls:

```js
getCurrentUser()
```

This requests:

```txt
GET /api/v1/auth/me
```

The header uses the returned user to show logged-in navigation, avatar initial, name, and email.

Supported response shapes:

```js
{ user: {...} }
{ data: { user: {...} } }
{ data: {...} }
{...user}
```

## Logout

The header calls:

```js
logout()
```

This requests:

```txt
POST /api/v1/auth/logout
```

The backend should destroy the session and clear the cookie.

## Google Auth

Google auth is implemented with `@react-oauth/google` using auth-code flow.

Frontend flow:

1. User clicks the Google button.
2. Google returns a one-time `code`.
3. Frontend sends `{ code }` to `POST /api/v1/auth/google`.
4. Backend exchanges/verifies the code with Google.
5. Backend creates or finds the user.
6. Backend sets the session cookie.
7. Frontend redirects to `/`.

Backend route expected by the frontend:

```txt
POST /api/v1/auth/google
```

Expected request body:

```json
{
  "code": "google_auth_code"
}
```

## Backend Requirements

For session cookies to work across frontend and backend ports, backend CORS must allow credentials.

Example:

```js
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
```

Session cookie settings for local development usually need:

```js
cookie: {
  httpOnly: true,
  secure: false,
  sameSite: "lax"
}
```

If frontend and backend are deployed on different domains, cookie settings may need `sameSite: "none"` and `secure: true`.
