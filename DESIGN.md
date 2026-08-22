# Design System: Emballage direct order

## 1. Visual theme and atmosphere

A **Swiss industrial print** storefront for small merchants: calm, tactile, direct, and operational. The interface should feel like a carefully typeset product label rather than a generic ecommerce template. Use moderate asymmetry, visible structural rules, generous whitespace, and a small amount of material grain. The target profile is **variance 6, motion 3, density 4**: distinctive enough to be memorable, restrained enough to build trust on a mobile connection.

## 2. Color palette and roles

- **Paper substrate** (`#F4F1EA`) — page canvas and primary background.
- **Warm surface** (`#FFFDF8`) — product image well, facts, and form controls.
- **Carbon ink** (`#161616`) — primary text, navigation metadata, and primary action.
- **Muted graphite** (`#68645D`) — descriptions, helper text, and secondary metadata.
- **Structural line** (`#D7D0C5`) — dividers, frames, and input borders.
- **Aviation red** (`#B53B31`) — the single accent for product labels, focus, errors, and high-priority status.

Do not introduce a second bright accent. Never use pure black, neon gradients, purple-blue AI gradients, or heavy black shadows. Keep surfaces opaque and readable.

## 3. Typography rules

Use a characterful sans-serif when the host can provide one, with a strong system fallback. Headlines are large but controlled, tight-tracked, sentence case, and balanced with `text-wrap: balance`. Body copy is comfortable and constrained to approximately 42–65 characters per line. Prices, references, and metadata use a monospace stack with tabular figures. Avoid Inter, generic browser defaults as the only choice, all-caps for every heading, and decorative serif typography in the product UI.

## 4. Component styling

**Primary action:** A compact carbon-ink rectangle with a 6px radius, white text, and aviation-red hover state. The button must have a visible disabled/loading state and a tactile 1px pressed translation. Do not use a large pill button.

**Product frame:** A double-bezel structure: a soft paper-toned outer shell with a 1px line, 10px padding, and a warm surface inner image well. The image should use `object-fit: contain`, a meaningful Arabic alt description, and a stable minimum height.

**Facts:** Use a two-cell grid separated by a single structural line. Facts should read as a label/value system, not as floating cards.

**Form:** Place labels above inputs. Use native autocomplete hints, visible focus rings in the accent color, inline error text, and a live status region. Do not use browser alerts. The form must remain usable with keyboard and touch input.

**Loading, empty, and error states:** Show a button loading label while submitting, a composed setup message if the order endpoint is unavailable, and direct inline errors for every invalid field. Avoid generic circular spinners.

## 5. Layout principles

Use a max-width container of approximately 1180px. The desktop hero is an asymmetric two-column grid with the product story on one side and the product image on the other. The order section changes rhythm through a second grid and a strong horizontal rule. Below 760px, collapse to one column with a generous vertical gap and no horizontal overflow. Full-height sections use `min-height: 100dvh`, never `100vh`.

Use visible lines as the organizing system. Cards exist only when a frame communicates a real hierarchy. Avoid three equal feature cards, dashboard sidebars, centered hero defaults, excessive rounded containers, and mathematically dense flexbox hacks.

## 6. Motion and interaction

Motion is quiet and functional. Use 200–260ms transitions with a physical ease curve for hover and pressed states. Animate only `transform` and `opacity`. Respect `prefers-reduced-motion`. Do not use auto-playing decorative motion, custom cursors, large parallax effects, or layout-triggering animations.

## 7. Accessibility and responsive behavior

Maintain RTL semantics with `<html lang="ar" dir="rtl">`. All controls need a programmatic label. Focus indicators must remain visible. Touch targets should be at least 44px high. Error messages must be text, not color alone. Product imagery needs descriptive alt text. The page should be legible at normal phone size without requiring zoom.

## 8. Anti-patterns

Never use emojis in interface copy, Inter as the only premium typeface, pure black, neon outer glows, purple-blue AI gradients, generic 3-column card rows, placeholder names, fake statistics, lorem ipsum, `alert()`, unresolved template placeholders, public Telegram file URLs containing bot credentials, or client-side calls directly to the Telegram Bot API.
