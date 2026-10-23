# CartNova Database (PostgreSQL + Prisma)

Database layer for CartNova: Prisma schema, migrations, and seed data.
Tested against PostgreSQL 16 (works with 13+).

## Quick start

1. Install PostgreSQL (https://www.postgresql.org/download/) and remember the
   password you set for the `postgres` superuser. Make sure the service is running.
2. Create the role and database. Open **SQL Shell (psql)** or pgAdmin's Query Tool
   as `postgres` and run:
   ```sql
   CREATE USER cartnova WITH PASSWORD 'change_me_dev_only' CREATEDB;
   CREATE DATABASE cartnova OWNER cartnova;
   ```
   `CREATEDB` is required: `prisma migrate dev` creates a temporary shadow database.
3. Install and configure:
   ```bash
   cd database
   npm install
   cp .env.example .env        # Windows: copy .env.example .env
   ```
   Edit `.env` if your user, password, or port differ.
4. Apply migrations and seed:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
5. Optional: `npm run db:studio` to browse data.

Demo login (dummy, dev only): `demo.user@cartnova.test` with the value of
`SEED_DEMO_PASSWORD` from your `.env`.

## Commands

| Purpose | Command |
|---|---|
| Apply dev migrations | `npx prisma migrate dev` |
| Create a new migration | `npx prisma migrate dev --name <change>` |
| Generate Prisma Client | `npx prisma generate` |
| Seed (repeatable) | `npx prisma db seed` |
| Reset (disposable local DB only) | `npx prisma migrate reset` |
| Apply existing migrations (CI) | `npx prisma migrate deploy` |

**Never** run `migrate reset` against a shared database. **Never** edit tables by
hand without capturing it in a migration. Each developer runs a local PostgreSQL.

## Conventions

- Models PascalCase, fields camelCase, tables snake_case plural (`@@map`).
- Columns are camelCase and quoted in raw SQL, e.g. `"stockQuantity"`.
- Money is `NUMERIC(10,2)`. In JS use `Prisma.Decimal`, never floats.
- `order_items` stores `productName`, `unitPrice`, `lineTotal` snapshots.
- The backend validates stock, coupons, and final totals. DB CHECK constraints
  (price >= 0, stock >= 0, quantity > 0) are a safety net only.

## Models

User, Category, Product, Cart, CartItem, Coupon, CouponUsage, RewardRule,
UserReward, UserPreference, Order, OrderItem, PasswordResetToken.
See `docs/API-FIELDS.md` for field names and types.

## Seed data

5 categories, 21 products, 6 coupons (percentage, fixed, minimum-spend,
category-specific, first-order, expired) and reward rules at 3000, 5000, 8000.
Re-running the seed updates records in place and creates no duplicates.
Re-seeding resets product price and stock to seed values.

## Troubleshooting

- **P1001 can't reach database:** PostgreSQL service isn't running, or the host/port is wrong.
- **P1000 authentication failed:** wrong user/password in `.env`.
- **P3014 / shadow database error:** the role lacks `CREATEDB`. Run `ALTER USER cartnova CREATEDB;`.
- **Permission denied for schema public:** run `ALTER DATABASE cartnova OWNER TO cartnova;` as `postgres`.
- **Drift detected:** someone changed tables manually. On a disposable local DB, run `npx prisma migrate reset`.
