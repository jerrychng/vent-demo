# Real Backend Hookup Guide

This document explains exactly what to connect so the frontend works end-to-end with the real backend, and how JWT authentication should behave.

## 1. Goal

Move from mock/static frontend data to real API integration for:
- Login/authentication
- Role-based access control (super_admin, trade_manager, engineer)
- CRUD for sites/templates/jobs
- Job lifecycle actions (assign/start/submit/approve/reject)
- Work capture (pre/post images)
- Dashboard metrics and lists

## 2. Required Backend Deliverables

Before hookup starts, backend team should provide:
- OpenAPI spec URL (`/openapi.json`) and Swagger URL (`/docs`)
- Base URLs for each environment:
  - `DEV_API_BASE_URL`
  - `STAGING_API_BASE_URL`
  - `PROD_API_BASE_URL`
- Auth contract:
  - Login endpoint
  - Refresh endpoint
  - Token expiry times
  - Refresh rotation rules
- Role permission matrix per endpoint
- Error response format (single standard shape)
- Upload flow details (direct signed URL vs backend upload endpoint)

## 3. Environment Setup (Frontend)

Add/update env variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://<backend-host>/api/v1
```

Optional (if backend uses these):

```env
NEXT_PUBLIC_UPLOAD_MAX_MB=10
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

## 4. API Modules to Hook Up

Implement and use one API layer (single source of truth), then connect each screen.

### 4.1 Auth

Required endpoints:
- `POST /auth/setup` (first-time super admin only)
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout` (if implemented)
- `GET /auth/me` (or `/users/me`)

### 4.2 Users

- `GET /users`
- `POST /users`
- `PATCH /users/{id}`
- `POST /users/{id}/reset-password` (if needed)

### 4.3 Sites

- `GET /sites`
- `POST /sites`
- `GET /sites/{id}`
- `PATCH /sites/{id}`

### 4.4 Templates + Template Areas

- `GET /templates`
- `POST /templates`
- `GET /templates/{id}`
- `PATCH /templates/{id}`
- `POST /templates/{id}/areas`
- `PATCH /templates/{id}/areas/{areaId}`

### 4.5 Jobs

- `GET /jobs` (filter/sort/pagination)
- `POST /jobs`
- `GET /jobs/{id}`
- `PATCH /jobs/{id}`
- `POST /jobs/{id}/assign`
- `POST /jobs/{id}/start`
- `POST /jobs/{id}/submit`
- `POST /jobs/{id}/approve`
- `POST /jobs/{id}/reject`

### 4.6 Work Captures (Pre/Post)

- `GET /jobs/{job_id}/captures`
- `POST /jobs/{job_id}/captures/{area_id}/pre` (multipart/form-data: `image`)
- `POST /jobs/{job_id}/captures/{area_id}/post` (multipart/form-data: `image`)
- Rule: `post` requires existing `pre` image first (`400` when violated)

### 4.7 Historical Visit Reference

Engineer needs previous visit photos for same site.

Use either:
- `GET /jobs/{id}/previous-visit`

or derive via:
- `GET /jobs?site_id=<siteId>&status=approved&sort=-scheduled_date&limit=1`

## 5. JWT Authentication (How It Must Work)

## 5.1 Login

Frontend sends:

```json
{
  "email": "manager@company.com",
  "password": "<password>"
}
```

Backend returns:

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt-or-random-token>",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": 12,
    "full_name": "Sarah Lee",
    "role": "trade_manager",
    "is_active": true
  }
}
```

## 5.2 Token Usage

Send access token in every protected request:

```http
Authorization: Bearer <access_token>
```

## 5.3 Refresh Flow

When access token is expired:
1. API returns `401`.
2. Frontend calls `POST /auth/refresh` with refresh token.
3. If refresh succeeds, store new access token (and new refresh token if rotated).
4. Retry the failed original request once.
5. If refresh fails, clear session and redirect to login.

## 5.4 401 vs 403

- `401 Unauthorized`: user not authenticated (missing/expired/invalid token).
- `403 Forbidden`: authenticated but role has no permission.

Frontend behavior:
- On `401`: refresh attempt, then logout if refresh fails.
- On `403`: show "No permission" state and disable restricted actions.

## 5.5 Token Storage Recommendation

