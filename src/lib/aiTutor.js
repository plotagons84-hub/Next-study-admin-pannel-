// Demo AI Tutor "brain" - simple keyword matching, runs entirely in the
// browser, no API key or backend needed. Good enough to demo the voice
// experience; swap `answerQuestion` for a real API call when ready (see
// the TODO at the bottom) to get genuinely intelligent answers.

const KNOWLEDGE_BASE = [
  {
    keywords: ['hello', 'hi', 'hey', 'namaste'],
    answer: "Hello! I'm your AI Tutor. Ask me about NEET, JEE, Physics, Chemistry, Biology, or Maths topics, and I'll do my best to help.",
  },
  {
    keywords: ['newton', 'law of motion', 'inertia'],
    answer: "Newton's three laws of motion describe how objects move: an object stays at rest or in motion unless a force acts on it, force equals mass times acceleration, and every action has an equal and opposite reaction.",
  },
  {
    keywords: ['photosynthesis'],
    answer: 'Photosynthesis is how plants convert light energy, water, and carbon dioxide into glucose and oxygen, mainly happening in the chloroplasts of plant cells.',
  },
  {
    keywords: ['mole concept', 'avogadro'],
    answer: "One mole of any substance contains Avogadro's number of particles - about 6.022 times 10 to the power 23. It's the bridge between the atomic scale and the amounts we can measure in a lab.",
  },
  {
    keywords: ['integration', 'differentiation', 'calculus'],
    answer: 'Differentiation finds the rate of change of a function, while integration finds the area under its curve - they are inverse operations of each other, which is the core idea behind the Fundamental Theorem of Calculus.',
  },
  {
    keywords: ['thank', 'thanks'],
    answer: "You're welcome! Keep practicing - consistency is what separates a good score from a great one.",
  },
]

const FALLBACK_ANSWERS = [
  "That's a great question. In the demo version I only know a few sample topics - try asking about Newton's laws, photosynthesis, mole concept, or calculus.",
  "I don't have a demo answer for that one yet. Once a real AI API is connected, I'll be able to answer anything.",
]

export function answerQuestion(question) {
  const q = question.toLowerCase()
  const match = KNOWLEDGE_BASE.find((entry) => entry.keywords.some((k) => q.includes(k)))
  if (match) return match.answer
  return FALLBACK_ANSWERS[Math.floor(Math.random() * FALLBACK_ANSWERS.length)]
}

// TODO: to make this a real AI tutor, replace the body of answerQuestion
// (or add an async variant) with a call to your own backend, which in turn
// calls an LLM API (OpenAI, Anthropic, etc). Browsers can't safely hold a
// secret API key or call most LLM providers directly (CORS blocks it), so
// this needs a small server endpoint, e.g.:
//
// export async function answerQuestionAI(question) {
//   const res = await fetch('https://your-backend.example.com/api/tutor', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ question }),
//   })
//   const data = await res.json()
//   return data.answer
// }
