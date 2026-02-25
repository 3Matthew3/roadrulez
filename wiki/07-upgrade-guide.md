# Upgrade Guide

This guide explains how to safely upgrade dependencies and modernize your RoadRulez project.

---

## 1. Check for Outdated Dependencies

Run:

```
powershell -ExecutionPolicy RemoteSigned -Command "npm outdated"
```

## 2. Upgrade Major Libraries

- Next.js: `npm install next@latest`
- React: `npm install react@latest react-dom@latest`
- Prisma: `npm install prisma@latest @prisma/client@latest`
- Other: `npm install <package>@latest`

## 3. Review Breaking Changes

- Check release notes for each library.
- Update code for new APIs and removed features.

## 4. Test Thoroughly

- Run `npm run dev` and `npm run test`.
- Check SSR, routing, and admin panel for issues.

## 5. Commit and Document

- Commit changes with clear messages.
- Update this guide as needed.

---

## Tips
- Upgrade one major library at a time.
- Use version control to revert if needed.
- Always test after each upgrade.

---

_Last updated: February 23, 2026_
