# Campus Help Desk — Assignment 4 Mini Project

A web application designed for campus incident intake and support dispatch. Students can submit and manage campus-related problems across academic services, facilities, IT, and residential life, while desk operators can triage, update, and resolve issues.

Built strictly according to **Assignment 4** specifications with full ES Module (`"type": "module"`) architecture and high-density, anti-generic design principles.

---

## 🏛️ Design System & Negative Patterns Avoided

The application avoids standard "AI UI" and generic SaaS clichés in favor of a cohesive, institutional dispatch design system:

| Avoided Pattern | Implemented Alternative |
|---|---|
| ❌ Excessive rounded cards (20px–32px) | **Restrained geometry**: 4px–6px corner radius throughout |
| ❌ Purple/blue decorative gradients | **Solid collegiate palette**: Authority Navy (`#0f2744`) & Canvas Neutral (`#f3f5f8`) |
| ❌ Huge hero headings (48px–60px) | **Compact informational headings**: 14px–15px titles with monospace ticket counters |
| ❌ Excessive whitespace | **High information density**: Structured ledger table with inline expansions |
| ❌ Uniform button styling | **Clear button hierarchy**: Solid primary dispatch, subtle ghost/outline, semantic danger delete |
| ❌ Excessive pill-shaped buttons | **Rectangular restrained buttons** (4px radius) |
| ❌ Random / heavy drop shadows | **Crisp 1px borders** with minimal `0 1px 2px rgba(16, 24, 40, 0.05)` subtle elevation |
| ❌ Excessive glassmorphism | **Solid, legible institutional surfaces** |
| ❌ Color used without semantic meaning | **Strict priority mapping**: Urgent (crimson), High (burnt orange), Medium (amber), Low (slate) |
| ❌ Unnecessary charts | **Single-row KPI summary strip** communicating direct operational counts |

---

## 🚀 Features

### Frontend (React 19 + Vite)
- **Incident Submission Docket**:
  - Student Name (text, validated)
  - Student Email (email format validated)
  - Category (`Academic Services`, `Facilities & Maintenance`, `IT & Network Support`, `Hostel & Housing`, `Library & Labs`, `Financial & Accounts`)
  - Problem Description (textarea with length validation)
  - Priority Level (`Low`, `Medium`, `High`, `Urgent`)
- **Submitted Requests Registry (Below Form)**:
  - Full tabular ledger of all submitted requests
  - Live search across student name, email, ticket ID, description, and category
  - Category, Priority, and Status filter controls
  - Expandable problem description rows
  - Status badges (`Open`, `In Progress`, `Resolved`)
  - **Edit Modal**: Update ticket fields and lifecycle status via `PUT /api/requests/:id`
  - **Delete Confirmation Modal**: Confirm before permanently removing tickets via `DELETE /api/requests/:id`
- **Native JavaScript `fetch()` API** used for all network communication.

### Backend (Node.js + Express ES Module)
- Configured with `"type": "module"` in `package.json`.
- Complete persistent file storage in `requests.json` using Node.js `fs/promises`.
- REST API Endpoints:
  - `GET /api/requests` — Retrieve all requests (newest first)
  - `GET /api/requests/:id` — Retrieve a single request by ID
  - `POST /api/requests` — Create a new request (auto-generates `REQ-XXXX` ID and timestamp)
  - `PUT /api/requests/:id` — Update existing request details or status
  - `DELETE /api/requests/:id` — Delete a request by ID

---

## 🛠️ Project Structure

```
CampusHelp/
├── backend/
│   ├── package.json        # "type": "module", Express, CORS
│   ├── requests.json       # JSON file storage via Node.js fs
│   └── server.js           # REST API routes + static dist fallback
├── frontend/
│   ├── index.html          # Clean institutional header & title
│   ├── package.json        # "type": "module", React 19, Vite
│   ├── vite.config.js      # Proxy configuration (/api -> http://localhost:5000)
│   └── src/
│       ├── App.jsx         # Form + Ledger + Edit Modal + Delete Dialog (fetch API)
│       ├── index.css       # Complete institutional design system tokens & styles
│       ├── App.css         # Component-level styling overrides
│       └── main.jsx        # React root entry
└── README.md
```

---

## 🏃 Running the Application

### 1. Start Backend Server
```bash
cd backend
npm install
npm start
```
The server will run on `http://localhost:5000`.

### 2. Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:3000` with hot module reloading and automatic proxying of `/api` requests to port `5000`.
