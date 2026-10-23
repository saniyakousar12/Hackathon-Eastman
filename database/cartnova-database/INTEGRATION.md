# Integration steps (database branch to the team repo)

1. `git clone <repo-url> && cd <repo>`
2. `git checkout main && git pull origin main`
3. `git checkout -b feature/database`
4. Copy this folder into the repo root as `database/`.
5. Append this folder's `.gitignore` lines to the root `.gitignore` if missing.
6. Create your local `.env` from `.env.example` (never commit it).
7. Create the PostgreSQL role and database (see README step 2).
8. Test on a clean DB: `npm install`, `npx prisma migrate dev`, `npx prisma db seed` (twice).
9. `git status` must NOT list `.env`.
10. `git add database .gitignore`
11. `git commit -m "feat(database): add PostgreSQL Prisma schema, migrations, and seed data"`
12. `git push -u origin feature/database`
13. Open a Pull Request into `main` (or your team's integration branch) and request
    review from the Backend Developer. After merge, teammates run:
    `git pull`, `cd database`, `npm install`, `npx prisma migrate dev`, `npx prisma db seed`.
