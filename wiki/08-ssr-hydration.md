# SSR & Hydration Best Practices

This page documents how to avoid hydration mismatches and ensure consistent rendering between server and client in Next.js.

---

## 1. Deterministic Random Values
- Use seeded random functions or `useMemo` for client-only randomization.
- Avoid `Math.random()` directly in render for SSR components.

## 2. Client-Only Animations
- Use `useEffect` or `useMemo` to trigger animations only after mount.
- Example: In `coming-soon-page.tsx`, use `useMemo` for streak values.

## 3. Consistent Initial State
- Ensure initial state matches between SSR and client.
- Avoid state that changes on mount unless wrapped in `useEffect`.

## 4. Testing
- Check for hydration warnings in the console.
- Use Next.js dev mode to spot mismatches.

---

_Last updated: February 23, 2026_
