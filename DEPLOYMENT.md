# RefLink SL Deployment

## GitHub

Push this project to:

```bash
git init
git branch -M main
git remote add origin https://github.com/MEDVONJOSON/ASAM-S-RefLink-SL.git
git add .
git commit -m "Prepare backend for Prisma and Render"
git push -u origin main
```

If the remote repository already has files, run `git fetch origin` first and merge the remote history before pushing.

## Render

Create one PostgreSQL database and one Web Service. The app expects:

```text
DATABASE_URL
```

Recommended Web Service settings:

```text
Build Command: corepack enable && pnpm install --frozen-lockfile && pnpm build
Pre-Deploy Command: pnpm db:deploy
Start Command: pnpm start
```

The included `render.yaml` can also be used as a Render Blueprint.

## Admin Account

After the database exists, set these environment variables before running the admin script:

```text
ADMIN_NAME
ADMIN_PHONE
ADMIN_EMAIL
ADMIN_PASSWORD
```

Then run:

```bash
pnpm admin:create
```

No demo users, demo businesses, or file-backed `.data` records are used in production.
