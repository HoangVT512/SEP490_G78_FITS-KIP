# ARCHITECTURE.md

## Architecture Overview

This document describes the general structure of the FITSKIP project to help everyone quickly understand the code organization, data flow, main components, and boundaries.  
Update this document when there are major design changes.

---

## 1. Project Structure

High-level folder structure, organized by layer/major module:

FITSKIP/
├── src/
│ ├── FITSKIP.API/ # Presentation Layer – API Controllers, Middlewares
│ ├── FITSKIP.Application/ # Use Cases, DTOs, Service Interfaces
│ ├── FITSKIP.Domain/ # Entities, Value Objects, Business Rules
│ └── FITSKIP.Infrastructure/ # Persistence, Repositories, External Services
├── clients/
│ ├── web/ # React + TypeScript frontend
│ └── mobile/ # React Native (Expo) mobile app
├── tests/
│ ├── FITSKIP.Domain.Tests/
│ └── FITSKIP.Application.Tests/
├── docs/
│ ├── architecture.md # This document
│ └── api-spec.postman.json # API test collection
├── .github/
│ └── workflows/ # CI/CD, GitHub Actions
├── .gitignore
└── README.md

---

## 2. High-Level System Diagram

General flow between the main components:

    +----------------------+
    |   Presentation       |
    |   (API Controllers)  |
    +----------+-----------+
               |
               v
    +----------------------+
    |   Application        |
    |  (Use Cases, DTOs,   |
    |   Services)          |
    +----------+-----------+
               |
               v
    +----------------------+
    |   Domain             |
    | (Entities, Value Obj,|
    |  Business Rules)     |
    +----------+-----------+
               ^
               |
    +----------------------+
    | Infrastructure       |
    | (EF Core, Repos,     |
    |  External Services)  |
    +----------------------+

Explanation:
- Web & Mobile clients send HTTP requests to API Controllers.  
- Controllers handle requests → call Service / Use Case from Application.  
- Application layer uses Domain to process core logic (business rules, validation), and asks Infrastructure for data access or external interaction.  
- Infrastructure performs data persistence (DB), external API calls if needed.  

---

## 3. Core Components

Below are the main components, responsibilities, and technologies:

| Component | Responsibility | Key Technologies / Notes |
|---|---|---|
| **API (Presentation)** | Receive HTTP requests, distribute to Use Cases, handle errors, authentication, return responses | ASP.NET Core, Controllers, Middleware, Routing, JWT (if used) |
| **Application Layer** | Define Use Cases / Service Interfaces, orchestrate logic, mapping DTO ↔ Entities | AutoMapper, Interface, Dependency Injection |
| **Domain Layer** | Contains Entities, Value Objects, Enums, Business Rules, Domain Services | Independent from EF Core or frameworks — pure domain logic |
| **Infrastructure** | Persist data (EF Core), implement IRepository, external services (email, storage…), DB configuration, migrations | Entity Framework Core, SQL Server (or chosen DB), external libraries if needed |
| **Clients – Web / Mobile** | User interface, send requests to API, display data, handle UX, state management | React + TypeScript (Web), React Native + Expo (Mobile), Axios/fetch, React Router / Navigation, State management (Context / Redux / React Query...) |
| **Tests** | Unit tests for Application + Domain; Integration tests for API | xUnit or NUnit, Moq / Mocking framework |

---

## 4. Dependency Rules & Architectural Invariants

- **Direction of dependencies**:  
  Domain ← Application ← API & Infrastructure  
  (Domain does not know about Application, Infrastructure, or Presentation)  

- **Boundaries**:  
  - Domain contains no specific framework, no EF Core or ASP.NET Core code.  
  - Infrastructure only implements interfaces from Application / Domain.  
  - API only calls Application + Infrastructure, no heavy domain logic inside Controllers.  

- **Invariants**:  
  - Domain always contains pure business logic.  
  - DTO / Mapping does not leak Entity.  
  - Do not put business logic into Controller.  

---

## 5. Cross-Cutting Concerns

Concerns that affect multiple components and must be handled consistently:

- **Logging & Tracing** – use `ILogger<T>` across API + Infrastructure.  
- **Error Handling** – global error handling, return proper HTTP status codes.  
- **Security** – authentication/authorization, endpoint protection, input validation.  
- **Configuration & Secrets** – use `appsettings.json`, environment, user-secrets or environment variables.  
- **Validation** – input validation (DTOs), model binding, pre-check before calling service.  

---

## 6. Why This Architecture & When To Change

- Clear separation between frequently changing parts (UI, API, persistence) and stable part (domain).  
- Easy to extend: add new features by adding services in Application + Infrastructure without breaking Domain.  
- Easy to test: test Use Cases / Domain logic independently without DB.  
- When to consider refactoring:  
  - When domain layer becomes too complex → split into sub-modules.  
  - When scaling Infrastructure (e.g., change DB or add microservice).  

---

## 7. Glossary

- **Domain**: business rules, Entities, Value Objects.  
- **Use Case / Service**: handles business logic, orchestrates between Domain + Infrastructure.  
- **DTO**: Data Transfer Object – used for request/response, separate Entity from API.  
- **Repository**: interface for data access; Infrastructure will implement.  

---

## 8. Entry Points

- `Program.cs` in MyProject.API is the application entry point, configuring DI, routing, middleware.  
- `AppDbContext` in Infrastructure connects to DB and manages migrations.  
- Controller routes diagram (e.g., `/api/customers`, `/api/products`) helps locate code when modifying related features.  

---
