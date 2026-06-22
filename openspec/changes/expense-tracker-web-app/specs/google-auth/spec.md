## ADDED Requirements

### Requirement: User can sign in with Google
The system SHALL provide a Google OAuth 2.0 sign-in flow using Google Identity Services. The user SHALL be prompted to grant access to Google Sheets and Google Drive (drive.file scope) before any app functionality is available.

#### Scenario: First-time sign-in
- **WHEN** the user opens the app and is not authenticated
- **THEN** the app SHALL display a sign-in screen with a "Sign in with Google" button and SHALL NOT show any expense data or navigation

#### Scenario: Successful authentication
- **WHEN** the user completes the Google OAuth consent flow
- **THEN** the app SHALL store the access token in sessionStorage, display the user's name and profile picture, and navigate to the Dashboard view

#### Scenario: Token stored in sessionStorage only
- **WHEN** authentication is successful
- **THEN** the access token SHALL be stored in sessionStorage (not localStorage) so it is cleared when the browser tab is closed

### Requirement: User can sign out
The system SHALL provide a sign-out action that clears all session state and returns the user to the sign-in screen.

#### Scenario: Sign-out clears state
- **WHEN** the user taps the sign-out option
- **THEN** the app SHALL revoke the access token via the GIS library, clear sessionStorage, clear all in-memory expense data, and display the sign-in screen

### Requirement: App handles token expiry gracefully
The system SHALL detect when an API call fails due to an expired or revoked access token and prompt the user to re-authenticate.

#### Scenario: Expired token during API call
- **WHEN** a Sheets or Drive API call returns a 401 Unauthorized response
- **THEN** the app SHALL display a non-blocking notification ("Session expired — please sign in again") and redirect to the sign-in screen without losing any unsaved form data (data SHALL be preserved in component state)

### Requirement: OAuth Client ID is configurable
The system SHALL read the Google OAuth Client ID from a config constant at the top of the main JS file so it can be replaced without searching the codebase.

#### Scenario: Client ID replacement
- **WHEN** a developer sets the `GOOGLE_CLIENT_ID` constant in `config.js`
- **THEN** all OAuth and API calls SHALL use that Client ID with no other changes required
