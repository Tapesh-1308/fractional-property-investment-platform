## Introduction

A simplified **Fractional Property Investment Platform**, inspired by a core product primitive at Per Annum.

This product helps investors participate in real estate investments even with smaller amounts of capital. Instead of buying an entire property, users can invest in fractional ownership, meaning they can own a portion (slots) of a property.



## Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (SQL)
* **ORM / Data Access:** Raw `pg` driver
* **Infrastructure:** Docker-based setup or local PostgreSQL
* **Other Tools:**

  * Winston (logging)
  * Express Rate Limit (API rate limiting)



## Features

1. Create a new property and fetch its details

2. Add funds (top-up) to a user’s wallet

3. Allow users to invest in *N* slots of a property

4. Portfolio view including:

   * User details
   * List of investments
   * Property details
   * Wallet transactions

5. **(BONUS)** Investment withdrawal with a 2% exit fee

6. **(BONUS)** Rate limiting on all APIs, with custom limits for investment creation

7. Backend built with production-grade considerations:

   * Well-structured and normalized data models
   * Secure and consistent financial transaction handling
   * Clean, predictable, and RESTful API design
   * Designed to handle concurrent requests safely

8. One-command Docker setup:

   * Runs server, PostgreSQL, and pgAdmin automatically
   * Auto-executes migrations and seeds temporary user data

### Additional Enhancements (Often Overlooked)

  * Helmet for securing HTTP headers
  * Health check endpoint (`/health`)
  * Graceful shutdown handling
  * Proper 404 handler for unknown routes

* Database Optimizations:

  * Connection pooling
  * Indexing for faster queries
  * Triggers for maintaining data integrity

## Postman Collection

The Postman collection is included in the repository:

```
postman-collection.json
```

Import this file into Postman to test all available APIs.



## Architecture Overview

* Designed using a **modern modular monolith architecture**, which can be easily evolved into microservices in the future.

### Modules

* User
* Properties
* Investments
* Wallet
* Portfolio

Each module contains:

* Router
* Controller
* Service
* Repository
* Dependency wiring (connecting repositories, services, and controllers)

### Design Principles Followed

* Applied **SOLID principles** across the project
* Dependency Injection used across modules
* Singleton pattern for:

  * PostgreSQL connection
  * Logger
* Repository Interface Pattern for data access abstraction


## Folder Structure (Simplified)

```text
services/
 ├── investments/
 │   ├── controller/
 │   ├── dependencies/
 │   ├── repository/
 │   ├── routes/
 │   ├── service/
 │   └── validation/
 ├── portfolio/
 │   ├── controller/
 │   ├── dependencies/
 │   ├── routes/
 │   └── service/
 ├── properties/
 │   ├── controller/
 │   ├── dependencies/
 │   ├── repository/
 │   ├── routes/
 │   ├── service/
 │   └── validation/
 ├── user/
 │   ├── controller/
 │   ├── dependencies/
 │   ├── repository/
 │   ├── routes/
 │   ├── service/
 │   └── validation/
 └── wallet/
     ├── dependencies/
     ├── repository/
     └── service/
```

## Setup Instructions:

### Option 1: Setup Using Docker ( One command )

#### Prerequisites

Make sure the following are installed on your system:

* Docker
* Docker Compose
* Docker Desktop

Also ensure the following ports are available:

* `5432` → PostgreSQL
* `8080` → pgAdmin
* `5000` → Backend Server

---

#### Clone the Repository

```bash
mkdir fractional-property-investment-platform
git clone https://github.com/Tapesh-1308/fractional-property-investment-platform.git .
```

---

#### Setup Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

`.env.example`:

```env
# Server
NODE_ENV=development
PORT=5000

# Postgres
PG_HOST=postgres
PG_PORT=5432
PG_DATABASE=fractional_property_investment
PG_USER=postgres
PG_PASSWORD=tapesh

# Rate Limiting
RATE_LIMIT_WINDOW_MS=90000
RATE_LIMIT_MAX_REQUESTS=1000

# Investment Rate Limiting
INVESTMENT_RATE_LIMIT_WINDOW_MS=90000
INVESTMENT_RATE_LIMIT_MAX_REQUESTS=20
```

---

####  Run the Application

```bash
docker compose up --build
```

This will automatically:

* Start PostgreSQL on port `5432`
* Start pgAdmin on port `8080`
* Start the backend server on port `5000`
* Run database migrations
* Seed initial user data

---

#### Run in Detached Mode

```bash
docker compose up --build -d
```

---

#### Stop the Application

```bash
docker compose down
```

To stop and remove volumes (this will also delete database data):

```bash
docker compose down -v
```

---

### Option 2: Setup Without Docker

> *(To be added)*

---

## API Documentation

### Base URL

```
{{BASE_URL}} = http://localhost:5000/
```

---

### API Execution Order (Recommended Flow)

Use user IDs: `1`, `2`, `3`

1. Create Property
2. Get Property
3. Fetch User Portfolio
4. Wallet Top-up (then verify via portfolio)
5. Create Investment (verify via portfolio & property)
6. Withdraw Investment (verify again)

---

### 1. Create Property

**POST** `/api/property`

#### Request Body

```json
{
  "total_value": 10000000,
  "total_slots": 100
}
```

#### Response

```json
{
  "success": true,
  "message": "Property created successfully.",
  "data": {
    "id": "2",
    "total_value": "10000000.00",
    "total_slots": 100,
    "available_slots": 100,
    "price_per_slot": "100000.00",
    "created_at": "2026-05-03T07:20:35.910Z"
  },
  "statusCode": 201,
  "timestamp": "2026-05-03T07:20:35.914Z"
}
```

---

### 2. Get Property by ID

