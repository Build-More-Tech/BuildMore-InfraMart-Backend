# BuildMore InfraMart — Backend API

REST API for the BuildMore InfraMart platform, built with Node.js, Express, and MongoDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js 5 |
| Database | MongoDB (Mongoose 9) |
| Auth | JWT (30-day tokens) |
| File Storage | Cloudinary |
| File Upload | Multer (memory storage) |
| Password Hashing | Bcrypt |

---

## Getting Started

### Prerequisites
- Node.js v20.6+
- MongoDB (local or Atlas)

### Installation

```bash
npm install
```

### Environment Setup

Copy the appropriate env file template:

| File | Purpose |
|---|---|
| `.env.local` | Local development (localhost MongoDB) |
| `.env.production` | Production (Atlas MongoDB, Render) |

Required variables:

```env
MONGO_URI=
PORT=5050
NODE_ENV=development|production
JWT_SECRET=
WHATSAPP_NUMBER=
FRONTEND_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Running the Server

```bash
# Development (loads .env.local, hot-reload)
npm run dev

# Production (loads .env.production)
npm start
```

---

## Production

- **Base URL:** `https://buildmore-inframart-backend.onrender.com`
- Hosted on Render

---

## Authentication

All protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are issued on login and expire after **30 days**.

**Roles:**
- `USER` — Standard user
- `ADMIN` — Full platform access

---

## API Reference

### User Routes — `/api/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | Register a new user |
| POST | `/login` | No | Login and receive JWT token |
| POST | `/forgetpassword` | No | Reset password |
| GET | `/profile` | Yes | Get logged-in user's profile |
| PUT | `/profile` | Yes | Update name or phone |
| POST | `/address` | Yes | Add a new address |
| PUT | `/address/:addressId` | Yes | Update an existing address |
| DELETE | `/address/:addressId` | Yes | Delete an address |

---

### Product Routes — `/api/products`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List all products (supports `search`, `category` query params) |
| GET | `/categories/all` | No | Get all available categories |
| GET | `/:id` | No | Get a single product by ID |

---

### Admin — Product Management — `/api/admin`

> Requires `ADMIN` role.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/products` | Admin | Add a new product (with image upload) |
| GET | `/products` | Admin | List all products |
| PUT | `/products/:id` | Admin | Update product details |
| DELETE | `/products/:id` | Admin | Delete a product |
| PATCH | `/products/:id/stock` | Admin | Update stock quantity |
| PATCH | `/products/:id/availability` | Admin | Toggle product availability |

---

### Order Routes — `/api/orders`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Place an order (deducts stock) |
| GET | `/` | User | List the logged-in user's orders |
| GET | `/:id` | User | Get a single order |
| PATCH | `/:id/cancel` | User | Cancel an order (restores stock) |
| GET | `/admin/all` | Admin | List all orders (paginated, filterable by status) |
| PATCH | `/admin/:id/status` | Admin | Update order status |

**Order Statuses:** `PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` / `CANCELLED`

**Order Numbers** are auto-generated in the format `BM-000001`.

---

### RFQ Routes — `/api/rfqs`

Request for Quotation workflow.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Create a new draft RFQ |
| GET | `/` | User | List user's RFQs (filterable by status) |
| GET | `/:id` | User | Get a single RFQ |
| POST | `/:id/items` | User | Add an item to a draft RFQ |
| DELETE | `/:id/items/:itemId` | User | Remove an item from a draft RFQ |
| PATCH | `/:id/submit` | User | Submit RFQ for admin review |
| GET | `/admin/all` | Admin | List all RFQs (paginated) |
| PATCH | `/admin/:id` | Admin | Update RFQ status and quoted prices |

**RFQ Statuses:** `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `QUOTED` → `ACCEPTED` / `REJECTED` / `EXPIRED`

**RFQ Numbers** are auto-generated in the format `RFQ-XXXXX`.

---

### Shipment Routes — `/api/shipments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | User | List user's shipments |
| GET | `/track/:identifier` | User | Track shipment by tracking number or ID |
| GET | `/admin/all` | Admin | List all shipments (paginated) |
| POST | `/admin` | Admin | Create a new shipment |
| PATCH | `/admin/:id` | Admin | Update shipment status and add tracking event |

