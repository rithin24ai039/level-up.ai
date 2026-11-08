# Level Up AI
Personal growth dashboard built with HTML, CSS, vanilla JavaScript, Supabase and Vercel serverless functions. AI coach uses NVIDIA NIM openai/gpt-oss-20b.

## Vercel environment
Set NVIDIA_API_KEY as an encrypted secret. Never put it in frontend files or Git.

Supabase project URL and publishable key are configured in app.js. The publishable key is safe for browser use; data access is protected by database RLS.

Current implementation: Supabase Auth, profile, daily tasks, goals, body metrics, workouts, meals, learning goals, leaderboard, Realtime task refresh, and server-side AI coach endpoint. Multiplayer and admin tooling are future phases.