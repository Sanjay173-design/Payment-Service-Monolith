# 💳 Payment Service (Monolith)

A production-style payment processing backend built using **Node.js, Express, PostgreSQL, Kafka**.

This project simulates real fintech backend architecture including payment processing, ledger accounting, settlement tracking, webhook handling, idempotency, and event-driven communication.

---

# 🚀 Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Kafka (KafkaJS)
- Redis
- JWT Authentication
- Docker (Kafka + Zookeeper)

---

# 🧠 Core Features

## 💳 Payment Processing
- Create payment
- Payment status tracking
- Payment reference generation
- Secure webhook verification

---

## 🔔 Webhook Processing
- External payment gateway simulation
- Signature verification
- Event publishing to Kafka

---

## 📒 Ledger System
- Double-entry accounting style entries
- Credit / Debit tracking
- Account based balance tracking
- Escrow support

---

## 🏦 Settlement System
- Settlement record generation
- Settlement state tracking
- Batch settlement ready structure

---

## ⚡ Event Driven Architecture
Kafka Topics Used:
- `payment-events`
- (Retry / DLQ ready structure)

Event Consumers:
- Ledger Processing
- Settlement Processing

---

## 🔁 Idempotency Support
- Event processing tracking
- Duplicate prevention
- Safe retry handling

---

## 🔐 Environment Variables

Create `.env` file:

## 🗄 Database Setup

Make sure PostgreSQL is running.

## Kafka Setup (Docker)
Start Kafka + Zookeeper:
docker compose -f docker-compose.kafka.yml up -d

## Payment Flow (High Level)
-User Creates Payment
- ↓
- Payment Gateway Simulation
- ↓
- Webhook Receives Status
- ↓
- Kafka Event Published
- ↓
- Ledger Entry Created
- ↓
- Settlement Record Created

## 🧪 Testing Webhook Example
{
  "paymentRef": "PAY_123456",
  "status": "SUCCESS",
  "gatewayData": {
    "amount": 3000
  }
}

## 🧱 Architecture Type

Monolith with internal event-driven modules.
Supports migration to microservices (ledger, settlement, payment split ready).

## 📌 Future Improvements

- Microservice Split (This Monolith Project Will Be Converted to Microservice)
- Dead Letter Queue (DLQ)
- Retry Topics
- Schema Registry
- Event Versioning
- Settlement Scheduler (CRON)
- API Gateway Layer

## 👨‍💻 Author
- HN Sanjay
Built as a real-world backend architecture learning project.

