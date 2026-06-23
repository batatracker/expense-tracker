# app-branding Specification

## Purpose
TBD - created by archiving change customize-app-branding. Update Purpose after archive.
## Requirements
### Requirement: App title is customizable via URL config
The system SHALL read an optional `appTitle` string from the `cfg` URL parameter. When present, it SHALL set `document.title` and `<meta name="apple-mobile-web-app-title">` to that value on every page load. When absent, the system SHALL fall back to the default hardcoded title.

#### Scenario: Custom title applied on load
- **WHEN** the page loads with a `?cfg=` parameter containing a non-empty `appTitle` field
- **THEN** `document.title` is set to the value of `appTitle`
- **AND** the `<meta name="apple-mobile-web-app-title">` content attribute is updated to the same value

#### Scenario: Default title used when appTitle is absent
- **WHEN** the page loads with a `?cfg=` parameter that does not contain `appTitle`
- **THEN** `document.title` retains its default value ("Expense Tracker")

#### Scenario: Custom title survives navigation to sub-routes
- **WHEN** the user navigates between views (dashboard, list, entry) after a custom title was applied
- **THEN** `document.title` continues to reflect the custom title

### Requirement: App icon is customizable via URL config
The system SHALL read an optional `appIcon` string from the `cfg` URL parameter. When present, it SHALL dynamically inject or replace the `<link rel="icon">` element in `<head>`. When absent, the static favicon from `index.html` is used as-is.

`appIcon` SHALL support two formats:
- **Emoji**: a string of 10 characters or fewer. The system SHALL render the emoji onto an offscreen `<canvas>` and use the resulting PNG data-URI as the favicon.
- **Base64 image**: a string longer than 10 characters (a `data:image/...;base64,...` data-URI). The system SHALL use the string directly as the favicon `href`.

#### Scenario: Emoji icon applied as favicon
- **WHEN** `appIcon` is a string of 10 characters or fewer (e.g. `"💸"`)
- **THEN** the system renders the emoji onto a 64×64 canvas
- **AND** injects a `<link rel="icon">` with the resulting `data:image/png;base64,...` data-URI as `href`

#### Scenario: Base64 image applied as favicon
- **WHEN** `appIcon` is a string longer than 10 characters (a data-URI)
- **THEN** the system injects a `<link rel="icon">` with that data-URI as `href`
- **AND** also injects a `<link rel="apple-touch-icon">` with the same `href`

#### Scenario: Default favicon used when appIcon is absent
- **WHEN** the page loads with no `appIcon` in the `cfg` parameter
- **THEN** the existing static `<link rel="icon">` from `index.html` remains unchanged

### Requirement: Branding fields are persisted in the config URL
The system SHALL include `appTitle` and `appIcon` in the base64-encoded `cfg` JSON produced by `_buildConfigUrl` whenever those values are set. This ensures that rebuilding the URL (e.g. after a settings change) does not drop the branding.

#### Scenario: Branding survives a settings save
- **WHEN** the user opens Setup and saves a settings change (e.g. updates currency)
- **AND** a custom `appTitle` or `appIcon` was previously set
- **THEN** the new `?cfg=` URL still contains the same `appTitle` and `appIcon` values

#### Scenario: Omitted when not set
- **WHEN** no custom `appTitle` or `appIcon` has been configured
- **THEN** neither field appears in the `cfg` JSON blob (URL stays compact)

### Requirement: Setup screen exposes branding configuration
The system SHALL provide an "App Branding" section in the Setup screen with:
- A text input for **App Title** (placeholder: current default title).
- An **App Icon** control that accepts either a typed/pasted emoji or an uploaded image file (jpg/png/gif/webp/svg, max display warning at 10 KB data-URI).
- A **Preview** that shows the current icon as it will appear.
- A **Reset to defaults** action that clears both fields and removes them from the `cfg` URL.

#### Scenario: User sets a custom title
- **WHEN** the user types a title in the App Title input and saves Setup
- **THEN** the page reloads with the new title reflected in `document.title` and in the nav bar

#### Scenario: User sets an emoji icon
- **WHEN** the user types or pastes a single emoji into the App Icon field and saves Setup
- **THEN** the emoji is stored as `appIcon` in the `cfg` URL
- **AND** the favicon updates to a canvas-rendered version of that emoji

#### Scenario: User uploads an image icon
- **WHEN** the user clicks the upload button, selects an image file, and saves Setup
- **THEN** the image is converted client-side to a base64 data-URI
- **AND** stored as `appIcon` in the `cfg` URL
- **AND** the favicon updates to display that image

#### Scenario: User resets branding to defaults
- **WHEN** the user clicks "Reset to defaults" in the App Branding section and saves
- **THEN** `appTitle` and `appIcon` are removed from the `cfg` URL
- **AND** the page reverts to the default title and favicon

#### Scenario: Large image warning
- **WHEN** the user uploads an image whose base64 data-URI exceeds 10 KB
- **THEN** the system displays a warning indicating the URL may be very long
- **AND** still allows the user to save (no hard block)

### Requirement: In-app header reflects custom title
The system SHALL display the custom `appTitle` (when set) in place of the default app name wherever the app name appears in the UI (e.g. the top navigation bar or screen headers).

#### Scenario: Custom title shown in nav bar
- **WHEN** `appTitle` is set and the app is loaded
- **THEN** the navigation bar or screen header displays the custom title instead of "Expense Tracker"

