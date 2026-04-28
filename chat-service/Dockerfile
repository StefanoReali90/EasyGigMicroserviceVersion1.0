FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY booking-service/pom.xml booking-service/
COPY discovery-server/pom.xml discovery-server/
COPY api-gateway/pom.xml api-gateway/
COPY profile-service/pom.xml profile-service/
COPY notification-service/pom.xml notification-service/
COPY chat-service/pom.xml chat-service/

RUN mvn dependency:go-offline -B

COPY chat-service/src chat-service/src

RUN mvn package -DskipTests -pl chat-service -am

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/chat-service/target/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]