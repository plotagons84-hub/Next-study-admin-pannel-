import { useEffect, useState } from 'react'
import { Bell, Save, AlertCircle } from 'lucide-react'
import { subscribeAnnouncement, setAnnouncement } from '../../lib/platformsFirestore'

const COLORS = [
  { id: 'red', label: 'Red (urgent)', swatch: 'bg-red-500' },
  { id: 'orange', label: 'Orange (notice)', swatch: 'bg-orange-500' },
  { id: 'green', label: 'Green (all good)', swatch: 'bg-emerald-500' },
]

export default function AdminAnnounce() {
  const [text, setText] = useState('')
  const [active, setActive] = useState(false)
  const [color, setColor] = useState('orange')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(
    () =>
      subscribeAnnouncement((a) => {
        setText(a.text || '')
        setActive(!!a.active)
        setColor(a.color || 'orange')
      }),
    []
  )

  async function save() {
    setBusy(true)
    setError('')
    try {
      await setAnnouncement({ text, active, color })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(
        err.code === 'permission-denied'
          ? "Blocked by Firestore rules — publish firestore.rules in the Firebase console."
          : `Failed: ${err.message || 'unknown error'}`
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Bell size={20} className="text-orange-400" />
          Announce
        </h1>
        <p className="text-sm text-white/50 mt-1">A banner shown right on the home page, above the cards.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl2 border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="glass rounded-xl2 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Show banner</span>
          <button
            onClick={() => setActive((v) => !v)}
            role="switch"
            aria-checked={active}
            className={`relative h-8 w-16 rounded-full transition-colors duration-200 ${
              active ? 'bg-gradient-to-r from-amber-400 to-orange-600' : 'bg-white/10'
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 grid place-items-center text-[9px] font-bold ${
                active ? 'translate-x-9 text-orange-600' : 'translate-x-1 text-white/40'
              }`}
            >
              {active ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="e.g. Server maintenance tonight 11 PM - 1 AM."
          className="w-full glass-pill rounded-2xl px-4 py-3 text-sm text-white outline-none resize-none"
        />

        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] rounded-full px-2 py-2 border transition-colors ${
                color === c.id ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-white/50'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${c.swatch}`} />
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={save}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-600 hover:brightness-110 transition rounded-full py-3 text-sm font-semibold text-night shadow-glow disabled:opacity-60"
        >
          <Save size={15} />
          {busy ? 'Saving…' : 'Save Announcement'}
        </button>
        {saved && <p className="text-xs text-emerald-400 text-center">Saved &mdash; live on the home page now.</p>}
      </div>
    </div>
  )
}
