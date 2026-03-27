# Security Tracker (Client Share)

## Status Table

| Area | Done | In Progress | Planned |
|---|---|---|---|
| Superadmin | Login with captcha, JWT-based session, protected route access | Role-wise route enforcement review | Admin-only guard on all routes, 401/403 global handling, audit logs for admin actions |
| Project (CPOC) | Authenticated access, CPOC routing after login, JWT attached in API calls | CPOC permission mapping per route | CPOC-only guard, company/client ownership checks, unauthorized access fallback page |
| Client Employee | OTP + captcha login, protected dashboard routes, JWT attached in API calls | Session handling cleanup | Employee-only guard, token expiry/idle timeout handling, stronger anti-automation controls |
| Common Security | Auth interceptor, basic auth guard, session logout | Centralized auth state design | RoleGuard, token expiry validation, canLoad/canMatch guards, security test coverage (unit + E2E) |

## One-Line Summary
Core authentication is live and working; role-based authorization hardening and advanced security controls are the next planned phase.
