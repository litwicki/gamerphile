# Gamerphile — Battle.net OAuth Setup Guide

This guide walks you through configuring Battle.net OAuth authentication for the Gamerphile application. By the end, you will have a working sign-in flow using your Blizzard account.

## Prerequisites

- Node.js 18+ installed
- A [Blizzard Developer Portal](https://develop.battle.net/) account
- A [Supabase](https://supabase.com/) project
- The Gamerphile repository cloned locally

---

## 1. Create a Battle.net OAuth Application

1. Go to the [Blizzard Developer Portal](https://develop.battle.net/) and sign in with your Blizzard account.
2. Navigate to **API Access** in the sidebar.
3. Click **Create Client**.
4. Fill in the required fields:
   - **Client Name** — A descriptive name, e.g. `Gamerphile Local Dev`.
   - **Redirect URIs** — See [Section 2](#2-configure-oauth-redirect-uris) below.
   - **Service URL** — Your application URL (e.g. `http://localhost:3000` for local development).
   - **Intended Use** — Select the option that best describes your project.
5. Click **Save**. You will be shown a **Client ID** and **Client Secret**. Copy both — you will need them in [Section 3](#3-set-environment-variables).

> **Important:** Keep your Client Secret private. Never commit it to version control.

---

## 2. Configure OAuth Redirect URIs

The redirect URI tells Blizzard where to send the user after they authorize your application. next-auth expects the callback at a specific path.

### Local Development

```text
http://localhost:3000/api/auth/callback/battlenet
```

### Production

```text
https://your-domain.com/api/auth/callback/battlenet
```

Add the appropriate URI(s) in the **Redirect URIs** field of your Battle.net OAuth client settings in the Blizzard Developer Portal.

The path `/api/auth/callback/battlenet` is derived from the next-auth route handler at `app/api/auth/[...nextauth]/route.ts` combined with the provider id `battlenet` defined in `lib/auth/battlenet-provider.ts`.

---

## 3. Set Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set each variable:

| Variable | Description | Example |
| --- | --- | --- |
| `BATTLENET_CLIENT_ID` | Client ID from the Blizzard Developer Portal | `abc123def456` |
| `BATTLENET_CLIENT_SECRET` | Client Secret from the Blizzard Developer Portal | `secret-value` |
| `NEXTAUTH_SECRET` | A random string used to encrypt JWTs and session cookies. Generate one with `openssl rand -base64 32`. | `K7g...long-random-string` |
| `NEXTAUTH_URL` | The canonical URL of your application | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (found in Supabase dashboard → Settings → API) | `https://xyzabc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key (found in Supabase dashboard → Settings → API) | `eyJhbGci...` |
| `WOW_API_REGION` | Default WoW API region (`us`, `eu`, `kr`, or `tw`) | `us` |
| `WOW_API_LOCALE` | Default locale for WoW API responses | `en_US` |

A complete `.env.local` file looks like this:

```dotenv
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Battle.net OAuth
BATTLENET_CLIENT_ID=your-client-id
BATTLENET_CLIENT_SECRET=your-client-secret

# NextAuth
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000

# WoW API
WOW_API_REGION=us
WOW_API_LOCALE=en_US
```

---

## 4. Configure Supabase for Battle.net

Supabase is used as the backend for database and storage. While next-auth handles the OAuth flow directly (not through Supabase Auth), Supabase still needs to be configured for the application to function.

### 4.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and create a new project (or use an existing one).
2. Note your **Project URL** and **Anon Key** from **Settings → API**. These are the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values.

### 4.2 Supabase Client Configuration

The application initializes Supabase clients in `lib/supabase/`:

- `client.ts` — Browser-side Supabase client
- `server.ts` — Server-side Supabase client
- `middleware.ts` — Middleware Supabase client for request-level auth

These clients use the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables automatically. No additional Supabase configuration is needed for the Battle.net OAuth flow since authentication is handled by next-auth.

### 4.3 How Auth and Supabase Work Together

The authentication architecture separates concerns:

- **next-auth** manages the Battle.net OAuth flow, session cookies, and JWT tokens.
- **Supabase** provides database, storage, and other backend services.

The Battle.net access token stored in the next-auth session can be used server-side to call the WoW API on behalf of the user. Supabase does not need a Battle.net provider configured in its Auth settings — next-auth handles that entirely.

---

## 5. Verify the OAuth Flow End-to-End

Follow these steps to confirm everything is working.

### 5.1 Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5.2 Initiate Sign-In

Click the **Sign in with Battle.net** button. You should be redirected to the Blizzard OAuth consent screen.

### 5.3 Authorize the Application

Sign in with your Blizzard account and approve the requested permissions (`openid`, `wow.profile`).

### 5.4 Confirm Redirect

After authorization, you should be redirected back to `http://localhost:3000`. The sign-in button should be replaced with your BattleTag and a sign-out option.

### 5.5 Verify Session

Open your browser's developer tools and check:

- **Cookies:** A `next-auth.session-token` cookie should be present.
- **Network:** Requests to `/api/auth/session` should return a JSON object containing your user info and access token.

### 5.6 Test Sign-Out

Click the **Sign out** button. You should be redirected to the home page and the session cookie should be cleared.

### 5.7 Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| Redirect URI mismatch error | The redirect URI in the Blizzard Developer Portal does not match the one next-auth uses | Ensure the portal has `http://localhost:3000/api/auth/callback/battlenet` listed |
| `NEXTAUTH_SECRET` error on startup | Missing or empty `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` and set the value in `.env.local` |
| 401 from Battle.net | Invalid or expired client credentials | Regenerate the Client Secret in the Blizzard Developer Portal and update `.env.local` |
| Supabase connection error | Missing or incorrect Supabase URL/key | Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` |
| Blank page after redirect | `NEXTAUTH_URL` does not match the actual app URL | Set `NEXTAUTH_URL=http://localhost:3000` in `.env.local` |
