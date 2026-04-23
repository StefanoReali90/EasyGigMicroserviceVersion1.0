# EasyGIG - Microservices-based Live Music Booking Platform

EasyGIG is a scalable backend system designed to simplify the booking process for live music events, connecting Artists, Venues, and Promoters. The system is built using a microservices architecture to ensure high availability and independent scalability of core business domains.

## Architecture Overview

The system is composed of several independent services communicating via REST and asynchronous events:

*   API Gateway: The entry point of the system. It handles request routing and centralizes security by validating JWT tokens and propagating user identity through custom headers.
*   Discovery Server (Netflix Eureka): Manages service registration and discovery, allowing internal communication between microservices without hardcoded IPs.
*   Profile Service: Manages User identities (Artists, Promoters, Venues), reputation systems, and account statuses (including strike/ban management).
*   Booking Service: Handles the core business logic: slot availability, booking requests, promoter group bookings, and the review system.
*   Notification Service: An event-driven service that reacts to system events (e.g., invitations) via Kafka.

## Key Features

*   Event-Driven Strike System: Automated strike assignment for expired bookings or venue cancellations using Apache Kafka to maintain data consistency across services.
*   Reputation System: Dynamic calculation of user reputation based on post-event reviews, integrated into search filters.
*   Security & Identity: Centralized JWT authentication at the Gateway level. Microservices are "identity-aware" through secure header propagation.
*   Advanced Search: Multi-criteria search for Venues (by name, city, and reputation) with optimized JPA queries.
*   Booking Restrictions: Enforced 48-hour window for user cancellations and automated 5-day expiration for unanswered requests via Spring Scheduler.

## Tech Stack

*   Java 17 / Spring Boot 3
*   Spring Cloud (Gateway, Eureka)
*   Data Persistence: PostgreSQL / Spring Data JPA
*   Messaging: Apache Kafka
*   Security: JWT (JSON Web Tokens)
*   DevOps: Docker & Docker Compose (Containerization in progress)
*   Other: Lombok, MapStruct (DTO mapping)

## Getting Started

### Prerequisites
*   JDK 17 or higher
*   Maven
*   Kafka & PostgreSQL instances (or Docker)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/EasyGig-Microservices.git
   ```
2. Configure environment variables in the .env file (Database credentials, Kafka brokers, JWT secret).
3. Build the project:
   ```bash
   mvn clean install
   ```
4. Run the services in the following order:
   - Discovery Server
   - API Gateway
   - All other microservices