**Shipment Statuses:** `PREPARING` → `PICKED_UP` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED` / `FAILED`

**Tracking Numbers** are auto-generated in the format `BM-TRK-XXXXXXXX`.

---

### Compliance Routes — `/api/compliance`

Manage regulatory compliance documents per user/product.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Upload a compliance document |
| GET | `/` | User | List user's compliance docs (filterable by type/status) |
| GET | `/:id` | User | Get a single compliance document |
| DELETE | `/:id` | User | Delete a compliance document |
| GET | `/admin/all` | Admin | List all compliance documents (paginated) |

**Document Types:** `ISO`, `CE`, `RoHS`, `REACH`, `SDS`, `AUDIT`, `OTHER`

**Document Statuses:** `ACTIVE`, `EXPIRING_SOON` (within 30 days), `EXPIRED` — auto-computed on save.

---

### Spec Sheet Routes — `/api/specs`

Manage technical specification files linked to products.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List all spec sheets (paginated, filterable by file type) |
| GET | `/product/:productId` | No | Get spec sheets for a specific product |
| POST | `/admin` | Admin | Upload a spec sheet |
| DELETE | `/admin/:id` | Admin | Delete a spec sheet |

**File Types:** `PDF`, `CAD`, `XLSX`, `DWG`, `OTHER`

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Required, unique |
| password | String | Required, min 8 chars, hashed |
| role | String | `USER` or `ADMIN` (default: `USER`) |
| phone | String | Max 10 chars |
| address | Array | Embedded address subdocuments |

### Product
| Field | Type | Notes |
|---|---|---|
| productName | String | Required |
| desc | String | Max 2000 chars |
| category | String | Required |
| price | Number | Required |
| originalPrice | Number | Pre-discount price |
| productImages | [String] | Cloudinary URLs |
| materialSpecifications | String | |
| stock | Number | Required |
| availability | Boolean | Default: true |
| tier | String | `Standard Export`, `Bulk Distribution`, `LTL Freight Only`, `Custom Fab` |
| bulkInfo | String | |
| rating | Number | 0–5 |
| reviews | Number | Default: 0 |

### Order
| Field | Type | Notes |
|---|---|---|
| user | ObjectId | ref: User |
| orderNumber | String | Auto-generated: `BM-000001` |
| items | Array | product ref, name, price, quantity |
| totalAmount | Number | |
| status | String | See statuses above |
| shippingAddress | Object | Embedded |
| notes | String | |
| cancelReason | String | Populated on cancellation |

### RFQ
| Field | Type | Notes |
|---|---|---|
| user | ObjectId | ref: User |
| rfqNumber | String | Auto-generated: `RFQ-XXXXX` |
| items | Array | product ref, quantity, targetPrice, quotedPrice, notes |
| status | String | See statuses above |
| totalEstimatedValue | Number | Auto-computed |
| notes | String | User notes |
| adminNotes | String | Admin notes |
| expiresAt | Date | |

### Shipment
| Field | Type | Notes |
|---|---|---|
| order | ObjectId | ref: Order |
| user | ObjectId | ref: User |
| trackingNumber | String | Auto-generated: `BM-TRK-XXXXXXXX` |
| carrier | String | |
| status | String | See statuses above |
| origin / destination | String | |
| estimatedDelivery | Date | |
| weight | Number | |
| dimensions | Object | length, width, height |
| events | Array | status, location, description, timestamp |

### Compliance Document
| Field | Type | Notes |
|---|---|---|
| user | ObjectId | ref: User |
| product | ObjectId | ref: Product |
| title | String | Required |
| type | String | ISO, CE, RoHS, REACH, SDS, AUDIT, OTHER |
| documentUrl | String | Cloudinary URL |
| issuedBy | String | |
| issuedAt / expiresAt | Date | |
| status | String | Auto-computed: ACTIVE, EXPIRING_SOON, EXPIRED |

### Spec Sheet
| Field | Type | Notes |
|---|---|---|
| product | ObjectId | ref: Product, required |
| title | String | Required |
| fileUrl | String | Cloudinary URL |
| fileType | String | PDF, CAD, XLSX, DWG, OTHER |
| fileSize | String | |
| version | String | Default: `1.0` |
| uploadedBy | ObjectId | ref: User |
| description | String | |

---

## Project Structure

```
├── server.js               # Entry point: Express setup, DB connection, routes
├── routes/
│   ├── userRoutes.js
│   ├── adminRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── rfqRoutes.js
│   ├── shipmentRoutes.js
│   ├── complianceRoutes.js
│   └── specsRoutes.js
├── controllers/            # Business logic for each route module
├── models/
│   ├── userModel.js
│   ├── ProductModel.js
│   ├── OrderModel.js
│   ├── RFQModel.js
│   ├── ShipmentModel.js
│   ├── ComplianceDocModel.js
│   └── SpecSheetModel.js
├── services/
│   ├── auth.js             # JWT sign/verify
│   ├── cloudinary.js       # File upload/delete helpers
│   └── isAuthorized.js     # isAuthorized, isAdmin middleware
├── .env.local              # Local dev environment variables
├── .env.production         # Production environment variables
└── package.json
```
