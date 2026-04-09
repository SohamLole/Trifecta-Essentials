# SnapSense

SnapSense is a production-style MVP for organizing screenshots with OCR, automatic keyword tags, fast search, and account-based access. It ships as a small workspace with:

- `server`: Express, MongoDB, Mongoose, Multer, Tesseract.js, JWT auth
- `client`: React, React Router, Axios, CSS modules, Google OAuth UI

## Features

- Upload PNG and JPG screenshots
- Store images locally in `server/uploads`
- Extract text with Tesseract OCR
- Auto-generate tags like `bug`, `ui`, `notes`, `auth`, and `api`
- Generate a quick issue diagnosis with category, difficulty, and suggested fixes
- Generate individual issue entries with detailed tags such as `authentication bug`, `runtime bug`, or `network bug`
- Infer bug locations from OCR text when file paths, endpoints, stack frames, or line references are visible
- Sign up with unique username + email + hashed password
- Log in with username or email and password
- Continue with Google OAuth
- Protect screenshot data per authenticated user
- Search by extracted text or tags
- Search by extracted text, tags, and generated issue summaries
- Sort screenshots by date or estimated difficulty
- Filter by tag, paginate results, and switch between grid/list views
- Edit tags manually from the detail page
- Delete screenshots and clean up the uploaded file
- Responsive UI with loading, empty, and error states

## Project Structure

```text
.
+-- client
|   +-- src
|   |   +-- components
|   |   +-- pages
|   |   +-- services
|   |   `-- styles
+-- server
|   +-- config
|   +-- controllers
|   +-- middlewares
|   +-- models
|   +-- routes
|   +-- uploads
|   `-- utils
`-- package.json
```

## Prerequisites

- Node.js 18+
- npm 9+
- A local MongoDB instance, or a MongoDB Atlas connection string

## Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On Windows PowerShell you can use:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

3. Update `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/snapsense
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=5
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

4. Update `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

5. Start both apps:

```bash
npm run dev
```

6. Open the frontend at `http://localhost:5173`

## Available Scripts

- `npm run dev`: starts React and Express together
- `npm run build`: builds the frontend for production
- `npm run start`: starts the backend in production mode

## API Overview

All screenshot endpoints require `Authorization: Bearer <jwt>`.

### `POST /api/auth/signup`

Creates a user with a unique username and a bcrypt-hashed password.

Request body:

```json
{
  "username": "alice_dev",
  "email": "alice@example.com",
  "password": "strong-password-123"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "6614fd7d53d7dbe7d81e6f52",
      "username": "alice_dev",
      "email": "alice@example.com",
      "avatarUrl": "",
      "hasPassword": true,
      "hasGoogleAuth": false,
      "createdAt": "2026-04-09T08:12:27.321Z",
      "updatedAt": "2026-04-09T08:12:27.321Z"
    }
  }
}
```

### `POST /api/auth/login`

Logs in with username or email plus password.

Request body:

```json
{
  "identifier": "alice_dev",
  "password": "strong-password-123"
}
```

### `POST /api/auth/google`

Exchanges a Google ID token for a SnapSense JWT.

Request body:

```json
{
  "credential": "google-id-token"
}
```

### `GET /api/auth/me`

Returns the currently authenticated user.

### `POST /api/screenshots/upload`

Uploads an image, runs OCR, generates tags, and stores the screenshot.

Form data:

- `screenshot`: image file

Sample response:

```json
{
  "success": true,
  "message": "Screenshot uploaded successfully.",
  "data": {
    "_id": "6614fd7d53d7dbe7d81e6f52",
    "imageUrl": "/uploads/1712655747012-205743991.png",
    "extractedText": "TypeError: Cannot read properties of undefined",
    "issueCategory": "bug",
    "difficulty": "hard",
    "difficultyScore": 3,
    "issueSummary": "Potential application error detected from the screenshot text. Key signals: typeerror, cannot read properties. Estimated difficulty: hard.",
    "suggestedFixes": [
      "Check the stack trace or nearby logs to isolate the failing line or component.",
      "Guard against undefined or null values before accessing nested properties."
    ],
    "matchedSignals": ["typeerror", "cannot read properties"],
    "detailedTags": ["runtime bug"],
    "primaryLocation": "src/components/AuthForm.jsx:42:13",
    "issues": [
      {
        "title": "Runtime property access error",
        "category": "bug",
        "detailedTag": "runtime bug",
        "location": "src/components/AuthForm.jsx:42:13",
        "evidence": "TypeError: Cannot read properties of undefined at src/components/AuthForm.jsx:42:13",
        "matchedSignals": ["typeerror", "cannot read properties", "undefined"],
        "suggestedFixes": [
          "Trace the variable that becomes undefined or null before the failing property access.",
          "Add defensive checks or default values before reading nested properties."
        ]
      }
    ],
    "tags": ["bug"],
    "owner": "6614f00053d7dbe7d81e6f10",
    "createdAt": "2026-04-09T08:12:27.321Z",
    "updatedAt": "2026-04-09T08:12:27.321Z",
    "__v": 0
  },
  "warning": null
}
```

