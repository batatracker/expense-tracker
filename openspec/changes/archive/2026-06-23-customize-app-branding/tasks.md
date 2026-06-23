## 1. Extend Config URL Schema

- [x] 1.1 Add `appTitle` and `appIcon` as optional fields in `_applyUrlConfig` in `js/app.js` — read them from the decoded `cfg` JSON and store them on the app instance (e.g. `this.appTitle`, `this.appIcon`)
- [x] 1.2 Add `appTitle` and `appIcon` to `_buildConfigUrl` — include them in the `cfg` JSON object when set (non-empty string), so they round-trip in the bookmark URL

## 2. Branding Application on Load

- [x] 2.1 Implement `_applyBranding()` method in `js/app.js` that sets `document.title` and updates `<meta name="apple-mobile-web-app-title">` when `this.appTitle` is set
- [x] 2.2 Implement emoji-to-favicon conversion in `_applyBranding()`: detect emoji (string length ≤ 10), render onto offscreen 64×64 `<canvas>`, call `canvas.toDataURL('image/png')` to get data-URI
- [x] 2.3 Implement image favicon injection in `_applyBranding()`: for a base64 data-URI (length > 10), create/replace `<link rel="icon">` and `<link rel="apple-touch-icon">` in `<head>`
- [x] 2.4 Call `_applyBranding()` at the end of the init sequence, after `_applyUrlConfig` and localStorage reads, so branding is applied before first render

## 3. In-App UI — Header Title

- [x] 3.1 Locate where the app name ("Expense Tracker") is rendered in the nav bar / screen headers in `index.html` or `js/app.js`
- [x] 3.2 Update that render path to use `this.appTitle` when set, falling back to the default string

## 4. Setup Screen — App Branding Section

- [x] 4.1 Add an "App Branding" section to the Setup screen HTML (either in `index.html` or rendered via `js/app.js`) with a labeled text input for App Title
- [x] 4.2 Add an App Icon control: an emoji text input (single field, placeholder e.g. "💸") and a separate "Upload image" file button (accept jpg/png/gif/webp/svg)
- [x] 4.3 Implement a live icon preview in the Setup section that shows the current emoji or uploaded image thumbnail
- [x] 4.4 Wire the file upload button to `FileReader.readAsDataURL()` to convert the selected image to a base64 data-URI and store it in the icon field
- [x] 4.5 Add a size warning: if the data-URI length exceeds 10 240 characters (~10 KB), display an inline warning ("URL will be very long") without blocking save
- [x] 4.6 Add a "Reset to defaults" button that clears both `appTitle` and `appIcon` from the in-memory state and rebuilds the URL without those fields
- [x] 4.7 On Setup save, include `appTitle` and `appIcon` values when calling `_buildConfigUrl` so the resulting URL encodes the branding

## 5. Persistence Verification

- [x] 5.1 Test that navigating between views (dashboard → list → entry) preserves the custom title in `document.title`
- [x] 5.2 Test that saving a settings change (e.g. currency update) from Setup does not drop `appTitle` or `appIcon` from the new URL
- [x] 5.3 Test that loading the app with a `?cfg=` URL containing `appTitle` and `appIcon` (but no localStorage) correctly applies both
