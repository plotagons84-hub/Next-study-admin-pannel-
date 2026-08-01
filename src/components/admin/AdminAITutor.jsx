import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Mic, MicOff, Volume2, VolumeX, User, Loader2 } from 'lucide-react'
import { answerQuestion } from '../../lib/aiTutor'
import { askGemini } from '../../lib/geminiTutor'
import { speak, stopSpeaking, isSpeechRecognitionSupported, listenOnce } from '../../lib/speech'
import { subscribeAdminsList } from '../../lib/adminAuth'
import { subscribeAppControl, subscribePlatforms } from '../../lib/platformsFirestore'

const GREETING = "AI Tutor activated. Ask me about NEET or JEE topics, and I'll answer out loud."

function buildLiveContext({ admins, control, platforms }) {
  const lines = []
  lines.push(`Admin count: ${admins.length}${admins.length ? ' (' + admins.map((a) => a.name).join(', ') + ')' : ''}`)
  lines.push(`Maintenance mode: ${control.maintenanceMode ? 'ON (public site is showing a maintenance screen right now)' : 'OFF (site is live normally)'}`)
  lines.push(`Telegram popup: ${control.telegramPopupEnabled === false ? 'OFF' : 'ON'}`)
  lines.push(`Urgent Alert banner: ${control.urgentAlertEnabled === false ? 'OFF' : 'ON'}`)
  lines.push(`Kuku TV banner: ${control.kukuTvEnabled === false ? 'OFF' : 'ON'}`)
  if (platforms.length) {
    const status = platforms
      .map((p) => `${p.name}: ${p.locked || (p.kind === 'link' && !p.href) ? 'locked' : 'live'}`)
      .join('; ')
    lines.push(`Top-level cards: ${status}`)
  }
  return lines.join('\n')
}

export default function AdminAITutor() {
  const [messages, setMessages] = useState([{ role: 'ai', text: GREETING }])
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [thinking, setThinking] = useState(false)
  const stopListenRef = useRef(null)
  const scrollRef = useRef(null)
  const greeted = useRef(false)

  // Kept live so every question is answered with up-to-date panel state.
  const liveDataRef = useRef({ admins: [], control: {}, platforms: [] })

  useEffect(() => {
    const unsub1 = subscribeAdminsList((admins) => (liveDataRef.current.admins = admins))
    const unsub2 = subscribeAppControl((control) => (liveDataRef.current.control = control))
    const unsub3 = subscribePlatforms((data) => (liveDataRef.current.platforms = data.platforms))
    return () => {
      unsub1()
      unsub2()
      unsub3()
    }
  }, [])

  useEffect(() => {
    if (greeted.current) return
    greeted.current = true
    if (voiceOn) speak(GREETING)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  async function ask(question) {
    if (!question.trim()) return
    setMessages((m) => [...m, { role: 'user', text: question }])
    setInput('')
    setThinking(true)

    let answer
    try {
      const context = buildLiveContext(liveDataRef.current)
      answer = await askGemini(question, context)
    } catch (err) {
      console.error('[AdminAITutor] Gemini call failed, falling back to demo answers:', err)
      answer = answerQuestion(question)
    }

    setThinking(false)
    setMessages((m) => [...m, { role: 'ai', text: answer }])
    if (voiceOn) speak(answer)
  }

  function handleMic() {
    if (listening) {
      stopListenRef.current?.()
      setListening(false)
      return
    }
    if (!isSpeechRecognitionSupported()) {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: "Voice input isn't supported in this browser - try typing instead." },
      ])
      return
    }
    setListening(true)
    stopListenRef.current = listenOnce({
      onResult: (transcript) => ask(transcript),
      onEnd: () => setListening(false),
      onError: () => setListening(false),
    })
  }

  function toggleVoice() {
    setVoiceOn((v) => {
      if (v) stopSpeaking()
      return !v
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Bot size={22} className="text-orange-400" />
            AI Tutor
          </h1>
          <p className="text-sm text-white/50 mt-1">Study help + live panel status &middot; speaks its answers aloud</p>
        </div>
        <button
          onClick={toggleVoice}
          className="shrink-0 h-9 w-9 grid place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition"
          aria-label={voiceOn ? 'Mute voice' : 'Unmute voice'}
        >
          {voiceOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>
      </div>

      <div ref={scrollRef} className="glass rounded-xl2 flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`h-7 w-7 shrink-0 rounded-full grid place-items-center ${
                m.role === 'user' ? 'bg-white/10 text-white/70' : 'bg-gradient-to-br from-amber-400 to-orange-600 text-night'
              }`}
            >
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-orange-500/15 text-white/90' : 'bg-white/5 text-white/80'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 shrink-0 rounded-full grid place-items-center bg-gradient-to-br from-amber-400 to-orange-600 text-night">
              <Bot size={14} />
            </div>
            <div className="rounded-2xl px-3.5 py-2.5 bg-white/5 text-white/50">
              <Loader2 size={15} className="animate-spin" />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
        className="flex items-center gap-2 mt-4"
      >
        <button
          type="button"
          onClick={handleMic}
          className={`shrink-0 h-11 w-11 grid place-items-center rounded-full transition-colors ${
            listening ? 'bg-red-500/20 text-red-400 animate-pulse-glow' : 'glass-pill text-white/60 hover:text-white'
          }`}
          aria-label={listening ? 'Stop listening' : 'Ask by voice'}
        >
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 glass-pill rounded-full px-4 py-3 text-sm text-white outline-none"
        />
        <button
          type="submit"
          className="shrink-0 h-11 w-11 grid place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-night shadow-glow"
          aria-label="Send"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  )
}
