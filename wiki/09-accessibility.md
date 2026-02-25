# Accessibility & Semantic HTML

This page documents best practices for accessible and semantic UI in RoadRulez.

---

## 1. Semantic Elements
- Use `<button>`, `<a>`, `<form>`, `<input>` for interactive elements.
- Avoid using `<div>` for clickable areas unless necessary, and add ARIA roles.

## 2. ARIA Roles & Attributes
- Add `role`, `aria-label`, and `aria-live` where needed.
- Example: `role="button"` for divs acting as buttons.

## 3. Keyboard Navigation
- Ensure all interactive elements are focusable and usable via keyboard.
- Use `tabIndex` and handle `onKeyDown` for custom controls.

## 4. Color Contrast & Text
- Use accessible color contrast for text and backgrounds.
- Test with tools like axe or Lighthouse.

## 5. Testing
- Use browser accessibility tools and screen readers.
- Check for missing alt text, labels, and focus indicators.

---

_Last updated: February 23, 2026_
