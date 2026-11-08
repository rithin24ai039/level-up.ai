# Level Up AI

Personal growth dashboard built with HTML, CSS, vanilla JavaScript, Supabase and Vercel serverless functions. The AI coach is configured for NVIDIA NIM model `openai/gpt-oss-20b`.

## NVIDIA API key setup

The placeholder is in **`.env.example`**:

```env
NVIDIA_API_KEY=API.KEY.HERE
```

For local development, copy this file to `.env.local` and replace the placeholder with a newly generated NVIDIA key. Do not commit `.env.local`.

For the deployed app, open **Vercel → level-up-ai → Settings → Environment Variables** and add:

- **Name:** `NVIDIA_API_KEY`
- **Value:** your newly generated NVIDIA NIM key
- **Environments:** Production, Preview, and Development as needed

Save the variable and redeploy. The key is read only by `api/ai.js`; it is never sent to the browser. Do not put it in `app.js`, `index.html`, or any public source file.

## Supabase

The browser uses the Supabase project URL and publishable key in `app.js`. A publishable key is designed for browser use; user data must remain protected by Row Level Security policies.

## Current scope

Implemented: Supabase email/password authentication, profile, daily tasks, goals, body metrics, workout log, meals, learning goals, daily habit logging, leaderboard view, and a server-side NVIDIA AI coach endpoint.

Not yet complete: full exercise/set tracking UI, water and sleep screens, persistent AI conversation history, realtime multiplayer, friend workflows, admin console, advanced analytics, reminders, and full end-to-end browser testing.
