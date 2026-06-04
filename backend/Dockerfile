# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom.xml and download dependencies first (layer cache)
COPY pom.xml ./
RUN mvn dependency:go-offline -q

# Copy source and build (skip tests in build stage)
COPY src ./src
RUN mvn package -DskipTests -q

# ─────────────────────────────────────────────
# Stage 2: Production Runtime
# ─────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS production

# Create non-root user for security
RUN addgroup -S academix && adduser -S academix -G academix
WORKDIR /app

# Copy built JAR
COPY --from=builder /app/target/*.jar app.jar

# Set file ownership
RUN chown academix:academix app.jar

USER academix

EXPOSE 8082

# JVM tuning for containers
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