Minimum practical setup:
- Store access token in memory (preferred) or short-lived storage.
- Store refresh token in secure cookie (best) or protected storage.
- Never log tokens to console.

If backend supports secure HTTP-only cookies, prefer cookie-based refresh token handling.

## 6. Role and Permission Hookup

Roles:
- `super_admin`
- `trade_manager`
- `engineer`

Expected UI restrictions:
- `super_admin`: full access
- `trade_manager`: sites, templates, jobs, review
- `engineer`: only assigned jobs, start/capture/submit

Important: UI restrictions are convenience only. Backend must enforce authorization.

## 7. Data/Contract Rules to Lock

Backend and frontend must agree on:
- Date/time format: ISO 8601 (`2026-02-22T14:30:00Z`)
- Enum values (exact strings, case-sensitive)
- Pagination format:
  - Query: `page`, `page_size`, `sort`, filters
  - Response: `items`, `total`, `page`, `page_size`
- Error format (example):

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid payload",
  "details": {
    "field": "scheduled_date"
  }
}
```

## 8. Screen-by-Screen Hookup Checklist

## 8.1 Login Screen
- Connect to `POST /auth/login`
- Store session tokens/user
- Redirect by role

## 8.2 Dashboard
- Connect stats endpoint(s)
- Connect pending review list
- Ensure role-based cards/actions

## 8.3 Templates Page
- List templates from API
- Create/update template + areas
- Respect `is_active`

## 8.4 Sites Page
- List/create/edit sites
- Validate required fields

## 8.5 Create Job Page
- Load site/template/engineer options from API
- Submit to `POST /jobs`
- Optional immediate assign endpoint

## 8.6 Jobs List + Details
- Real server-side filtering/sorting/pagination
- Load details with captures and status

## 8.7 Engineer Job Execution
- Start job (`POST /jobs/{id}/start`)
- Upload pre/post images and save capture records
- Submit job (`POST /jobs/{id}/submit`)

## 8.8 Manager Review
- Approve (`POST /jobs/{id}/approve`)
- Reject with notes (`POST /jobs/{id}/reject`)

## 9. Image Upload Integration

Two valid patterns:

1. Direct-to-Blob (recommended)
- Frontend asks backend for signed upload URL
- Frontend uploads file directly to blob storage
- Frontend sends resulting file URL in capture payload

2. Backend proxy upload
- Frontend sends multipart file to backend
- Backend uploads to blob and returns URL

Must define:
- Max file size
- Allowed mime types
- Thumbnail strategy
- Retry behavior for flaky connections

Recommended blob path format:
- `job-images/jobs/{job_id}/areas/{area_id}/pre_{YYYYMMDD_HHMMSS}_{suffix}.jpg`
- `job-images/jobs/{job_id}/areas/{area_id}/pre_{YYYYMMDD_HHMMSS}_{suffix}_thumb.jpg`
- `job-images/jobs/{job_id}/areas/{area_id}/post_{YYYYMMDD_HHMMSS}_{suffix}.jpg`
- `job-images/jobs/{job_id}/areas/{area_id}/post_{YYYYMMDD_HHMMSS}_{suffix}_thumb.jpg`

## 10. Testing Plan (Definition of Done)

Complete when all scenarios pass in DEV and STAGING:
- Login/logout/refresh works across token expiry
- Role restrictions correct in UI and backend
- Manager can create site/template/job and assign engineer
- Engineer can start job, upload all pre/post photos, submit
- Manager can approve/reject with notes
- Historical previous-visit data appears correctly
- No mock data remains in hooked screens

## 11. Common Failure Points (Avoid These)

- Frontend and backend enum mismatch (`in_progress` vs `inProgress`)
- Unclear timezone handling causing wrong due dates
- Refresh race condition (multiple simultaneous refresh calls)
- Treating `403` as logout event
- Upload success but capture record not persisted

## 12. Suggested Execution Order

1. Auth and session management
2. Jobs list/detail + status actions
3. Templates and sites CRUD
4. Work capture + image upload
5. Dashboard aggregates
6. End-to-end QA across roles

## 13. Quick Handover Message You Can Send Backend Team

"Please share final `/api/v1` OpenAPI spec, auth/refresh token rules, role permission map per endpoint, and upload contract. We will wire frontend in this order: auth -> jobs -> templates/sites -> captures/uploads -> dashboard, and we need enum/date/error formats locked before integration."
