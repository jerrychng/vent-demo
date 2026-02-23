# JWT Authentication Hookup Guide (Frontend + Backend)

This guide is separate from `REAL_BACKEND_HOOKUP_GUIDE.md` and focuses only on authentication.

## 1. Target Auth Flow

1. User logs in with email/password.
2. Backend returns `access_token` (+ `refresh_token`).
3. Frontend stores session securely and uses `Authorization: Bearer <access_token>` on protected calls.
4. On expired access token, frontend uses refresh token to get a new access token.
5. If refresh fails, frontend logs out and redirects to login.

## 2. Required Backend Endpoints

Implement these endpoints under `/api/v1`:

1. `POST /auth/setup` (one-time super admin creation)
2. `POST /auth/login`
3. `GET /auth/me`
4. `POST /auth/refresh`
5. `POST /auth/logout` (optional but recommended)

### 2.1 `POST /auth/login`

Request:

```json
{
  "email": "manager@company.com",
  "password": "Password@123"
}
```

Response:

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<opaque-or-jwt>",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": 12,
    "email": "manager@company.com",
    "full_name": "Sarah Lee",
    "role": "trade_manager",
    "is_active": true
  }
}
```

### 2.2 `GET /auth/me`

Requires `Authorization: Bearer <access_token>`.

Response:

```json
{
  "id": 12,
  "email": "manager@company.com",
  "full_name": "Sarah Lee",
  "role": "trade_manager",
  "is_active": true
}
```

### 2.3 `POST /auth/refresh`

Request:

```json
{
  "refresh_token": "<token>"
}
```

Response:

```json
{
  "access_token": "<new-jwt>",
  "refresh_token": "<new-refresh-token>",
  "token_type": "bearer",
  "expires_in": 900
}
```

### 2.4 Standard Auth Errors

- `401`: missing/expired/invalid token
- `403`: authenticated but forbidden by role
- `422`: invalid input

Suggested format:

```json
{
  "detail": "Token expired"
}
```

## 3. JWT Claim Requirements

Your current frontend expects these claims in `access_token`:

```json
{
  "sub": "12",
  "email": "manager@company.com",
  "full_name": "Sarah Lee",
  "role": "trade_manager",
  "exp": 1770000000
}
```

Required claims for reliable UX:

1. `sub` (user id)
2. `role` (`super_admin` | `trade_manager` | `engineer`)
3. `exp` (unix seconds)
4. `email` and `full_name` (recommended to avoid extra fallback paths)

## 4. Frontend Env Vars

Add in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_USE_MOCK_API=false
```

## 5. What Is Missing Right Now (in current codebase)

Based on `src/lib/api.ts` and `src/contexts/AuthContext.tsx`:

1. Mock mode is hardcoded on:
   - `src/lib/api.ts` uses `const USE_MOCK = true;`
   - Result: real backend auth is never used.

2. No refresh-token flow:
   - `POST /auth/refresh` is not called anywhere.
   - Access token expiry currently forces logout.

3. No request retry after refresh:
   - Protected request fails once on `401` and token is cleared.
   - Missing single retry after successful refresh.

4. Refresh token not stored/managed:
   - Only `access_token` is stored in localStorage (`token`).
   - No refresh token persistence strategy.

5. No centralized auth-error routing:
   - No global behavior to redirect to `/login` after refresh failure.

## 6. Minimum Changes Needed in Frontend

1. Make mock toggle env-driven in `src/lib/api.ts`
   - Use `NEXT_PUBLIC_USE_MOCK_API`.

2. Store both tokens on login in `src/contexts/AuthContext.tsx`
   - `access_token` and `refresh_token`.

3. Add refresh helper in `src/lib/api.ts`
   - On `401`, call `/auth/refresh`, update tokens, retry original request once.

4. Add logout-on-refresh-failure behavior
   - Clear tokens and force navigation to `/login`.

5. Keep `GET /auth/me` on app init
   - Validate active session and latest role/state.

## 7. Suggested Implementation Tasks

1. Update `src/lib/api.ts`:
   - env-based mock switch
   - refresh logic
   - one-time retry protection

2. Update `src/contexts/AuthContext.tsx`:
   - parse/store `refresh_token` from login response
   - clear both tokens on logout

3. Add token keys constants:
   - `ACCESS_TOKEN_KEY`
   - `REFRESH_TOKEN_KEY`

4. Confirm route protection:
   - `src/app/components/RequireAuth.tsx`
   - role-based redirects for protected pages

## 8. Done Criteria (Auth)

Authentication hookup is complete when:

1. Login works against real backend (`USE_MOCK=false`).
2. Protected APIs include Bearer token automatically.
3. Expired access token is refreshed transparently.
4. Original request succeeds after refresh (single retry).
5. Invalid refresh token logs user out cleanly.
6. Role-protected routes behave correctly for all 3 roles.
