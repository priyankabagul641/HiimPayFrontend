# Security, Authentication, and Authorization Assessment

Date: 2026-03-27

## Scope
This document summarizes:
- Security features currently implemented in the Angular frontend.
- Module-wise status for Project (CPOC), Superadmin, and Client Employee.
- Recommended security features to add next.

## Current Security Features (Already Added)

### 1) Shared/Common Security Controls
- JWT token storage in `sessionStorage` via `JwtAuthService`.
- HTTP `Authorization: Bearer <token>` header added by `AuthInterceptor` for most API requests.
- Route access protection with `AuthguardService` (checks session user presence before activating protected routes).
- Session logout behavior through `sessionStorage.clear()` / token removal in multiple components.
- OTP-based authentication flow for user/client login paths.
- Captcha checks before OTP and login actions in login components.

Evidence:
- `src/app/auth/authservice/jwt-auth.service.ts`
- `src/interceptor/auth.interceptor.ts`
- `src/app/auth/guards/authguard.service.ts`
- `src/app/client-employee/login/login.component.ts`
- `src/app/auth/components/adminlogin/adminlogin.component.ts`
- `src/app/auth/components/userlogin/userlogin.component.ts`

### 2) Superadmin Module
Already implemented:
- App-level route to `/superadmin` is protected by `canActivate: [AuthguardService]`.
- Admin login flow validates email/password and captcha before authentication call.
- Login response supports role/userType-based navigation (`ADMIN`, `CPOC`, fallback employee/dashboard).
- Token + logged-in user object are stored after successful auth.

Evidence:
- `src/app/app-routing.module.ts`
- `src/app/superadmin/superadmin-routing.module.ts`
- `src/app/auth/components/adminlogin/adminlogin.component.ts`

### 3) Project Module (CPOC / Project Area)
Already implemented:
- App-level route `/cpoc/:id` is protected by `canActivate: [AuthguardService]`.
- User login routes CPOC users to project path based on `userType` / `typeOfUser`.
- Session flag `isCpoc` is set and used for UX/state behavior.

Evidence:
- `src/app/app-routing.module.ts`
- `src/app/superadmin/project/project-routing.module.ts`
- `src/app/auth/components/userlogin/userlogin.component.ts`
- `src/app/client-employee/login/login.component.ts`

### 4) Client Employee Module
Already implemented:
- Child application routes (dashboard, wallet, coupons, profile, etc.) are protected using `canActivate: [AuthguardService]` on parent route.
- OTP + captcha based login flow before session establishment.
- Role/userType decision sends CPOC to project path and employee to client employee dashboard.

Evidence:
- `src/app/client-employee/client-employee-routing.module.ts`
- `src/app/client-employee/login/login.component.ts`

## Gaps and Security Risks (Current State)

### Cross-cutting risks
- No strict role-based route guard: current guard checks only if a user is "logged in", not whether role is allowed for a route.
- No token expiry validation on client side (JWT `exp` is not checked before use).
- No refresh-token/session-rotation strategy in frontend.
- Token and user profile are stored in browser `sessionStorage`, which remains vulnerable to XSS token theft if XSS occurs.
- No centralized 401/403 handling policy in interceptor (for forced logout, re-auth, forbidden view).
- No route `canLoad`/`canMatch` guards to prevent lazy module loading for unauthorized users.

### Module-specific risks

Superadmin:
- Superadmin access relies mainly on navigation logic and generic auth check, not strict role guard enforcement at each route.

Project (CPOC):
- Project routes are not explicitly role-guarded by CPOC role checks; authenticated non-CPOC users may attempt path access.

Client Employee:
- Employee-only routes depend on generic auth guard and login redirection, not explicit role authorization.

## Recommended Future Additions (What Should Be Added)

## Priority 1 (High)
1. Add role-based route guards.
- Create dedicated guards such as `RoleGuard` and enforce allowed roles per route.
- Example: Superadmin routes allow only `ADMIN`; project routes allow only `CPOC`; employee routes allow only `EMPLOYEE`.

2. Strengthen interceptor security handling.
- On `401`: clear session and redirect to login.
- On `403`: show forbidden page and block route action.
- Add consistent error logging/telemetry hooks.

3. Add token validation utility.
- Decode JWT safely.
- Validate expiration (`exp`) and reject stale tokens before API call/navigation.

4. Move from browser token storage to safer model where possible.
- Preferred: backend `HttpOnly`, `Secure`, `SameSite` cookie session tokens.
- If migration is not immediate, harden CSP and sanitize all dynamic content to reduce XSS risk.

## Priority 2 (Medium)
1. Add `canLoad`/`canMatch` guards on lazy modules.
- Prevent unauthorized modules from being loaded at all.

2. Add frontend rate-limit UX and lockout state handling.
- Centralize handling for "too many attempts" responses.
- Add controlled retry timers and friendly lockout messaging.

3. Add a centralized AuthState service.
- Single source of truth for current user, role, login state, and logout.
- Reduce repeated direct `sessionStorage` parsing across components.

4. Enforce secure headers and CSP from backend/deployment.
- Content Security Policy, `X-Frame-Options`, `X-Content-Type-Options`, strict transport settings.

## Priority 3 (Hardening)
1. Audit logging and admin actions traceability.
- Track sensitive actions (role changes, wallet actions, user creation/deactivation) with immutable audit records.

2. Step-up authentication for critical operations.
- Require fresh OTP/re-auth for high-risk actions (e.g., wallet transfer, role changes, destructive admin operations).

3. Standardize input validation and output encoding.
- Keep strong backend validation and add strict frontend sanitization for rich-text inputs.

4. Add security tests in CI.
- Unit tests for guards and interceptor behavior.
- E2E tests for unauthorized route access, role denial, token expiry, and forced logout.

## Module-Wise Security Checklist

### Superadmin
Already added:
- Authenticated route protection.
- Captcha + credential login.
- JWT attachment via interceptor.

Should add:
- `ADMIN`-only guard for all superadmin routes.
- Step-up auth for sensitive admin actions.
- Detailed audit logs for admin operations.

### Project (CPOC)
Already added:
- Authenticated access and CPOC navigation flow.
- JWT attachment via interceptor.

Should add:
- `CPOC`-only guard on every project route.
- Client/company ownership checks before showing project data.
- Unauthorized fallback page for cross-client access attempts.

### Client Employee
Already added:
- OTP + captcha login.
- Parent guarded routes after login.
- JWT attachment via interceptor.

Should add:
- `EMPLOYEE`-only guard for employee routes.
- Stronger account/session controls (idle timeout, token expiry handling).
- Better anti-automation controls (backend-driven captcha, throttling feedback).

## Suggested Implementation Order
1. Build `RoleGuard` + route metadata (`data: { roles: [...] }`) and apply to all module routes.
2. Upgrade `AuthInterceptor` to handle `401/403` globally.
3. Add token-expiry validation helper and integrate with guard/interceptor.
4. Refactor repeated session parsing into one auth state service.
5. Add unit/e2e security test coverage.
