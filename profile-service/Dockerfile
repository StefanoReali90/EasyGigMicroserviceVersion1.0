FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY profile-service/pom.xml profile-service/
COPY discovery-server/pom.xml discovery-server/
COPY api-gateway/pom.xml api-gateway/
COPY booking-service/pom.xml booking-service/
COPY notification-service/pom.xml notification-service/
RUN mvn dependency:go-offline -B
COPY profile-service/src profile-service/src
RUN mvn package -DskipTests -pl profile-service -am
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/profile-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]