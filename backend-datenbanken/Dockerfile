## Stage 1: Build the JAR file
#FROM gradle:8.7-jdk21 AS build-stage
#
## Set working directory for backend
#WORKDIR /home/gradle/project
#
## Copy Gradle build files
#COPY build.gradle settings.gradle ./
#COPY gradle gradle/
#COPY src src/
#
#RUN gradle clean
#
#RUN gradle bootJar -x test

# Stage 2: Run the JAR file
FROM openjdk:21-jdk-slim

# Set working directory for backend
WORKDIR /app

COPY src src/
# Copy the JAR file from the build stage
COPY build/libs/*.jar app.jar

# Expose the application port (default for Spring Boot is 8080)
EXPOSE 8080

# Run Gradle build to generate the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]