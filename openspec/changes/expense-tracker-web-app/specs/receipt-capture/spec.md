## ADDED Requirements

### Requirement: User can attach a receipt to an expense
The system SHALL provide a receipt attachment section in the expense entry form that allows the user to take a photo (on mobile) or upload a file (image or PDF) from their device.

#### Scenario: Camera capture on mobile
- **WHEN** the user taps "Take Photo" on a mobile device
- **THEN** the app SHALL open the device camera via an `<input type="file" accept="image/*" capture="environment">` element, allowing the user to take a photo

#### Scenario: File upload on all devices
- **WHEN** the user taps "Upload File"
- **THEN** the app SHALL open the device file picker accepting image files (JPEG, PNG, WebP, HEIC) and PDF documents

#### Scenario: Receipt preview before save
- **WHEN** the user selects or captures a file
- **THEN** the app SHALL display a thumbnail preview (for images) or filename (for PDFs) in the form before the expense is saved, with an option to remove the attachment

### Requirement: Receipt images are compressed before upload
The system SHALL compress images client-side before uploading to Google Drive to reduce upload time on mobile connections.

#### Scenario: Image compression applied
- **WHEN** the user attaches an image file
- **THEN** the app SHALL resize it to a maximum of 1600px on the longest side and re-encode as JPEG at quality 0.82 using the Canvas API before uploading

#### Scenario: PDF files are not compressed
- **WHEN** the user attaches a PDF file
- **THEN** the app SHALL upload the PDF as-is without modification

### Requirement: Receipt file is uploaded to Google Drive and linked in the sheet
The system SHALL upload the receipt file to a folder named `Receipts` inside an `ExpenseTracker` folder in the user's Google Drive, then store the file's shareable web view URL in the expense row's Receipt URL column.

#### Scenario: Successful receipt upload
- **WHEN** the user saves an expense with a receipt attached
- **THEN** the app SHALL upload the file to `ExpenseTracker/Receipts/` in Drive using the multipart upload endpoint, set the file's sharing to "anyone with the link can view", and write the `webViewLink` to the Receipt URL column in the sheet

#### Scenario: Drive folder creation
- **WHEN** the `ExpenseTracker/Receipts` folder does not yet exist in Drive
- **THEN** the app SHALL create both folders and store their IDs in localStorage before uploading

#### Scenario: Upload failure does not block expense save
- **WHEN** the Drive upload fails (network error or API error)
- **THEN** the app SHALL save the expense to the sheet WITHOUT a receipt URL and display a non-blocking warning toast: "Expense saved, but receipt upload failed. You can retry from the expense detail."

### Requirement: User can view the receipt from the expense detail
The system SHALL display the receipt attachment in the expense detail view as a clickable link that opens the Google Drive file.

#### Scenario: Receipt link in detail view
- **WHEN** the user views an expense that has a Receipt URL
- **THEN** the app SHALL display a "View Receipt" button/link that opens the Drive file in a new browser tab

#### Scenario: No receipt attached
- **WHEN** the user views an expense with no Receipt URL
- **THEN** the receipt section SHALL show "No receipt attached" and offer an "Add Receipt" button to attach one retroactively

### Requirement: User can add or replace a receipt on an existing expense
The system SHALL allow attaching or replacing a receipt on an already-saved expense from the expense detail view.

#### Scenario: Add receipt to existing expense
- **WHEN** the user taps "Add Receipt" on an expense detail
- **THEN** the app SHALL open the file picker/camera, upload the selected file to Drive, update the Receipt URL column for that expense row in the sheet, and refresh the detail view
