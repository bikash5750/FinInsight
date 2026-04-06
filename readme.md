# Finance Dashboard — Backend API

A production-ready backend system for a role-based finance dashboard. Built with Node.js, Express, MongoDB, Redis, and JWT authentication. Supports multi-role access control, financial record management, and real-time analytics aggregation.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Admin Seeding](#admin-seeding)
- [API Reference](#api-reference)
  - [Auth](#auth-routes)
  - [Admin — User Management](#admin-routes--user-management)
  - [Records](#records-routes)
  - [Dashboard](#dashboard-routes)
- [Role Access Matrix](#role-access-matrix)
- [Security Features](#security-features)
- [Data Models](#data-models)
- [Validation Rules](#validation-rules)
- [Error Handling](#error-handling)
- [Assumptions & Design Decisions](#assumptions--design-decisions)

---

## Overview

This backend powers a finance dashboard where three types of users interact with financial data at different access levels:

- **Admin** — Full system access: manage users, create/update/delete financial records, view all analytics
- **Analyst** — Read-only access to records and full analytics. Cannot modify any data
- **Viewer** — Summary-only access: total income, total expense, net balance, and record count

No user can self-assign a role. All users register as Viewers by default. Role elevation requires an Admin.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Cache / Token Blocklist | Redis (RedisLabs) |
| Authentication | JWT (30-minute expiry) |
| Validation | Zod |
| Password Hashing | bcrypt |
| Pagination | mongoose-paginate-v2 |
| Rate Limiting | Custom Redis-based limiter |

---

## Architecture

```
src/
├── DBConnection/
│   └── Connection.js           # MongoDB connection
├── Models/
│   ├── User.model.js           # User schema (name, email, password, role, status)
│   └── Records.model.js        # Financial record schema (amount, type, category, date, notes)
├── Controllers/
│   ├── User.Controller.js      # Auth + user management logic
│   ├── Records.Controller.js   # Financial record CRUD
│   └── Dashboard.Controller.js # Analytics aggregations
├── Routes/
│   ├── Auth.Routes.js          # POST /api/auth/login
│   ├── Admin.Routes.js         # User management (admin only)
│   ├── Records.Routes.js       # Record CRUD
│   └── DashBoard.Routes.js     # Analytics endpoints
├── Validators/
│   ├── UserData.Validator.js   # Zod schemas for user operations
│   └── Records.Validator.js    # Zod schemas for record operations
├── Middlewares/
│   └── Auth.Middleware.js      # JWT verification + role injection
└── utils/
    ├── GenerateAccessToken.js  # JWT signing
    ├── Redis.js                # Redis client
    └── RateLimiter.js          # IP-based rate limiter
index.js                        # App entry point + server bootstrap
seed.js                         # Admin seeding script (run once)
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB instance (local or Atlas)
- Redis instance (local or RedisLabs)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/finance-dashboard.git
cd finance-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values — see Environment Variables section

# 4. Seed admin accounts (run once only)
node seed.js

# 5. Start the development server
npm run dev

# 6. Start production server
npm start
```

---

## Environment Variables

Create a `.env` file at the root of the project:

```env
PORT=8000

# MongoDB
MONGO_URI=mongodb://localhost:27017/finance-dashboard
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/finance-dashboard

# JWT
ACCESS_SECRET=your_super_secret_jwt_key_here

# Redis
REDIS_URL=redis://default:<password>@<host>:<port>
```

> **Never commit your `.env` file.** Add it to `.gitignore`.

---

## Admin Seeding

Admin accounts cannot be created via the API. They are seeded directly into the database using a one-time script. This is intentional — no public endpoint exists for admin creation.

```bash
node seed.js
```

This creates two admin accounts:

| Name | Email | Password | Role |
|---|---|---|---|
| Bikash Gupta | gbikash5750@gmail.com | Ssg@@1964 | admin |
| Rohit Kumar | rohit51@gmail.com | Ssg@@1964 | admin |

> The script is idempotent — running it again will skip creation if both admins already exist.

**After seeding, use these credentials to log in and get a JWT token. Use that token to promote other registered users from Viewer to Analyst or Admin.**

---

## API Reference

All protected routes require:

```
Authorization: Bearer <token>
```

or the token stored in the `accesstoken` cookie.

---

### Auth Routes

Base path: `/api/auth`

#### `POST /api/auth/login`

Authenticate a user and receive a JWT token.

**Access:** Public

**Request body:**
```json
{
  "email": "gbikash5750@gmail.com",
  "password": "Ssg@@1964"
}
```

**Success response `200`:**
```json
{
  "message": "Login Succesfull",
  "name": "Bikash Gupta",
  "email": "gbikash5750@gmail.com",
  "status": "active",
  "role": "admin"
}
```

> Token is also set as an `httpOnly` cookie named `accesstoken`.

**Error responses:**

| Code | Reason |
|---|---|
| `400` | Missing or invalid fields |
| `401` | Incorrect password |
| `403` | User account is inactive |
| `404` | User not found |

---

#### `POST /api/auth/logout`

Blacklists the current JWT in Redis so it cannot be reused before expiry.

**Access:** Any authenticated user

**Success response `200`:**
```json
{
  "message": "User Logout Succesfull"
}
```

---

### Admin Routes — User Management

Base path: `/api/admin`

**Access:** Admin only for all routes below.

---

#### `POST /api/admin/create`

Create a new user. Admins can create Viewers or Analysts. Creating another Admin via this route is blocked.

**Request body:**
```json
{
  "name": "Priya Shah",
  "username": "priya01",
  "email": "priya@example.com",
  "password": "Pass@1234",
  "role": "analyst",
  "status": "active"
}
```

**Success response `201`:**
```json
{
  "message": "User created successfully",
  "user": { ... }
}
```

**Error responses:**

| Code | Reason |
|---|---|
| `400` | Missing fields, validation failure, or attempt to create admin |
| `403` | Requester is not admin |

---

#### `GET /api/admin/users`

List all active users with pagination.

**Access:** Admin and Analyst

**Query params:**

| Param | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `5` | Records per page |

**Success response `200`:**
```json
{
  "message": "Users fetched successfully",
  "page": 1,
  "limit": 5,
  "totalRecords": 28,
  "totalPages": 6,
  "hasNextPage": true,
  "hasPrevPage": false,
  "records": [ ... ]
}
```

---

#### `GET /api/admin/user`

Get a single user by email.

**Access:** Admin and Analyst

**Request body:**
```json
{
  "email": "priya@example.com"
}
```

---

#### `PATCH /api/admin/status/inactive`

Deactivate a user. Deactivated users cannot log in even with correct credentials.

**Request body:**
```json
{
  "email": "priya@example.com"
}
```

---

#### `PATCH /api/admin/status/active`

Reactivate a previously deactivated user.

**Request body:**
```json
{
  "email": "priya@example.com"
}
```

---

#### `PATCH /api/admin/update`

Update user details including name, username, role, status, or password.

**Request body:**
```json
{
  "email": "priya@example.com",
  "name": "Priya Singh",
  "role": "analyst"
}
```

> All fields except `email` are optional. Only provided fields are updated.

---

#### `DELETE /api/admin/delete`

Permanently delete a user from the database.

**Request body:**
```json
{
  "email": "priya@example.com"
}
```

**Success response `200`:**
```json
{
  "message": "User deleted permanently",
  "user": { ... }
}
```

---

### Records Routes

Base path: `/api/records`

---

#### `POST /api/records/create`

Create a new financial record.

**Access:** Admin only

**Request body:**
```json
{
  "recordid": "rec001",
  "amount": 32000,
  "type": "income",
  "category": "Revenue",
  "date": "2024-04-01",
  "notes": "Client payment from Infosys"
}
```

**Field rules:**
- `recordid` — unique identifier, 3–25 chars, must contain at least one letter and one number
- `amount` — positive number, required
- `type` — exactly `"income"` or `"expense"`
- `category` — 3–20 characters
- `date` — any parseable date string
- `notes` — 5–200 characters

**Success response `201`:**
```json
{
  "message": "Record created successfully",
  "record": { ... }
}
```

---

#### `GET /api/records/all`

List all active (non-deleted) records with pagination.

**Access:** Admin and Analyst

**Query params:**

| Param | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `5` | Records per page |

**Success response `200`:**
```json
{
  "message": "All RECORDS",
  "page": 1,
  "limit": 5,
  "totalRecords": 142,
  "totalPages": 29,
  "hasNextPage": true,
  "hasPrevPage": false,
  "records": [ ... ]
}
```

---

#### `GET /api/records/get`

Get a single record by its custom `recordid`.

**Access:** Admin and Analyst

**Request body:**
```json
{
  "recordid": "rec001"
}
```

**Success response `200`:**
```json
{
  "message": "Record Details",
  "record": {
    "recordid": "rec001",
    "amount": 32000,
    "type": "income",
    "category": "Revenue",
    "date": "2024-04-01T00:00:00.000Z",
    "notes": "Client payment from Infosys"
  }
}
```

---

#### `PATCH /api/records/update`

Update an existing record. All fields are required — partial updates are applied only for provided fields internally.

**Access:** Admin only

**Request body:**
```json
{
  "recordid": "rec001",
  "amount": 35000,
  "type": "income",
  "category": "Revenue",
  "date": "2024-04-01",
  "notes": "Updated final payment amount"
}
```

---

#### `DELETE /api/records/delete`

Soft-delete a record. Sets `isDeleted: true` — the record is not removed from the database and is excluded from all queries.

**Access:** Admin only

**Request body:**
```json
{
  "recordid": "rec001"
}
```

**Success response `200`:**
```json
{
  "message": "Deleted Records",
  "recordfound": { ... }
}
```

---

### Dashboard Routes

Base path: `/api/dashboard`

---

#### `GET /api/dashboard/summary`

Returns overall financial summary. The **only** dashboard endpoint accessible to Viewers.

**Access:** All roles (Viewer, Analyst, Admin)

**Success response `200`:**
```json
{
  "income": 84200,
  "expense": 51400,
  "count": 142,
  "netBalance": 32800
}
```

---

#### `GET /api/dashboard/category`

Returns total amount and record count grouped by category, sorted by total descending.

**Access:** Analyst and Admin

**Success response `200`:**
```json
{
  "message": "Catagory data are",
  "categorydata": [
    { "_id": "Revenue",    "total": 50500, "count": 2 },
    { "_id": "Payroll",    "total": 21000, "count": 1 },
    { "_id": "Cloud",      "total": 13500, "count": 3 }
  ]
}
```

---

#### `GET /api/dashboard/monthly`

Returns income vs expense grouped by calendar month, sorted chronologically.

**Access:** Analyst and Admin

**Success response `200`:**
```json
{
  "message": "Monthly Trends",
  "monthlydata": [
    { "_id": 1, "income": 32000, "expense": 21000 },
    { "_id": 2, "income": 34000, "expense": 24800 },
    { "_id": 3, "income": 37200, "expense": 28100 }
  ]
}
```

> `_id` is the month number (1 = January, 12 = December).

---

#### `GET /api/dashboard/weekly`

Returns income vs expense grouped by ISO week number.

**Access:** Analyst and Admin

**Success response `200`:**
```json
{
  "message": "Weekly Explense",
  "weeklydata": [
    { "_id": 12, "income": 18500, "expense": 8400 },
    { "_id": 13, "income": 32000, "expense": 24200 }
  ]
}
```

> `_id` is the ISO week number of the year.

---

#### `GET /api/dashboard/top-categories`

Returns the top 5 categories by record count (number of entries).

**Access:** Analyst and Admin

**Success response `200`:**
```json
{
  "message": "Top Catogeries are",
  "topcategorydata": [
    { "_id": "Cloud",      "count": 12 },
    { "_id": "Payroll",    "count": 8  },
    { "_id": "Revenue",    "count": 7  },
    { "_id": "Operations", "count": 5  },
    { "_id": "Travel",     "count": 3  }
  ]
}
```

---

#### `GET /api/dashboard/most-expensive`

Returns the top 3 categories by total amount spent — shows where the most money is going.

**Access:** Analyst and Admin

**Success response `200`:**
```json
{
  "message": "Most Expensive Catogeries are",
  "expensivecategorydata": [
    { "_id": "Payroll", "totalamount": 42000 },
    { "_id": "Cloud",   "totalamount": 16700 },
    { "_id": "Revenue", "totalamount": 9200  }
  ]
}
```

---

#### `GET /api/dashboard/filter-type`

Returns all records filtered by transaction type.

**Access:** Analyst and Admin

**Request body:**
```json
{
  "type": "expense"
}
```

> `type` must be exactly `"income"` or `"expense"`.

---

## Role Access Matrix

| Endpoint | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| `POST /api/auth/login` | ✓ | ✓ | ✓ |
| `POST /api/auth/logout` | ✓ | ✓ | ✓ |
| `POST /api/admin/create` | ✗ | ✗ | ✓ |
| `GET /api/admin/users` | ✗ | ✓ | ✓ |
| `GET /api/admin/user` | ✗ | ✓ | ✓ |
| `PATCH /api/admin/status/inactive` | ✗ | ✗ | ✓ |
| `PATCH /api/admin/status/active` | ✗ | ✗ | ✓ |
| `PATCH /api/admin/update` | ✗ | ✗ | ✓ |
| `DELETE /api/admin/delete` | ✗ | ✗ | ✓ |
| `POST /api/records/create` | ✗ | ✗ | ✓ |
| `GET /api/records/all` | ✗ | ✓ | ✓ |
| `GET /api/records/get` | ✗ | ✓ | ✓ |
| `PATCH /api/records/update` | ✗ | ✗ | ✓ |
| `DELETE /api/records/delete` | ✗ | ✗ | ✓ |
| `GET /api/dashboard/summary` | ✓ | ✓ | ✓ |
| `GET /api/dashboard/category` | ✗ | ✓ | ✓ |
| `GET /api/dashboard/monthly` | ✗ | ✓ | ✓ |
| `GET /api/dashboard/weekly` | ✗ | ✓ | ✓ |
| `GET /api/dashboard/top-categories` | ✗ | ✓ | ✓ |
| `GET /api/dashboard/most-expensive` | ✗ | ✓ | ✓ |
| `GET /api/dashboard/filter-type` | ✗ | ✓ | ✓ |

---

## Security Features

### JWT Authentication
- Tokens expire after **30 minutes**
- Token payload contains `id`, `email`, `role`, and `status`
- Signed with `ACCESS_SECRET` from environment variables
- Delivered via `httpOnly` cookie (XSS-safe) and also returned in response for API clients

### Token Blacklisting (Logout)
- On logout, the token is stored in Redis with its original expiry timestamp
- Every request checks Redis before processing — blacklisted tokens are rejected immediately
- Ensures tokens cannot be reused after logout even within their 30-minute window

### Rate Limiting
- IP-based rate limiter powered by Redis
- Limit: **20 requests per hour per IP address**
- Returns `429 Too Many Requests` when exceeded
- Applied globally to all routes

### Password Security
- Passwords hashed with **bcrypt** (10 salt rounds) via a Mongoose pre-save hook
- The hook only re-hashes when the password field is actually modified
- `select: false` on the password field prevents it from appearing in any query response by default

### Role Enforcement
- Role checks performed in every controller before any business logic runs
- No endpoint trusts the client's claimed role — role is always read from the verified JWT payload
- Admin cannot be created via any API endpoint — only via the seed script

### Soft Delete
- Financial records are never permanently deleted via the API
- `DELETE` sets `isDeleted: true` — the record remains in the database for audit purposes
- All queries filter with `isDeleted: false` automatically

---

## Data Models

### User

| Field | Type | Description |
|---|---|---|
| `name` | String | Full name, 3–25 characters |
| `username` | String | Unique username, 4–20 characters |
| `email` | String | Unique, lowercase, validated format |
| `password` | String | bcrypt hashed, never returned in queries |
| `role` | Enum | `viewer` \| `analyst` \| `admin` — default `viewer` |
| `status` | Enum | `active` \| `inactive` — default `active` |
| `createdAt` | Date | Auto-set by Mongoose timestamps |
| `updatedAt` | Date | Auto-updated by Mongoose timestamps |

### Financial Record

| Field | Type | Description |
|---|---|---|
| `recordid` | String | Custom unique identifier (3–25 chars) |
| `amount` | Number | Positive number, required |
| `type` | Enum | `income` \| `expense` |
| `category` | String | 3–20 characters |
| `date` | Date | Actual transaction date |
| `notes` | String | 5–200 characters |
| `createdby` | ObjectId | Reference to the User who created this record |
| `isDeleted` | Boolean | Soft delete flag — default `false` |
| `createdAt` | Date | Auto-set by Mongoose timestamps |
| `updatedAt` | Date | Auto-updated by Mongoose timestamps |

---

## Validation Rules

All input is validated using **Zod** before any database operation.

### Password requirements
- Minimum 6 characters, maximum 20
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Username requirements
- 4–20 characters
- At least one lowercase letter
- At least one number

### Record ID requirements
- 3–25 characters
- At least one letter
- At least one number

### Amount
- Must be a number
- Must be greater than 0

---

## Error Handling

All errors follow a consistent response shape:

```json
{
  "message": "Human-readable error description"
}
```

| Status Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request — missing or invalid input |
| `401` | Unauthorized — wrong password or invalid token |
| `403` | Forbidden — insufficient role or inactive account |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## Assumptions & Design Decisions

**Self-registration is not supported.**
Users are created by admins via `POST /api/admin/create`. There is no public registration endpoint. This is intentional — this is an internal finance tool, not a public application.

**Admin accounts are seeded, not created via API.**
To prevent unauthorized admin creation, no API endpoint allows setting `role: "admin"`. Admins are provisioned once via `node seed.js` and subsequently managed internally.

**Soft delete for records.**
Financial records are never hard-deleted via the API. The `isDeleted` flag preserves the audit trail. This is standard practice in financial systems where data integrity and history matter.

**Dashboard analytics are computed fresh on every request.**
No pre-computed totals or cached aggregates are stored. MongoDB's aggregation pipeline runs directly against the records collection on each request. This guarantees correctness without synchronisation complexity. At scale, Redis caching can be added as a layer on top without changing any business logic.

**JWT expiry is 30 minutes.**
Short-lived tokens reduce the risk window if a token is leaked. Redis-based blacklisting handles immediate invalidation on logout within this window.

**Role is stored in JWT payload.**
This avoids a database lookup on every request to determine the user's role. The tradeoff is that role changes do not take effect until the current token expires (max 30 minutes). This is the accepted industry tradeoff for stateless authentication.

**Rate limiter is IP-based.**
Limits each IP to 20 requests per hour. The window resets after 1 hour. This protects against brute-force login attempts and API abuse.

**Viewer access is minimal by design.**
Viewers can only see `GET /api/dashboard/summary`. They cannot access individual records, categories, or trends. This reflects the business requirement that raw financial data should only be visible to users with analytical responsibilities.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start production server |
| `node seed.js` | Seed initial admin accounts (run once) |

---

## License

This project was built as part of a backend internship assignment. Not licensed for production use without review.