**GET** `/api/property/{id}`

#### Example

```
/api/property/1
```

#### Response

```json
{
  "success": true,
  "message": "Property fetched successfully.",
  "data": {
    "id": "1",
    "total_value": "10000000.00",
    "total_slots": 100,
    "available_slots": 100,
    "price_per_slot": "100000.00",
    "created_at": "2026-05-02T16:54:27.044Z"
  },
  "statusCode": 200,
  "timestamp": "2026-05-03T04:03:00.678Z"
}
```

---

### 3. Get User Portfolio

**GET** `/api/portfolio/{user_id}`

#### Example

```
/api/portfolio/1
```

#### Response

```json
{
  "success": true,
  "message": "User portfolio fetched successfully.",
  "data": {
    "user": {
      "id": "1",
      "name": "Amit Sharma",
      "email": "amit.sharma@example.com",
      "wallet_balance": "1000.00",
      "created_at": "2026-05-02T16:52:41.050Z"
    },
    "investments": [
      {
        "property_id": "1",
        "price_per_slot": "100000.00",
        "total_slots": "5",
        "total_invested": "500000.00"
      }
    ],
    "walletTransactions": [
      {
        "id": "7",
        "user_id": "1",
        "amount": "100000.00",
        "type": "DEBIT",
        "reference_investment_id": "5",
        "created_at": "2026-05-03T05:33:21.898Z"
      }
    ]
  },
  "statusCode": 200,
  "timestamp": "2026-05-03T05:33:33.354Z"
}
```

---

### 4. Wallet Top-up

**POST** `/api/user/{user_id}/wallet/topup`

#### Request Body

```json
{
  "amount": 1000000
}
```

#### Response

```json
{
  "success": true,
  "message": "Wallet topped up successfully.",
  "data": {
    "id": "1",
    "name": "Amit Sharma",
    "email": "amit.sharma@example.com",
    "wallet_balance": "1001000.00",
    "created_at": "2026-05-02T16:52:41.050Z",
    "updated_at": "2026-05-03T05:34:01.960Z"
  },
  "statusCode": 201,
  "timestamp": "2026-05-03T05:34:01.974Z"
}
```

---

### 5. Create Investment

**POST** `/api/investment/`

#### Request Body

```json
{
  "user_id": 1,
  "property_id": 1,
  "slots": 1
}
```

#### Success Response

```json
{
  "success": true,
  "message": "Investment created successfully.",
  "data": {
    "id": "19",
    "user_id": "1",
    "property_id": "1",
    "slots": 1,
    "amount": "100000.00",
    "status": "ACTIVE",
    "created_at": "2026-05-03T07:21:03.445Z",
    "withdrawn_at": null
  },
  "statusCode": 201,
  "timestamp": "2026-05-03T07:21:03.468Z"
}
```

#### Rate Limit Response

```json
{
  "success": false,
  "message": "Too many investment requests, please try again later.",
  "error": null,
  "statusCode": 429,
  "timestamp": "2026-05-03T05:34:08.374Z"
}
```

---

### 6. Withdraw Investment

**POST** `/api/investment/{investment_id}/withdraw`

#### Example

```
/api/investment/1/withdraw
```

#### Response

```json
{
  "success": true,
  "message": "Withdrawal processed successfully.",
  "data": {
    "investment_id": "1",
    "refunded_amount": 98000,
    "fee": 2000,
    "status": "WITHDRAWN"
  },
  "statusCode": 200,
  "timestamp": "2026-05-03T07:21:22.754Z"
}
```

## Design Decisions & Assumptions

### Core Decisions

1. **Price per Slot Calculation**

   Price per slot is derived as:

   ```
   price_per_slot = total_property_value / total_slots
   ```

   For the scope of this project, all slots are assumed to have equal pricing.

   If variable slot pricing is required, slots would need to be managed as a separate entity/service with dedicated tables.



2. **Authentication & Authorization**

   Authentication and authorization are intentionally not implemented for this assignment.

   However:

   * The codebase is structured cleanly
   * It is easily extensible to integrate authentication/authorization mechanisms in the future



3. **Transactions**

   A dedicated **transactions table** is maintained (even though not explicitly required in the problem statement) to ensure:

   * Financial traceability
   * Auditability of all wallet operations

   Constraints:
   * Wallet balance is always non-negative

4. **Currency & Precision Handling**

   * All monetary values are handled in **Indian Rupees (INR)**
   * Precision is limited to **2 decimal places** for simplicity and consistency

## Core Flows

### Create Investment Flow

```
BEGIN TRANSACTION
   ↓
Fetch Property (FOR UPDATE - lock row)
   ↓
Fetch User (FOR UPDATE - lock row)
   ↓
Check slot availability
   ↓
Ensure sufficient wallet balance
   ↓
Reserve slots
   ↓
Debit user wallet balance
   ↓
Create investment record
   ↓
Record debit in transactions table
   ↓
COMMIT
   ↓
Release locks
```

---

### Withdraw Investment Flow

```
Calculate refund amount (after 2% exit fee)
   ↓
BEGIN TRANSACTION
   ↓
Fetch Property (FOR UPDATE)
   ↓
Fetch User (FOR UPDATE)
   ↓
Release slots back to property
   ↓
Credit refund amount to wallet
   ↓
Mark investment as WITHDRAWN
   ↓
Record credit in transactions table
   ↓
COMMIT
   ↓
Release locks
```

---

### Get User Portfolio Flow

```
Fetch user details (User Service)
   ↓
Fetch investments (Investment Service)
   ↓
Fetch wallet transactions (Wallet Service)
   ↓
Aggregate and compose response
   ↓
Return from Portfolio Service
```
