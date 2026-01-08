Backend for this project (Express + MySQL)

Quick start

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies: `npm install`
3. Run in development: `npm run backend:dev`
4. Healthcheck: GET http://localhost:4000/health
5. Example users endpoint: GET http://localhost:4000/api/users

Notes
- Uses `mysql2/promise` with a connection pool in `server/db.js`.
- The `users` table used by the example routes is assumed to exist with columns `id` (PK autoinc), `name`, `email`.

Migrations

1. Configure your `.env` with DB credentials.
2. Run migrations:

```
npm run migrate
```

This runs SQL files in `server/migrations` in lexicographic order.
