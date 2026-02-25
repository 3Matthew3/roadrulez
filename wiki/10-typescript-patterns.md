# TypeScript Patterns & Improvements

This page documents best practices for typing and interfaces in RoadRulez.

---

## 1. Avoid `any`
- Use specific types and interfaces for all props and function arguments.
- Example: Replace `any` with defined interfaces in `lib/countries.ts`.

## 2. Use TypeScript Utility Types
- Use `Partial<T>`, `Pick<T>`, `Record<K, T>` for flexible typing.

## 3. Prop Types in Components
- Define prop interfaces for all React components.
- Example:
  ```ts
  interface MyComponentProps {
    name: string;
    age?: number;
  }
  ```

## 4. Strict Null Checks
- Enable `strictNullChecks` in `tsconfig.json`.
- Handle `undefined` and `null` explicitly.

## 5. Testing
- Run `tsc --noEmit` to check for type errors.

---

_Last updated: February 23, 2026_
