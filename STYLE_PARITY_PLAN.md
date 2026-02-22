# Vent Frontend vs Aspect Web Portal Styling Parity Plan

## Phase 1 Output (Audit + Checklist)

This document captures the concrete styling parity checklist to align `vent-frontend` with the `aspect-web-portal` design system while keeping `src/app/globals.css` as the single global style source.

## Current State Summary

1. Global tokens are already mostly aligned:
- `src/app/globals.css` already carries the Aspect color system, Mont font faces, toast colors, and utility font classes.
- `tailwind.config.ts` already maps semantic and Aspect-style token names.

2. Component architecture is currently split:
- `src/components/ui/*` (modern shared UI primitives).
- `src/app/components/*` (legacy/copied components from `aspect-web-portal`).
- `src/app/components/ui/*` (second UI primitive set, partially overlapping `src/components/ui/*`).

3. Active usage in app routes:
- `@/app/components/Button` is used widely across app pages.
- `@/app/components/LoadingSpinner` is used by loading/layout files.
- Most other `src/app/components/*` files are not imported by routes.

4. Legacy risk:
- Many `src/app/components/*` files import `../utils/*` paths that do not exist under `src/app`, indicating stale copied code.

## High-Priority Parity Gaps

1. Two button systems with different styling behavior:
- Active app pages use `src/app/components/Button.tsx`.
- UI library internals use `src/components/ui/button.tsx`.

2. Duplicate UI primitive folders with drift:
- `src/app/components/ui/button.tsx` differs from `src/components/ui/button.tsx`.
- `src/app/components/ui/input.tsx` differs from `src/components/ui/input.tsx`.
- `src/app/components/ui/label.tsx` differs from `src/components/ui/label.tsx`.
- `src/app/components/ui/popover.tsx` differs from `src/components/ui/popover.tsx`.
- `src/app/components/ui/calendar.tsx` differs from `src/components/ui/calendar.tsx`.
- `src/app/components/ui/sonner.tsx` differs from `src/components/ui/sonner.tsx`.

3. Inconsistent source-of-truth for interaction states:
- Hover/focus/disabled states are not centralized yet in one primitive layer.

## Exact File Checklist

## A. Foundation (keep and lock)

1. Keep `src/app/globals.css` as global style source.
2. Keep token mapping in `tailwind.config.ts`, but enforce token-only usage in components.
3. Keep app-level toaster entry in `src/app/layout.tsx` and use one Sonner implementation only.

## B. Primitive Consolidation

1. Standardize on `src/components/ui/*` as the only primitive source.
2. Migrate all app routes off `src/app/components/Button.tsx` to `src/components/ui/button.tsx` (or a thin wrapper in one location).
3. Remove `src/app/components/ui/*` after migration (or mark deprecated and block new imports).

## C. App Component Cleanup

1. Keep (active):
- `src/app/components/Button.tsx` (temporary, until migration done).
- `src/app/components/LoadingSpinner.tsx`.

2. Decommission candidates (legacy/copied, currently not route-imported):
- `src/app/components/AddNewLocationModal.tsx`
- `src/app/components/AddressSearchAndDisplay.tsx`
- `src/app/components/AddressSearchBar.tsx`
- `src/app/components/Card.tsx`
- `src/app/components/CardAuthorisationModal.tsx`
- `src/app/components/CardSelect.tsx`
- `src/app/components/ChumleyLogo.tsx`
- `src/app/components/DateIcon.tsx`
- `src/app/components/DateInput.tsx`
- `src/app/components/EmailInput.tsx`
- `src/app/components/FilterModal.tsx`
- `src/app/components/HeroBanner.tsx`
- `src/app/components/ImageUploader.tsx`
- `src/app/components/LocationDetail.tsx`
- `src/app/components/MessageBox.tsx`
- `src/app/components/MobileRateDisplay.tsx`
- `src/app/components/Modal.tsx`
- `src/app/components/MultiSelect.tsx`
- `src/app/components/Pagination.tsx`
- `src/app/components/PasswordInput.tsx`
- `src/app/components/PhoneNumberInput.tsx`
- `src/app/components/Radio.tsx`
- `src/app/components/RequireAuth.tsx`
- `src/app/components/Select.tsx`
- `src/app/components/SortModal.tsx`
- `src/app/components/SvgIcon.tsx`
- `src/app/components/SvgIcon2.tsx`
- `src/app/components/TextArea.tsx`
- `src/app/components/TextInput.tsx`
- `src/app/components/UploadedImagesGallery.tsx`

## D. Route-Level Migration Targets (Button first)

Update imports in:
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/setup/page.tsx`
- `src/app/(protected)/dashboard/page.tsx`
- `src/app/(protected)/layout.tsx`
- `src/app/(protected)/engineer-home/page.tsx`
- `src/app/(protected)/engineer-jobs/[id]/page.tsx`
- `src/app/(protected)/jobs/page.tsx`
- `src/app/(protected)/jobs/[id]/page.tsx`
- `src/app/(protected)/sites/page.tsx`
- `src/app/(protected)/templates/page.tsx`
- `src/app/(protected)/trade-managers/page.tsx`
- `src/app/(protected)/users/page.tsx`

## E. Guardrails

1. Add lint/CI rule to block new imports from:
- `@/app/components/ui/*`
- `@/app/components/*` (except explicitly allowed files during migration).

2. Add lint/CI rule to block hardcoded hex values in TSX/JSX class strings.

## Suggested Execution Order (Phase 2+)

1. Unify button primitives and migrate all route imports.
2. Delete/deprecate `src/app/components/ui/*`.
3. Remove unused legacy `src/app/components/*`.
4. Run visual QA on auth, dashboard, jobs, sites, templates, users pages.
5. Add guardrails (lint rules) to prevent regression.

