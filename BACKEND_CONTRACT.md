# Backend contract – what the frontend expects

The frontend calls the API at **base URL** `NEXT_PUBLIC_API_BASE_URL` or `http://localhost:8000/api/v1`. All paths below are relative to that base.

Domain models (User, Site, Template, TemplateArea, Job, WorkCapture) are defined in **`src/types/models.ts`** and should match the backend schema.

### Roles

- **super_admin** – Can create sites, templates, trade managers, and engineers. Full access to all endpoints.
- **trade_manager** – Can create sites, templates, and engineers. User management: list users, create engineers. Cannot create or manage other trade managers.
- **engineer** – Assigned to jobs; captures work (e.g. pre/post photos). No access to Sites/Templates/Engineer management.

---

## Running without a backend (mock API)

By default the app uses the mock (no env needed). To use the real backend, set in `.env.local`:

```bash
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Then run `npm run dev`. The app uses an **in-memory mock** that implements:

- **POST /auth/login** – any email/password; returns a fake JWT and user.
- **GET /auth/me** – returns the user for the stored token (decoded from JWT if needed).
- **POST /auth/setup** – first call creates a super_admin; subsequent calls return “Setup already completed”.
- **GET /jobs**, **GET /jobs/:id**, **POST /jobs/:id/approve**, **POST /jobs/:id/reject** – sample data; approve/reject update status in memory.

Mock state resets on full page reload (no persistence). To use the real backend, set `NEXT_PUBLIC_USE_MOCK_API=false` (or remove it) and set `NEXT_PUBLIC_API_BASE_URL` to your API.

---

## 9.1 Authentication Endpoints

### Base URL and headers

- **Base:** `{API_BASE_URL}` (e.g. `http://localhost:8000/api/v1`)
- **Authenticated requests:** frontend sends `Authorization: Bearer <access_token>` (JWT in localStorage).
- **Content-Type:** `application/json` for request bodies.

---

### `POST /auth/login`  
**Get access token for user.**

- **Access:** Public (no auth required)
- **Used by:** Web App, Mobile App

**Request:**
```json
{
  "email": "john@aspect.co.uk",
  "password": "secret123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "john@aspect.co.uk",
    "full_name": "John Smith",
    "role": "trade_manager"
  }
}
```

**Response (401):**
```json
{
  "detail": "Incorrect email or password"
}
```

---

### `GET /auth/me`  
**Get current authenticated user.**

- **Access:** Any authenticated user
- **Used by:** Web App, Mobile App

**Response (200):** User model (no `password_hash`). Optional: `created_by`, `created_at`, `updated_at`.
```json
{
  "id": 1,
  "email": "john@aspect.co.uk",
  "full_name": "John Smith",
  "role": "trade_manager",
  "is_active": true,
  "created_by": null,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-15T10:30:00Z"
}
```

**Response (401):** Frontend clears stored token and redirects to `/login`.

---

### `POST /auth/setup`  
**Create first super admin (only works when no users exist).**

- **Access:** Public (one-time only)
- **Used by:** Web App (initial setup)

**Request:**
```json
{
  "email": "admin@aspect.co.uk",
  "password": "securepassword",
  "full_name": "System Admin"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "admin@aspect.co.uk",
  "full_name": "System Admin",
  "role": "super_admin"
}
```

**Response (403):**
```json
{
  "detail": "Setup already completed"
}
```

---

## 9.2 User Management Endpoints

**Access:** Super Admin, Trade Manager (Trade Manager sees/edits engineers only where noted).

### `GET /users`
List users (filtered by role permissions).
- **Query:** `role` (optional), `is_active` (optional, default: true)
- **Response (200):** `{ "users": [ { "id", "email", "full_name", "role", "is_active", "created_at" } ], "total": number }`
- **Notes:** Super Admin sees all users; Trade Manager sees only engineers.

### `POST /users`
Create new user.
- **Request:** `{ "email", "password", "full_name", "role": "engineer" }`
- **Response (201):** `{ "id", "email", "full_name", "role", "is_active" }`
- **Response (403):** `{ "detail": "Trade managers can only create engineers" }`
- **Notes:** Super Admin can create any role; Trade Manager can only create engineers.

