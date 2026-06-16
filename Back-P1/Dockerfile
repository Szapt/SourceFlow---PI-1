# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jdk AS builder

WORKDIR /app

# Copia los wrappers primero para aprovechar la caché de capas
COPY gradlew .
COPY gradle/ gradle/
RUN chmod +x gradlew

# Descarga dependencias (capa separada, se reutiliza si build.gradle no cambia)
COPY build.gradle settings.gradle ./
RUN ./gradlew dependencies --no-daemon -q || true

# Copia el código fuente y compila
COPY src/ src/
RUN ./gradlew bootJar --no-daemon -x test

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=builder /app/build/libs/Back-P1-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
