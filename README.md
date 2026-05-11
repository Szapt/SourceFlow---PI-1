# SourceFlow P1 (Front + Back)

## Estructura
- `Front P1/`: Frontend (TanStack Start + Vite)
- `Back-P1/`: Backend (Spring Boot / Gradle)
- `docker-compose.yml`: levanta el front en `5173`

## Ejecutar Front

```bash
cd "Front P1"
npm install
npm run dev
```

## Ejecutar Back

```bash
cd Back-P1
./gradlew bootRun
```

## Docker (Front)

```bash
docker compose up --build
```
