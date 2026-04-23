#Phase 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
LABEL authors="Stefano Reali"

# Copy the pom.xml files to the build context
COPY pom.xml .
COPY discovery-server/pom.xml ./discovery-server/
COPY api-gateway/pom.xml ./api-gateway/
COPY profile-service/pom.xml ./profile-service/
COPY booking-service/pom.xml ./book-service/
COPY notification-service/pom.xml ./notification-service/

# Download the dependencies for all modules
RUN mvn dependency:go-offline -B
# Copy the source code for the discovery server and build it
COPY discovery-server/src ./discovery-server/src
RUN mvn package -DskipTests -f discovery-server -am

#Phase2: Run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
LABEL authors="Stefano Reali"
COPY --from=build /app/discovery-server/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]