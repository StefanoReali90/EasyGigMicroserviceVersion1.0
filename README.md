EasyGIG - Concert Management System (Microservices)

EasyGIG is a modern, scalable event management platform designed to streamline the organization of live music and concerts. Built using a microservices architecture, it facilitates seamless collaboration between three key stakeholders: Artists/Bands, Artistic Directors (Venue Managers), and Promoters/Booking Agents.
Project Vision

The mission of EasyGIG is to professionalize the booking process. It ensures accountability through a behavioral review system and an automated sanctioning mechanism for organizational negligence.
Technical Architecture

The system follows a "Database per Service" pattern, ensuring high decoupling and independent scalability. Services communicate asynchronously via Apache Kafka and are orchestrated using Spring Cloud.
Core Components:

    API Gateway: The centralized entry point for all external client requests.

    Service Discovery (Eureka): Handles dynamic registration and discovery of all microservice instances.

    Profile Service: Manages user identities, venues, and artist profiles. It includes a geo-spatial logic for Nations, Regions, and Cities.

    Booking Service: The logic engine of the platform. It manages calendars, slot availability, and the entire reservation workflow.

    Notification & Sanction Service: Automates transactional emails and monitors response times. It applies "strikes" and temporary 14-day bans for non-compliance.

🛠️ Tech Stack

    Backend: Java 21, Spring Boot 3.x

    Microservices: Spring Cloud (Eureka, Gateway, Config)

    Persistence: PostgreSQL, Spring Data JPA

    Messaging: Apache Kafka (Event-driven communication)

    Mapping: MapStruct (High-performance Entity/DTO conversion)

    Utilities: Lombok, Jakarta Persistence

    DevOps: Docker, Docker Compose

🛡️ Key Features

    Strict Decoupling: Each service is isolated; for instance, the Profile Service handles user data without needing direct access to the booking database.

    Automated Accountability: The system tracks a 5-day response window for booking requests. Failure to respond results in an automated strike and potential temporary banning.

    Behavior-Based Reviews: Actors rate each other on organizational conduct (1-5 stars) rather than musical performance. Reviews are only enabled after event completion or cancellation.

    Advanced Discovery: Venues can search for artists by genre, name, or location, while artists can filter venues by capacity and equipment.

⚙️ How to Run (Work in Progress)

    Clone the repository.

    Spin up the infrastructure (PostgreSQL, Kafka) using docker-compose up.

    Start the services in order: Discovery Server, Gateway, and then the individual Microservices.