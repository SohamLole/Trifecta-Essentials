# SnapSense — AI-Powered Screenshot Intelligence

SnapSense is a Micro SaaS application that transforms your screenshots into a searchable knowledge base. Instead of manually browsing folders, SnapSense uses OCR and smart tagging to help you instantly find what you’re looking for. It takes your screenshots and uses OCR Text Extraction to extract insights relevant to your content and generates tags which can be individually searched and included into composite and complex search queries to save time and effort in organizing and refining several bugs, errors and such coding information. It organizes bugs errors and similar issues into tags and which contain rudimentary information regarding the tag. It finally organizes the tags according to their content(date of occurrence, location and context).

---

# Features

## Screenshot Upload

* Upload PNG/JPG screenshots
* Images stored locally with metadata in database

## OCR Text Extraction

* Extracts text from screenshots using Tesseract.js
* Stores extracted content for indexing and search

## Smart Tagging

* Automatic tag generation based on keywords
* Example:

  * “error”, “undefined” → `#bug`
  * “UI”, “design” → `#ui`
* Manual tag editing supported

## Search

* Keyword-based search across:

  * Extracted text
  * Tags
* Fast retrieval of relevant screenshots

## Dashboard

* Grid/List view of screenshots
* Displays:

  * Image preview
  * Extracted text snippet
  * Tags
  * Upload date

---

# Tech Stack

## Frontend

* ReactJS (Hooks + Functional Components)
* Axios for API calls
* TailwindCSS / CSS Modules
* Responsive UI design

## Backend

* Node.js + Express.js
* RESTful API
* Middleware for validation & error handling

## Database

* MongoDB with Mongoose
* Stores screenshots metadata and extracted data

---

#Project Structure

```
root/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middlewares/
│   ├── utils/
│   └── server.js
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── App.js
│
└── README.md
```

---

# Database Schema

## Screenshot Model

```
{
  imageUrl: String,
  extractedText: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

# API Endpoints

## Upload Screenshot

```
POST /api/screenshots/upload
```

* Upload image
* Extract text (OCR)
* Auto-generate tags
* Save to database

---

## Get All Screenshots

```
GET /api/screenshots
```

* Supports pagination

---

## Search Screenshots

```
GET /api/screenshots/search?q=keyword
```

* Searches text + tags

---

## Update Tags

```
PUT /api/screenshots/:id
```

---

## Delete Screenshot

```
DELETE /api/screenshots/:id
```

---

# Setup Instructions

## 1. Clone Repository

```
git clone https://github.com/your-username/snapsense.git
cd snapsense
```

---

## 2. Backend Setup

```
cd server
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Run server:

```
npm run dev
```

---

## 3. Frontend Setup

```
cd client
npm install
npm start
```

---

# Security & Validation

* File type validation (only images allowed)
* File size limits
* Input validation using middleware
* Centralized error handling
* Environment variables for sensitive data

---

# Future Improvements

* Semantic search using embeddings
* AI-based screenshot classification
* Link related screenshots
* Error fix suggestions
* Integrations (VS Code, Chrome Extension)# SnapSense — AI-Powered Screenshot Intelligence

SnapSense is a Micro SaaS application that transforms your screenshots into a searchable knowledge base. Instead of manually browsing folders, SnapSense uses OCR and smart tagging to help you instantly find what you’re looking for. It takes your screenshots and uses OCR Text Extraction to extract insights relevant to your content and generates tags which can be individually searched and included into composite and complex search queries to save time and effort in organizing and refining several bugs, errors and such coding information. It organizes bugs errors and similar issues into tags and which contain rudimentary information regarding the tag. It finally organizes the tags according to their content(date of occurrence, location and context).

---

# Features

## Screenshot Upload

* Upload PNG/JPG screenshots
* Images stored locally with metadata in database

## OCR Text Extraction

* Extracts text from screenshots using Tesseract.js
* Stores extracted content for indexing and search

## Smart Tagging

* Automatic tag generation based on keywords
* Example:

  * “error”, “undefined” → `#bug`
  * “UI”, “design” → `#ui`
* Manual tag editing supported

## Search

* Keyword-based search across:

  * Extracted text
  * Tags
* Fast retrieval of relevant screenshots

## Dashboard

* Grid/List view of screenshots
* Displays:

  * Image preview
  * Extracted text snippet
  * Tags
  * Upload date

---

# Tech Stack

## Frontend

* ReactJS (Hooks + Functional Components)
* Axios for API calls
* TailwindCSS / CSS Modules
* Responsive UI design

## Backend

* Node.js + Express.js
* RESTful API
* Middleware for validation & error handling

## Database

* MongoDB with Mongoose
* Stores screenshots metadata and extracted data

---

#Project Structure

```
root/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middlewares/
│   ├── utils/
│   └── server.js
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── App.js
│
└── README.md
```

---

# Database Schema

## Screenshot Model

```
{
  imageUrl: String,
  extractedText: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

# API Endpoints

## Upload Screenshot

```
POST /api/screenshots/upload
```

* Upload image
* Extract text (OCR)
* Auto-generate tags
* Save to database

---

## Get All Screenshots

```
GET /api/screenshots
```

* Supports pagination

---

## Search Screenshots

```
GET /api/screenshots/search?q=keyword
```

* Searches text + tags

---

## Update Tags

```
PUT /api/screenshots/:id
```

---

## Delete Screenshot

```
DELETE /api/screenshots/:id
```

---

# Setup Instructions

## 1. Clone Repository

```
git clone https://github.com/your-username/snapsense.git
cd snapsense
```

---

## 2. Backend Setup

```
cd server
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Run server:

```
npm run dev
```

---

## 3. Frontend Setup

```
cd client
npm install
npm start
```

---

# Security & Validation

* File type validation (only images allowed)
* File size limits
* Input validation using middleware
* Centralized error handling
* Environment variables for sensitive data

---

# Future Improvements

* Semantic search using embeddings
* AI-based screenshot classification
* Link related screenshots
* Error fix suggestions
* Integrations (VS Code, Chrome Extension)