### `GET /api/screenshots?page=1&limit=9&tag=bug&sortBy=difficulty&sortOrder=desc`

Fetches screenshots with optional pagination, tag filtering, and sorting by `date` or `difficulty`.

Sample response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "6614fd7d53d7dbe7d81e6f52",
      "imageUrl": "/uploads/1712655747012-205743991.png",
      "extractedText": "TypeError: Cannot read properties of undefined",
      "issueCategory": "bug",
      "difficulty": "hard",
      "difficultyScore": 3,
      "issueSummary": "Potential application error detected from the screenshot text. Key signals: typeerror, cannot read properties. Estimated difficulty: hard.",
      "tags": ["bug"],
      "owner": "6614f00053d7dbe7d81e6f10",
      "createdAt": "2026-04-09T08:12:27.321Z",
      "updatedAt": "2026-04-09T08:12:27.321Z",
      "__v": 0
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 9,
    "totalPages": 1
  }
}
```

### `GET /api/screenshots/search?q=design&sortBy=date&sortOrder=desc`

Searches extracted text, tags, issue summary, issue category, and suggested fixes for a keyword.

Sample response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "661500e453d7dbe7d81e6f59",
      "imageUrl": "/uploads/1712656612981-182004111.jpg",
      "extractedText": "UI design review for the onboarding flow",
      "issueCategory": "ui",
      "difficulty": "medium",
      "difficultyScore": 2,
      "issueSummary": "The screenshot looks like a UI or layout issue. Key signals: design, ui. Estimated difficulty: medium.",
      "tags": ["ui"],
      "owner": "6614f00053d7dbe7d81e6f10",
      "createdAt": "2026-04-09T08:26:52.402Z",
      "updatedAt": "2026-04-09T08:26:52.402Z",
      "__v": 0
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 9,
    "totalPages": 1
  }
}
```

### `GET /api/screenshots/:id`

Returns one screenshot for the detail view.

### `GET /api/screenshots/:id/image`

Streams the screenshot image for the authenticated owner. The frontend uses this protected endpoint
instead of exposing the upload folder publicly.

### `PUT /api/screenshots/:id`

Updates tags manually.

Request body:

```json
{
  "tags": ["bug", "backend", "urgent"]
}
```

Sample response:

```json
{
  "success": true,
  "message": "Tags updated successfully.",
  "data": {
    "_id": "6614fd7d53d7dbe7d81e6f52",
    "imageUrl": "/uploads/1712655747012-205743991.png",
    "extractedText": "TypeError: Cannot read properties of undefined",
    "tags": ["bug", "backend", "urgent"],
    "owner": "6614f00053d7dbe7d81e6f10",
    "createdAt": "2026-04-09T08:12:27.321Z",
    "updatedAt": "2026-04-09T08:35:49.931Z",
    "__v": 0
  }
}
```

### `DELETE /api/screenshots/:id`

Deletes the screenshot record and its local file.

Sample response:

```json
{
  "success": true,
  "message": "Screenshot deleted successfully."
}
```

## Tagging Logic

SnapSense keeps tagging intentionally simple for the MVP:

- `bug`: `error`, `undefined`, `exception`, `failed`, `crash`
- `ui`: `ui`, `design`, `layout`, `button`, `component`, `css`
- `notes`: `note`, `summary`, `todo`, `meeting`, `idea`
- `auth`: `login`, `signup`, `password`, `otp`, `verify`
- `api`: `api`, `request`, `response`, `endpoint`, `payload`, `json`

If OCR finds text but none of the rule sets match, the app assigns `general`.

## Issue Analysis

Each uploaded screenshot now gets lightweight issue enrichment derived from OCR text and generated tags:

- `issueCategory`: primary category aligned to the strongest generated tag
- `difficulty`: estimated as `easy`, `medium`, or `hard`
- `issueSummary`: short explanation of what the screenshot likely represents
- `suggestedFixes`: actionable next-step suggestions
- `matchedSignals`: keywords and phrases that triggered the diagnosis
- `detailedTags`: expanded issue tags for each detected issue type
- `primaryLocation`: best inferred single location for the screenshot's main issue
- `issues`: per-issue breakdown including title, detailed tag, location, evidence, and suggested fixes

## Security and Validation

- JWT-based authentication for protected routes
- Bcrypt password hashing for local accounts
- Google ID token verification on the server
- Unique username and unique email enforcement
- Screenshot ownership checks on every screenshot read/write request
- File type validation for PNG and JPG uploads
- File size limit through Multer
- Helmet for secure HTTP headers
- Rate limiting on the API
- Express Validator for IDs, pagination, and tag updates
- Mongo sanitization and regex escaping for safer search queries
- OCR failures are handled gracefully so the server does not crash

## Notes

- OCR accuracy depends on screenshot quality and text clarity.
- Uploaded files are stored locally for MVP simplicity.
- `GET /api/screenshots/:id` and `GET /api/screenshots/:id/image` are included for the frontend detail experience and protected image rendering.
