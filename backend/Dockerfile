FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean -DskipTests package -DskipTests

FROM eclipse-temurin:21-jdk
WORKDIR /app
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
