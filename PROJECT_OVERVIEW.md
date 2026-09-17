# 🚀 ResumeAI — Full Project Architecture & Code Guide

A comprehensive, end-to-end breakdown of everything built in **ResumeAI**, explaining the tools, libraries, design decisions, and how every part works together.

---

## 📌 Table of Contents
1. [Project Overview & Architecture](#-project-overview--architecture)
2. [Tech Stack & Dependencies](#-tech-stack--dependencies)
3. [Backend Deep Dive (Node.js, Express, MongoDB)](#-backend-deep-dive)
   - [Entry & Configuration](#1-entry--configuration)
   - [Database Models](#2-database-models)
   - [Routes](#3-routes)
   - [Controllers](#4-controllers)
   - [Middleware](#5-middleware)
4. [Frontend Deep Dive (React 19, Vite, SCSS)](#-frontend-deep-dive)
   - [Setup & Routing](#1-setup--routing)
   - [Feature-Driven Layout](#2-feature-driven-layout)
   - [Styling System](#3-styling-system)
5. [End-to-End Request Lifecycle](#-end-to-end-request-lifecycle)
6. [Key Bugs & Recommended Next Steps](#-key-bugs--recommended-next-steps)

---

## 🗺️ Project Overview & Architecture

**ResumeAI** is structured as a fullstack application separated into two decoupled environments:

- **`backend/`**: A RESTful Node.js + Express API connected to MongoDB Atlas, implementing stateless JWT authentication inside HTTP-only cookies and token blacklisting for secure logouts.
- **`frontend/`**: A React 19 single-page application (SPA) bundled with Vite, styled with Sass (SCSS), organized under a **Feature-Driven Architecture** (`features/auth`, `features/ai`).

```
resumeai/
├── backend/
│   ├── server.js                      # Server startup & DB connection
│   ├── package.json                   # Backend dependencies & scripts
│   ├── .env                           # Secret credentials (DB URI, JWT secret)
│   └── src/
│       ├── app.js                     # Express app & middleware setup
│       ├── config/
│       │   ├── database.js            # MongoDB connection via Mongoose
│       │   └── models/
│       │       ├── user.model.js      # User schema (username, email, password)
│       │       └── blacklist.model.js # Blacklisted tokens for invalidation
│       ├── controllers/
│       │   └── auth.controller.js     # Register, login, logout, getMe logic
│       ├── middlewares/
│       │   └── auth.middleware.js     # JWT verification middleware
│       └── routes/
│           └── auht.routes.js         # /api/auth routes
│
└── frontend/
    ├── index.html                     # HTML document shell
    ├── vite.config.js                 # Vite bundler configuration
    ├── package.json                   # Frontend dependencies & scripts
    ├── src/
    │   ├── main.jsx                   # React root mount
    │   ├── App.jsx                    # Root component with RouterProvider
    │   ├── app.routes.jsx             # React Router routing configuration
    │   └── style.scss                 # Global styling rules
    └── features/
        ├── auth/                      # Authentication domain
        │   ├── auth.form.scss         # Scoped form styling
        │   ├── components/            # Reusable auth components
        │   └── pages/
        │       ├── login.jsx          # Login view
        │       └── register.jsx       # Register view
        └── ai/                        # Future AI resume tools & generators
```

---

## 🛠️ Tech Stack & Dependencies

### Backend Dependencies
| Package | Version | Purpose |
| :--- | :--- | :--- |
| **`express`** | `^5.2.1` | Web framework to create HTTP endpoints and run middleware pipelines. |
| **`mongoose`** | `^9.9.5` | ODM (Object Data Modeling) library to define strict schemas and query MongoDB. |
| **`bcryptjs`** | `^3.0.3` | Password hashing function with salt rounds to prevent plain-text credential leaks. |
| **`jsonwebtoken`** | `^9.0.3` | Generates and verifies signed JSON Web Tokens (JWT) for authentication. |
| **`cookie-parser`** | `^1.4.7` | Parses the HTTP `Cookie` request header and exposes tokens on `req.cookies`. |
| **`dotenv`** | `^17.4.2` | Injects `.env` secrets into Node's global `process.env`. |
| **`nodemon`** | Dev | Automatically watches backend files and reloads the server on changes. |

### Frontend Dependencies
| Package | Version | Purpose |
| :--- | :--- | :--- |
| **`react` & `react-dom`** | `^19.2.8` | Core UI library for component-based reactive rendering. |
| **`react-router`** | `^8.3.1` | Declarative routing library managing client-side navigation without page reloads. |
| **`vite`** | `^8.2.2` | Fast ESM build tool with instant Hot Module Replacement (HMR). |
| **`sass` / `sass-embedded`** | `^1.104.0`| CSS preprocessor providing nested selectors, mixins, and variables. |
| **`oxlint`** | `^1.79.0` | Rust-based high-performance JavaScript/JSX linter. |

---

## ⚙️ Backend Deep Dive

### 1. Entry & Configuration

#### `server.js`
- Loads environment variables via `require("dotenv").config()`.
- Calls `connectToDB()` to establish a connection to MongoDB before traffic arrives.
- Starts the Express application on **Port 3000** (`app.listen(3000)`).

#### `src/config/database.js`
- Connects using `mongoose.connect(process.env.MONGO_URI)`.
- Implements asynchronous `try...catch` handling to log connection status or capture connection errors.

#### `src/app.js`
- Initializes `const app = express()`.
- Attaches `express.json()` to parse incoming JSON payloads into `req.body`.
- Attaches `cookieParser()` to read incoming cookies into `req.cookies`.
- Mounts all authentication endpoints under the `/api/auth` prefix.

---

### 2. Database Models

#### `src/config/models/user.model.js`
Defines the User schema:
```javascript
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "username already exists"],
        required: true
    },
    email: {
        type: String,
        unique: [true, "email already exists"],
        lowercase: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required: [true, "password is required"]
    }
});
```

#### `src/config/models/blacklist.model.js`
Stores JWT tokens when users log out:
```javascript
const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
```

---

### 3. Routes (`src/routes/auht.routes.js`)

| HTTP Method | Endpoint | Middleware | Controller Handler | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | None | `registerUserController` | Creates new user account |
| `POST` | `/api/auth/login` | None | `loginUserController` | Authenticates existing user |
| `POST` | `/api/auth/logout` | None | `logoutUserController` | Invalidates token & clears cookie |
| `GET` | `/api/auth/get-me` | `authUser` | `getMeController` | Fetches authenticated user profile |

---

### 4. Controllers (`src/controllers/auth.controller.js`)

#### `registerUserController`
1. Validates that `username`, `email`, and `password` are provided in `req.body`.
2. Checks if a user already exists with either that email or username (`userModel.findOne({ $or: [{ email }, { username }] })`).
3. Hashes the password using `bcrypt.hash(password, 10)` (salt rounds = 10).
4. Creates the document in MongoDB.
5. Signs a JWT token containing `{ id: user._id }` with a 1-hour expiration.
6. Attaches the token in a cookie (`res.cookie("token", token)`) and returns user details.

#### `loginUserController`
1. Verifies that `username` and `password` are sent.
2. Finds the user by `username`.
3. Verifies the password using `bcrypt.compare(password, user.password)`.
4. Signs a new JWT and attaches it to the response cookie.

#### `logoutUserController`
1. Reads `req.cookies?.token`.
2. If present, saves the token into `tokenBlacklistModel` in the database.
3. Clears the browser cookie with `res.clearCookie("token")`.

#### `getMeController`
1. Uses `req.user.id` (set by the authentication middleware).
2. Looks up the user with `userModel.findById(...)`.
3. Returns user profile details (excluding password).

---

### 5. Middleware (`src/middlewares/auth.middleware.js`)

#### `authUser`
Acts as a security guard for protected routes:
1. Reads `req.cookies.token`. If missing, immediately halts with `401 Unauthorized`.
2. Validates the signature using `jwt.verify(token, process.env.JWT_SECRET)`.
3. If invalid or expired, returns `403 Forbidden`.
4. If valid, attaches the decoded payload to `req.user` and invokes `next()` to pass control to the target controller.

---

## 🎨 Frontend Deep Dive

### 1. Setup & Routing

#### `src/main.jsx`
- Initializes the React application into `<div id="root">` inside `<StrictMode>`.

#### `src/App.jsx`
- Supplies the router configuration to `<RouterProvider router={router} />`.
- Imports global styles (`style.scss`).

#### `src/app.routes.jsx`
- Uses `createBrowserRouter` from React Router:
  - `"/"` $\rightarrow$ Redirects to `"/login"` using `<Navigate to="/login" replace />`.
  - `"/login"` $\rightarrow$ Loads the `<Login />` page.
  - `"/register"` $\rightarrow$ Loads the `<Register />` page.

---

### 2. Feature-Driven Layout

Instead of grouping files by generic folders (`components/`, `pages/`), the project uses **domain-based feature folders**:

- **`features/auth/`**:
  - `pages/login.jsx`: Contains the login form with email & password fields, state bindings, and submit actions.
  - `pages/register.jsx`: Dedicated sign-up screen component.
  - `auth.form.scss`: Dedicated stylesheet for authentication screens.
- **`features/ai/`**:
  - Reserved space for AI features (e.g., resume analyzers, AI builders, ATS scanners).

---

### 3. Styling System

- **`src/style.scss`**: Global foundation styles (dark background `#4b4848`, typography, viewport defaults).
- **`features/auth/auth.form.scss`**:
  - Uses CSS Flexbox centering (`min-height: 100vh`, `justify-content: center`, `align-items: center`).
  - Pill-shaped modern inputs and submit buttons with `border-radius: 100px`.
  - Nested SCSS structure for clean, scoped styling.

---

## 🔄 End-to-End Request Lifecycle

Here is what happens when a user signs up or logs in:

```
[ User in Browser ]
       │
       ▼ Submits Email & Password on /login
[ React Form (login.jsx) ]
       │
       ▼ HTTP POST /api/auth/login
[ Express Server (server.js & app.js) ]
       │
       ▼ express.json() parses body -> routes to auht.routes.js
[ auth.controller.js (loginUserController) ]
       │
       ├─► Finds user in MongoDB via user.model.js
       ├─► Compares password hash via bcrypt.compare()
       ├─► Generates signed JWT token via jsonwebtoken
       └─► Attaches cookie via res.cookie("token", token)
       │
       ▼ Returns HTTP 200 OK + JSON user data
[ React Application ]
       │
       ▼ Cookie stored in browser -> User redirected to dashboard
```

When accessing a protected route (`GET /api/auth/get-me`):
```
[ Browser ] ──(Sends Request with Cookie)──► [ auth.middleware.js ]
                                                     │
                                            Is cookie present?
                                            Is JWT signature valid?
                                                     │
                                                     ▼ (Yes)
                                            Injects req.user = decoded
                                                     │
                                                     ▼
                                            [ getMeController ]
                                                     │
                                            Fetches user from MongoDB
```

---

## 💡 Key Bugs & Recommended Next Steps

1. **Export `getMeController`**:
   In `backend/src/controllers/auth.controller.js`, `getMeController` is defined but was omitted from `module.exports`. Update line 134:
   ```javascript
   module.exports = {
       registerUserController,
       loginUserController,
       logoutUserController,
       getMeController
   };
   ```

2. **Route Filename Typo**:
   Rename `backend/src/routes/auht.routes.js` to `auth.routes.js` and update the import in `src/app.js`.

3. **Check Token Blacklist in Middleware**:
   In `backend/src/middlewares/auth.middleware.js`, add a check against `tokenBlacklistModel` so blacklisted tokens from logged-out users are immediately rejected.

4. **Form Field Alignment**:
   `login.jsx` uses `email`, while `loginUserController` looks for `req.body.username`. Either change the input name in `login.jsx` or adjust the controller to accept email or username.

5. **Enable CORS**:
   Install `cors` in backend (`npm i cors`) and add `app.use(cors({ origin: "http://localhost:5173", credentials: true }))` so Vite can freely communicate with the backend.
