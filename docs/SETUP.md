# Alexander OS — Account & Secrets Setup

One-time setup for the services chosen in `ARCHITECTURE.md` → Decisions. Everything is on a free plan. Takes about 30 minutes. Do the steps in order: step 3 needs the URL from step 1.

**Never paste a secret into chat, an issue, or a committed file.** Secrets go only in `.env.local` (git-ignored), Vercel environment variables, or GitHub Actions secrets.

---

## 1. Vercel (hosting)

1. Go to https://vercel.com/signup and choose **Continue with GitHub** (account `Alexman39`). Pick the **Hobby** plan.
2. **Add New… → Project**, then import `Alexman39/alexander-os`. If it isn't listed, click **Adjust GitHub App Permissions** and allow that repo.
3. Leave the defaults (Framework: Next.js; Root Directory: `./`) and click **Deploy**. The current prototype needs no environment variables, so the deploy should succeed as is.
4. Note the production URL shown afterwards, e.g. `https://alexander-os.vercel.app`. You need it in step 3.
5. *(Recommended)* **Settings → Functions → Function Region**: choose **Frankfurt (fra1)**, close to Athens and to the database in step 2.

From now on every push to `main` deploys automatically, and other branches get preview URLs.

## 2. Neon Postgres (database), created through Vercel

1. In the Vercel project, open the **Storage** tab, then **Create Database** → **Neon** (Serverless Postgres) → **Continue**.
2. Accept the Neon terms. This creates a Neon account linked to Vercel.
3. Plan: **Free**. Region: **AWS eu-central-1 (Frankfurt)**. Name: `alexander-os`.
4. Connect it to the project for **Development, Preview and Production**. Vercel adds `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and related variables automatically.

## 3. GitHub OAuth apps (sign in with GitHub)

A GitHub OAuth app allows only one callback URL, so create **two**: one for local development and one for production.

Go to https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**.

| Field | Dev app | Prod app |
|---|---|---|
| Application name | `Alexander OS (dev)` | `Alexander OS` |
| Homepage URL | `http://localhost:3000` | your Vercel URL from step 1 |
| Authorization callback URL | `http://localhost:3000/api/auth/callback/github` | `<your Vercel URL>/api/auth/callback/github` |
| Enable Device Flow | off | off |

For each app: click **Register application**, copy the **Client ID**, then **Generate a new client secret** and copy it right away (it is shown only once).

## 4. Gemini API key (AI, free tier)

1. Go to https://aistudio.google.com and sign in with a Google account.
2. Click **Get API key** → **Create API key** (accept the default Google Cloud project it offers).
3. Copy the key. **Do not enable billing** on that project, so it stays on the free tier.

## 5. Generate the two app secrets

Run this twice in a terminal. One output is `BETTER_AUTH_SECRET`, the other is `CRON_SECRET`:

```bash
openssl rand -base64 32
```

## 6. Put the values where they belong

### Vercel (production)
Project → **Settings → Environment Variables**. Add each variable for the **Production** environment:

| Name | Value |
|---|---|
| `BETTER_AUTH_SECRET` | a secret from step 5 |
| `BETTER_AUTH_URL` | your Vercel URL (no trailing slash) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | from the **prod** OAuth app |
| `OWNER_GITHUB_ID` | `89802016` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | from step 4 |
| `CRON_SECRET` | the other secret from step 5 |

`DATABASE_URL*` are already there from step 2.

### Your machine (development)
In the project folder:

```bash
npm i -g vercel        # Vercel CLI, once
vercel login
vercel link            # choose the alexander-os project
vercel env pull .env.local   # downloads the database variables
```

Then open `.env.local` and add the remaining values, using `.env.example` as the checklist. Use the **dev** OAuth app's ID and secret, and `BETTER_AUTH_URL=http://localhost:3000`. Use a different `BETTER_AUTH_SECRET` from production if you like.

### GitHub Actions (scheduled jobs)
Repo → **Settings → Secrets and variables → Actions → New repository secret**:
- `CRON_SECRET`: the same value as in Vercel.
- `APP_URL`: your Vercel URL.

(Repository secrets stay private even though the repo is public.)

## 7. Done: check before telling Claude

- [ ] Vercel production URL opens the prototype.
- [ ] Neon database shows as connected in the Vercel **Storage** tab.
- [ ] `.env.local` exists locally and `git status` does **not** list it.
- [ ] All Vercel variables from step 6 are present.
- [ ] GitHub Actions secrets `CRON_SECRET` and `APP_URL` exist.

Then tell Claude "setup done". Don't share any of the values.
