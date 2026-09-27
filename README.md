# CSMC Admin Panel — Chemi Surveys & Mapping Consultants

A professional admin content management system (CMS) for Surveyor John Muiruri Gachemi
to manage the live Chemi Surveys & Mapping Consultants portfolio website.

## What you can manage

| Section | What you can do |
|---|---|
| **Dashboard** | Add / delete Today's Tasks and Upcoming Tasks; cycle task status live |
| **Staff & Users** | Add, edit, delete staff accounts; change emails, passwords, phone numbers, roles |
| **Branding** | Change the logo URL and hero image URL shown on the live site |
| **Clients** | Add clients with logo, phone, email; edit or remove them |
| **Services** | Add new surveying services; edit descriptions; remove old ones |
| **My Projects** | Fill the 12 project slots with title, date, image; clear slots |
| **Reports** | Maintain a browser-local year list; it is not synced to the live site |
| **Contact Info** | Update office address, phone, email on the live Contact Us page |
| **Settings** | Configure API URL, test backend connection, view deployment guide |

## Setup (local development)

From the workspace parent directory (`csmc-admin-complete`), enter the app directory first:

```bash
cd csmc-admin
```

1. Install dependencies:
   ```bash
   npm.cmd install
   ```

2. Copy and fill the environment file (PowerShell):
   ```bash
   Copy-Item .env.example .env
   ```
   Edit `.env`:
   - `VITE_API_URL` → URL of your Render/Railway backend (e.g. `https://chemi-api.onrender.com`)
   - `VITE_LIVE_SITE_URL` → URL of your Vercel live site

3. Start the dev server (use `npm.cmd` in PowerShell if script execution is restricted):
   ```bash
   npm.cmd run dev
   ```
   Open http://localhost:5174

4. Verify the production build before deploying:
   ```bash
   npm.cmd run build
   ```

5. Sign in with your ADMIN account

## Deploy to Vercel

1. Complete the backend integration in `../csmc-backend-additions/INTEGRATION_GUIDE.md` and deploy that existing API first. The backend additions here are integration files, not a standalone backend project.
2. Push this folder to a GitHub repository
3. Import into Vercel. If the repository contains this app inside a parent folder, set Vercel's **Root Directory** to `csmc-admin`.
4. Set environment variables in Vercel project settings:
   - `VITE_API_URL` = your backend URL
   - `VITE_LIVE_SITE_URL` = your live site URL
4. Deploy — Vercel detects `vercel.json` automatically

## How changes reach the live site

Every button in this admin panel calls your live backend API directly via tRPC.
Changes are stored in your Neon PostgreSQL database and reflected on the live
Chemi Surveys website immediately — no re-deploy needed.

The only exception is branding (logo / hero image): if the live site reads those
from code rather than the database, a Vercel re-deploy is needed after changing them.

## Security

- Only ADMIN-role accounts can sign in to this panel
- JWT token is stored in localStorage and sent with every API request
- The backend verifies the token and the ADMIN role on every protected endpoint
