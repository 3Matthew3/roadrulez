# Next.js 14+ Middleware & Migration

This page documents best practices and migration tips for middleware and routing in Next.js 14+.

---

## 1. Middleware API Changes
- Review official Next.js docs for updated middleware patterns.
- Use `middleware.ts` for locale detection and admin protection.

## 2. Routing Patterns
- Use App Router for all new pages.
- Keep `[lang]` segment for locale routing.

## 3. Migration Tips
- Test middleware logic after upgrading Next.js.
- Refactor old code to match new API signatures.

## 4. Testing
- Check redirects, locale detection, and admin access.
- Use dev mode to spot routing issues.

---

_Last updated: February 23, 2026_
