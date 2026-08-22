# RetailPilot AI — Vercel Production Deployment Guide

Deploy **RetailPilot AI** instantly to Vercel with continuous deployment connected to your GitHub repository: [https://github.com/purnimadigi16-alt/retailpilot-ai](https://github.com/purnimadigi16-alt/retailpilot-ai).

---

## Option 1: 1-Click Deploy via Vercel Dashboard (Recommended)

1. Open **[Vercel New Project Import](https://vercel.com/new/clone?repository-url=https://github.com/purnimadigi16-alt/retailpilot-ai)**.
2. Select your GitHub account and import the repository **`purnimadigi16-alt/retailpilot-ai`**.
3. In the **Configure Project** step:
   - **Framework Preset**: `Next.js` (automatically detected)
   - **Root Directory**: `./`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
4. Add the following **Environment Variables** under **Environment Variables**:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lqcyiixtdwsgnqjxhvmh.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY3lpaXh0ZHdzZ25xanhodm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODAxOTYsImV4cCI6MjEwMjk1NjE5Nn0.KU23YTro38S9BkIlOHi8NvWKf7jGEOunyrAyFJGrrig` | Supabase Anon Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxY3lpaXh0ZHdzZ25xanhodm1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM4MDE5NiwiZXhwIjoyMTAyOTU2MTk2fQ.3n_pkHPHMER5wmXeqUFoZVRcsjXJAdOvAZUH3wIo7fw` | Supabase Service Role Key (Server & MCP) |
| `NEXT_PUBLIC_APP_URL` | `https://your-deployment-name.vercel.app` | Public Base URL |
| `GEMINI_API_KEY` | *(Optional)* | Google Gemini API Key |

5. Click **Deploy**!
   - Vercel will pull the code, install dependencies, run the production build, and provision a live HTTPS URL (e.g. `https://retailpilot-ai.vercel.app`).

---

## Option 2: Deploy via Vercel CLI

If you have the Vercel CLI installed and authenticated on your local machine:

```bash
# 1. Login to Vercel
vercel login

# 2. Link and deploy to preview
vercel

# 3. Deploy to production
vercel --prod
```

When prompted by the CLI:
- Set up and deploy: `Y`
- Scope: Your Vercel account
- Link to existing project: `N`
- Project Name: `retailpilot-ai`
- Directory: `./`
- Modify build settings: `N`

---

## 🔍 Verification After Deployment

Once deployed on Vercel:
1. Visit your assigned Vercel URL (e.g., `https://retailpilot-ai.vercel.app`).
2. Navigate to `/qa-matrix` and click **"Execute All 50 Test Cases"** to verify that all functional tests, APIs, RLS isolation, and MCP tools pass with 100% in production.
3. Test the **POS Terminal** (`/pos`), **AI Assistant** (`/ai-assistant`), and **Automations Center** (`/automations`).
