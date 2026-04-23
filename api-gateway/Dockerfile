FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
LABEL authot = "Stefano Reali"

COPY pom.xml .
COPY api-gateway/pom.xml ./api-gateway/
COPY discovery-server/pom.xml ./discovery-server/
COPY profile-service/pom.xml ./profile-service/
COPY booking-service/pom.xml ./booking-service/
COPY notification-service/pom.xml ./notification-service/

RUN mvn package -DskipTests -pl api-gateway -am

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]