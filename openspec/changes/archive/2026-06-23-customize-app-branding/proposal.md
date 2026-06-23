## Why

Users who self-host or share this expense tracker want to brand it as their own — with a custom app name and logo/favicon — without forking the codebase. Since the app's config already survives localStorage wipes by encoding everything into the `?cfg=` URL parameter as base64 JSON, branding customization should follow the same pattern so a bookmarked URL is fully self-contained.

## What Changes

- Add `appTitle` field to the `cfg` URL config object (plain string, used as `<title>`, PWA name, and visible app header label).
- Add `appIcon` field to the `cfg` URL config object (either a single emoji character **or** a base64-encoded image data-URI) used as the favicon and any in-app logo display.
- Extend the Setup screen with an "App Branding" section where the user can type a title and paste/pick an emoji or upload a small image.
- On load, apply the title to `document.title` and `<meta name="apple-mobile-web-app-title">`, and inject the icon as a `<link rel="icon">` (and apple-touch-icon if image).
- Persist the two new fields through `_buildConfigUrl` / `_applyUrlConfig` so they round-trip in the bookmark URL like all other cfg fields.

## Capabilities

### New Capabilities

- `app-branding`: Customizable app title and logo/favicon, stored as fields in the existing `?cfg=` base64 URL config. Supports emoji or small base64 image as the icon.

### Modified Capabilities

- `locale-routing`: No requirement changes — `_buildConfigUrl` implementation will be touched but existing behavior is unchanged.

## Impact

- `js/app.js` — `_applyUrlConfig`, `_buildConfigUrl`, setup screen rendering, and on-load title/favicon injection.
- `index.html` — default `<title>` and favicon `<link>` tags remain as fallbacks; dynamic overrides applied at runtime.
- `manifest.json` — not dynamically changed (PWA manifest is static); title override is DOM-only.
- No new dependencies. No breaking changes to existing `?cfg=` URLs (new fields are optional).
