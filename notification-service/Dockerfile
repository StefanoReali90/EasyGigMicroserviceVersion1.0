FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY notification-service/pom.xml notification-service/
COPY discovery-server/pom.xml discovery-server/
COPY api-gateway/pom.xml api-gateway/
COPY profile-service/pom.xml profile-service/
COPY booking-service/pom.xml booking-service/
COPY chat-service/pom.xml chat-service/

RUN mvn dependency:go-offline -B
COPY notification-service/src notification-service/src
RUN mvn package -Dmaven.test.skip=true -pl notification-service -am

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/notification-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
