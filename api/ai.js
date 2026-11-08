// Configure the secret as NVIDIA_API_KEY=API.KEY.HERE in the Vercel dashboard.
// The real value must never be committed to this repository or exposed to the browser.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return res.status(401).json({ error: "Sign in required" });
  }

  const { message } = req.body || {};
  if (typeof message !== "string" || !message.trim() || message.length > 4000) {
    return res.status(400).json({ error: "Enter a message under 4,000 characters." });
  }

  if (!process.env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY === "API.KEY.HERE") {
    return res.status(503).json({
      error: "AI coach is waiting for your NVIDIA key. Add NVIDIA_API_KEY in Vercel → Project Settings → Environment Variables."
    });
  }

  try {
    const auth = await fetch(process.env.SUPABASE_URL + "/auth/v1/user", {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: "Bearer " + token
      }
    });

    if (!auth.ok) {
      return res.status(401).json({ error: "Your session is invalid. Please sign in again." });
    }

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.NVIDIA_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: "You are Level Up AI, a supportive and practical self-improvement coach. Help with habits, learning, fitness and general wellness. Give safe, realistic, actionable advice. Do not diagnose or prescribe medical treatment."
          },
          { role: "user", content: message.trim() }
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1200
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(502).json({
        error: data.error?.message || "The NVIDIA AI service could not complete the request."
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response generated."
    });
  } catch {
    return res.status(500).json({ error: "AI service temporarily unavailable." });
  }
}