### `GET /users/{user_id}`
Get single user. Trade Manager: engineers only.

### `PATCH /users/{user_id}`
Update user (e.g. `full_name`, `is_active`). Trade Manager: engineers only.

### `POST /users/{user_id}/reset-password`
Reset password. **Request:** `{ "new_password": "string" }`. Trade Manager: engineers only.

---

## 9.3 Site Endpoints

**Access:** Super Admin, Trade Manager (create/list/update). Engineer: GET site only if has job at site.

### `GET /sites`
List all sites. **Query:** `search` (optional). **Response (200):** `{ "sites": [ { "id", "client_name", "site_name", "city", "postcode", "job_count" } ], "total": number }`

### `POST /sites`
Create site. **Request:** `{ "client_name", "site_name", "address_line_1", "address_line_2", "city", "postcode", "contact_name", "contact_phone", "contact_email" }`

### `GET /sites/{site_id}` — Super Admin, Trade Manager, Engineer (if has job at site)
### `PATCH /sites/{site_id}` — Super Admin, Trade Manager
### `GET /sites/{site_id}/history` — **Query:** `limit`, `status`. Job history for site.

---

## 9.4 Template Endpoints

**Access:** Super Admin, Trade Manager (create/list/update). Engineer: GET template only if assigned job uses it.

### `GET /templates`
List templates. **Query:** `is_active` (optional). **Response (200):** `{ "templates": [ { "id", "name", "description", "area_count", "is_active", "created_at" } ] }`

### `POST /templates`
Create template with areas. **Request:** `{ "name", "description", "areas": [ { "name", "order_index", "photo_guidance" } ] }`  
**Response (201):** `{ "id", "name", "areas": [ { "id", "name", "order_index", ... } ] }`

### `GET /templates/{template_id}` — Full template with areas
### `PATCH /templates/{template_id}` — Update name, description, is_active
### `POST /templates/{template_id}/areas` — Add area
### `PATCH /templates/{template_id}/areas/{area_id}` — Update area
### `DELETE /templates/{template_id}/areas/{area_id}` — Remove area (only if no jobs use it)

---

## 9.5 Job Endpoints

**Access:** Super Admin, Trade Manager (all jobs). Engineer (own jobs only).

### `GET /jobs`
List jobs. **Query:** `status`, `site_id`, `engineer_id` (admin/TM only).  
**Response (200):** `{ "jobs": [ { "id", "reference", "title", "status", "site", "engineer", "scheduled_date", "completion_percentage", "created_at" } ], "total": number }`

### `POST /jobs`
Create job. **Request:** `{ "title", "description", "site_id", "template_id", "engineer_id" (optional), "scheduled_date" }`  
**Response (201):** Job with `status: "assigned"` or `"draft"` if no engineer.

### `GET /jobs/{job_id}`
Full job with site, template, captures, `previous_job` (historical reference).

### `PATCH /jobs/{job_id}`
Update job (title, description, date, reassign engineer).

---

## 9.6 Job Status Endpoints

### `POST /jobs/{job_id}/start` — Engineer (assigned only). Status: assigned → in_progress. Creates empty captures.
### `POST /jobs/{job_id}/submit` — Engineer (assigned only). Status: in_progress → submitted. All areas must have pre+post images.
### `POST /jobs/{job_id}/approve` — Super Admin, Trade Manager. **Body:** `{ "notes" }`. Status: submitted → approved.
### `POST /jobs/{job_id}/reject` — Super Admin, Trade Manager. **Body:** `{ "reason" }`. Status: submitted → rejected.

---

## 9.7 Work Capture Endpoints

### `GET /jobs/{job_id}/captures` — Super Admin, Trade Manager, Engineer (own job). Returns captures + completion_percentage.
### `POST /jobs/{job_id}/captures/{area_id}/pre` — Engineer (assigned only). multipart/form-data image upload.
### `POST /jobs/{job_id}/captures/{area_id}/post` — Engineer (assigned only). Pre must exist first.

---

## Error handling

- **401 Unauthorized:** Frontend removes stored token and redirects to login.
- **Other errors:** Response JSON may include `detail` (string) for user-facing messages.
