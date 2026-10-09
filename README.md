# ticket-service by Erockion

Starter project for building a REST API with NestJS, PostgreSQL, TypeORM and JWT authentication.

## Requirements

* Node.js
* pnpm
* PostgreSQL

## Installation

```bash
pnpm install
```

Copy the environment file:

```bash
cp .env.example .env
```

Then update the values in `.env`.

## Development

Start the application:

```bash
pnpm start:dev
```

The API is available at:

```text
http://localhost:3000
```

## Tests

Run unit tests:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test:watch
```

Run e2e tests:

```bash
pnpm test:e2e
```

### Code Quality

Run all code quality checks and tests:

```bash
pnpm quality
```

This command runs the following steps in order:
- **TypeScript type checking** (`typecheck`)
- **Prettier formatting check** (`format:check`)
- **Automatic code formatting** (`format`)
- **Unit tests** (`test`)

The process stops if any command fails.

## Stack

* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* JWT
* Passport
* Vitest
* pnpm

### Create the first administrator

The `POST /admin/users` route is protected by the `ADMIN` role.

To create the first administrator:

1. Temporarily remove the following guards from the route:
```ts
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN)
```

2. Create the first user with `POST /admin/users`.

3. Update the user's role directly in the database:
```sql
UPDATE "user"
SET role = 'admin'
WHERE email = 'admin@example.com';
```

4. Restore the guards on the route.
The created user can now log in and access the administrator routes.
