# ZYREAI — Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Step 1 — Push code to GitHub
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select scope: **`repo`** (full control of private repositories)
4. Copy the token (starts with `ghp_`)
5. In the ZYREAI app, open a project → click **Push to GitHub** button
6. Enter your token, GitHub username, and repo name → Push

### Step 2 — Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repository (`abdussamad6612/zyreai`)
3. Vercel auto-detects Remix — click **Deploy**
4. Add these **Environment Variables** in Vercel dashboard:

| Variable | Value |
|---|---|
| `SESSION_SECRET` | Any random string (32+ chars) |
| `OPENAI_API_KEY` | `sk-...` |
| `GEMINI_API_KEY` | `AI...` |
| `GROQ_API_KEY` | `gsk_...` |

5. Click **Deploy** ✓

---

## ☁️ Deploy to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create project
2. Connect GitHub repo
3. **Build command**: `pnpm install --no-frozen-lockfile && pnpm run build`
4. **Build output**: `build/client`
5. Add same environment variables
6. Deploy ✓

---

## 💻 Run Locally

```bash
# Clone repo
git clone https://github.com/abdussamad6612/Ai-website-builder
cd Ai-website-builder

# Install deps
pnpm install

# Start dev server
pnpm run dev
```

Open: **http://localhost:5000**

Admin panel: **http://localhost:5000/admin**

---

## 🔑 Required Environment Variables

```env
SESSION_SECRET=your-random-secret-here

# Add at least ONE AI provider key:
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AI...
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
```

---

## 🔧 GitHub Token — Fix Permissions

If getting "Resource not accessible" error:

1. **Delete old token** at [github.com/settings/tokens](https://github.com/settings/tokens)
2. **Create classic PAT** (not fine-grained):
   - Click "Generate new token (classic)"
   - Select `repo` scope (full access)
   - Copy token starting with `ghp_`
3. Use this token in ZYREAI's GitHub push modal

The fine-grained PAT you had only had **read** permissions — classic PAT with `repo` scope gives full **write** access needed to push code.
