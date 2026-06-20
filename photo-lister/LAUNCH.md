# LAUNCH.md — eBay Photo-to-Draft Lister

The CMA agent is already created. This guide covers deploying the web page to Vercel.

## What you already have
- 🤖 Agent: `agent_01PC3nVVexv4XAs7LqXmQujw` (claude-opus-4-8)
- 📦 Environment: `env_01CNp7PbsRcGm1iXoZMNfdxA`
- 🔐 Vault: `vlt_011CcDr6DtziMngRqXuBrWEk` (eBay credentials)

---

## Step 1 — Deploy to Vercel

1. Go to **vercel.com** → click **Add New Project**
2. Click **Import Git Repository** → select **catalfamo28/SleepCalm**
3. Under **Root Directory**, click Edit and type: `photo-lister/web`
4. Click **Deploy**

---

## Step 2 — Add environment variables in Vercel

After deploy, go to your project → **Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (from platform.claude.com → API Keys) |
| `CMA_AGENT_ID` | `agent_01PC3nVVexv4XAs7LqXmQujw` |
| `CMA_ENV_ID` | `env_01CNp7PbsRcGm1iXoZMNfdxA` |
| `CMA_VAULT_ID` | `vlt_011CcDr6DtziMngRqXuBrWEk` |
| `BLOB_READ_WRITE_TOKEN` | From Vercel → Storage → Create Blob Store → copy token |

Then go to **Deployments → Redeploy** (top right) to pick up the new env vars.

---

## Step 3 — Enable Vercel Blob Storage

1. In your Vercel project → **Storage** tab → **Create Database** → **Blob**
2. Name it anything (e.g. `item-photos`)
3. Click **Create** — Vercel will auto-add `BLOB_READ_WRITE_TOKEN` to your env vars

---

## Step 4 — Test it

Open your Vercel URL on your phone (e.g. `https://your-project.vercel.app`).
Tap the upload area, take a photo, tap **Create eBay Draft**.
After ~2–3 minutes the result appears on screen.
Check **eBay Seller Hub → Manage Listings → Scheduled** to find your draft.

---

## Step 5 — Save your URL

Bookmark the Vercel URL on your phone's home screen:
- iPhone: Safari → Share → Add to Home Screen
- Android: Chrome → Menu → Add to Home Screen

It works like an app from there.
