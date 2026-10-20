# Run the website locally

You need Node.js 24 LTS (includes npm). To test the scorecard, you also need a running PostgreSQL server and its `createdb` command.

## 1. Install dependencies

Open Terminal and run:

```sh
cd "/Volumes/T9 SSD/DeveloperProjects_SSD/grismont-nextjs"
node --version
npm --version
npm ci
```

Run `npm ci` on first setup or after dependency changes.

## 2. Set up local configuration

If `.env.local` does not already exist, create it:

```sh
cp -n .env.example .env.local
```

Open `.env.local` in your editor. For a local PostgreSQL server on port 5432, use:

```dotenv
DATABASE_URL=postgres://localhost:5432/grismont_scorecard
APP_URL=http://127.0.0.1:3100
RESEND_API_KEY=
OWNER_NOTIFY_EMAIL=test@example.com
IP_HASH_SALT=local-testing-only-change-before-production
CRON_SECRET=local-cron-only-change-before-production
SCORECARD_INTAKES_PER_HOUR=100
```

If PostgreSQL requires credentials, use `postgres://YOUR_USER:YOUR_PASSWORD@localhost:5432/grismont_scorecard`. Adjust the port if your server uses another one.

Leave `RESEND_API_KEY` empty: generated emails and PDF attachments are saved in `.outbox/`. Next.js loads `.env.local` automatically; restart the dev server after changing it.

## 3. Prepare the scorecard database

With PostgreSQL running:

```sh
createdb -h localhost -p 5432 grismont_scorecard
npm run db:migrate
```

Create the database once; if it already exists, skip `createdb`. Use the same host, port and username as your connection string (`-U YOUR_USER` if needed).

You can skip the database setup when testing only the homepage and legal pages.

## 4. Start the website

```sh
npm run dev -- --port 3100
```

Keep this terminal running, then open:

- Homepage: <http://127.0.0.1:3100>
- Scorecard: <http://127.0.0.1:3100/scorecard>
- Hungarian homepage: <http://127.0.0.1:3100/hu>
- Hungarian scorecard: <http://127.0.0.1:3100/hu/scorecard>

Saved code changes update the browser automatically. Press **Ctrl+C** to stop the server. On later visits, run the same dev command from the project folder.

## Optional checks

In a second terminal in the project folder:

```sh
npm run typecheck
npm test
```

For browser tests, with the database configured (these create test submissions):

```sh
npx playwright install chromium
npm run test:e2e
```

If port 3100 is busy, stop the other server or choose another port and update `APP_URL`. The browser tests expect port 3100. Database connection errors usually mean PostgreSQL is stopped or the connection string is incorrect.
