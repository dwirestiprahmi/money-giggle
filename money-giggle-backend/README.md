# Money Manager — Backend

Spring Boot 3 REST API for the Money Manager app.

## Tech Stack

- Java 21
- Spring Boot 3.2 (Web, Security, Data JPA, Validation, WebFlux)
- PostgreSQL 16 + Flyway migrations
- JWT authentication (jjwt 0.12)
- Tesseract OCR (receipt scanning)
- Maven

---

## Prerequisites

- Java 21+
- Maven 3.9+
- PostgreSQL 16 (or Docker)
- Tesseract OCR (`brew install tesseract` / `apt install tesseract-ocr`)

---

## Quick Start

### 1. Database via Docker (easiest)

```bash
docker compose up postgres -d
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set DB credentials and a JWT_SECRET
```

### 3. Run

```bash
mvn spring-boot:run
```

API is available at `http://localhost:8080`.

---

## Run with Docker (full stack)

```bash
docker compose up --build
```

---

## Run Tests

```bash
mvn test
```

---