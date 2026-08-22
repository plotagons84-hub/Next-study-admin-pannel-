// Calls Gemini directly from the browser using the API key below. This is
// convenient for a small, login-gated admin tool, but the same honesty
// applies as elsewhere in this app: any key shipped in client-side code can
// be read out of the deployed JS by someone determined enough, and then used
// to run up your own Gemini quota/costs. Since this whole app sits behind
// the admin login, exposure is limited to people who already have (or can
// guess) the admin URL - but it is not the same as keeping the key on a
// server. For anything higher-stakes, this call should move behind a small
// backend endpoint that holds the key instead.
const GEMINI_API_KEY = 'AQ.Ab8RN6IX2XpoCdfEdy6YiE4yDa9ADGXGNGeJbEbpLfrrpGxzKQ'
const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_PROMPT = `You are the AI Tutor built into the Next Study Admin Panel. You do two things:
1. Answer NEET/JEE study questions (Physics, Chemistry, Biology, Maths) - clear, concise, exam-focused.
2. Answer questions about the admin panel's CURRENT LIVE STATE, using the "Live panel data" given to you below - e.g. how many admins, whether maintenance mode is on, which platforms are locked, whether the Telegram popup or alerts are enabled.

Keep answers short (2-4 sentences unless a study question needs a worked explanation). If asked something unrelated to either of these two things, say briefly that you're focused on study help and panel status, and redirect.`

export async function askGemini(question, liveContext) {
  const prompt = `${SYSTEM_PROMPT}\n\nLive panel data:\n${liveContext}\n\nQuestion: ${question}`

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini request failed (${res.status}): ${body.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
  if (!text) throw new Error('Gemini returned an empty response')
  return text.trim()
}
