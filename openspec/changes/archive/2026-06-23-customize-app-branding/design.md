## Context

The expense tracker stores all user configuration — Google client ID, sheet ID, currency, receipt upload toggle, app mode — as a single base64-encoded JSON blob in the `?cfg=` URL query parameter. On page load, `_applyUrlConfig` decodes the blob, writes values to `localStorage`, and redirects to the clean URL. On setup save, `_buildConfigUrl` encodes all config fields back into the blob and redirects to the resulting URL. This means the URL is always a fully self-contained bookmark.

App branding (title + logo) should follow the exact same pattern so a shared or bookmarked URL carries the branding automatically, without requiring localStorage.

## Goals / Non-Goals

**Goals:**
- Add `appTitle` (string) and `appIcon` (emoji string or base64 data-URI string) fields to the `cfg` JSON blob.
- Apply the title to `document.title` and `<meta name="apple-mobile-web-app-title">` at load time.
- Apply the icon as a dynamically injected `<link rel="icon">` (and `<link rel="apple-touch-icon">`) at load time.
- Expose both fields in the Setup screen so the user can configure them without hand-crafting a URL.
- Persist both fields through `_buildConfigUrl` so they survive navigation and settings changes.

**Non-Goals:**
- Dynamic PWA manifest patching (`manifest.json` is static; PWA install name will not reflect custom title).
- Server-side rendering or pre-rendering of the custom title/favicon.
- Image cropping, resizing, or any server-side image processing.
- Favicon format conversion (the browser renders whatever data-URI is given).

## Decisions

### D1 — Store branding in the existing `cfg` blob, not a separate URL param

**Decision**: Extend the existing `?cfg=` base64 JSON with two optional fields: `appTitle` and `appIcon`.

**Rationale**: All config is already in `cfg`. Adding a second param would require a second encode/decode path and would break the invariant that one param = one bookmark. The `cfg` blob is already variable-length; a base64 image adds size but URLs support several KB without issue for typical favicon images.

**Alternative considered**: Separate `?title=` and `?icon=` params (plain or base64). Rejected because it fragments the config contract and duplicates the round-trip logic.

### D2 — Icon field accepts either an emoji character or a base64 data-URI

**Decision**: `appIcon` is a raw string. The app detects which type it is at render time:
- If `appIcon.length <= 2` (single emoji, possibly with variation selector), treat as emoji.
- Otherwise, treat as a base64 data-URI (e.g. `data:image/png;base64,...`).

For emoji favicon injection, render the emoji onto an offscreen `<canvas>` and use `canvas.toDataURL()` to produce a PNG data-URI, then set it as `<link rel="icon">`.

**Rationale**: A single field keeps the URL config schema flat. The two-character heuristic is robust for all standard emoji (including ZWJ sequences up to ~8 chars — we use `<= 10` chars as the emoji threshold to be safe). Canvas-rendered emoji favicon is a well-known technique, works cross-browser, and requires no external libraries.

**Alternative considered**: Two separate fields `appIconType: "emoji"|"image"` and `appIconValue`. Rejected as unnecessary complexity.

### D3 — Apply branding on every page load, not just after setup

**Decision**: After `_applyUrlConfig` runs (or if no `?cfg=` param, after reading from `localStorage`), call a new `_applyBranding()` method that sets `document.title` and injects the favicon `<link>` tags. This runs unconditionally so the branding is always live.

**Rationale**: The title and favicon must be applied before the user sees the page. Doing it in `_applyUrlConfig` (which runs synchronously at init) ensures no flash of the default branding.

### D4 — Image upload in Setup uses FileReader to produce a base64 data-URI client-side

**Decision**: The Setup screen "Upload image" button opens a file picker. On selection, `FileReader.readAsDataURL()` converts the file to a base64 data-URI in-browser with no server round-trip.

**Rationale**: Consistent with the app's zero-backend-required design philosophy. All data stays on the client.

**Alternative considered**: Linking to an external image URL. Rejected because external URLs break when offline and the image would not be self-contained in the bookmark URL.

## Risks / Trade-offs

- **URL length bloat** — A 32×32 PNG favicon base64-encoded is ~2–5 KB, adding ~3–7 KB to the URL. Modern browsers and servers handle URLs up to 8 KB comfortably, but very large images could exceed this. → Mitigation: Warn the user in the Setup UI if the icon data-URI exceeds a soft limit (e.g. 10 KB). Do not enforce a hard block.
- **Emoji favicon rendering** — Canvas emoji rendering is font-dependent; the emoji may look slightly different across OS. → Acceptable trade-off; emoji are decorative.
- **`localStorage` vs URL divergence** — Branding fields are NOT written to `localStorage`. On a fresh load without `?cfg=`, branding will be absent. This is intentional and matches the stated requirement that branding lives in the URL, not localStorage.
- **`_buildConfigUrl` called from multiple places** — Any call path that rebuilds the config URL must carry the existing `appTitle`/`appIcon` values through. → Mitigation: Read current values from the in-memory app state (not re-parsed from localStorage) when building the URL.

## Migration Plan

1. No migration needed — new fields are optional additions to the existing `cfg` JSON.
2. Existing bookmarked URLs without `appTitle`/`appIcon` continue to work; defaults are the current hardcoded title and favicon.
3. Rollback: simply remove the new fields from `_applyUrlConfig`, `_buildConfigUrl`, and the Setup UI. Existing URLs with the extra fields will silently ignore them.

## Open Questions

- Should the in-app header show the custom app title (replacing "Expense Tracker" in the nav bar)? Assumed **yes** — the spec captures this.
- Should there be a "Reset to default" button in Setup for branding? Assumed **yes** — clearing the fields reverts to defaults.
