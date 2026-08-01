import { useEffect, useState } from 'react'
import { Save, AlertCircle } from 'lucide-react'
import { platforms as basePlatforms } from '../../data/constants'
import { subscribePlatforms, setPlatformOverride } from '../../lib/platformsFirestore'
import SecretCodeModal from './SecretCodeModal'

// A labeled ON/OFF switch - ON = "Live", OFF = "Lock". Used for every
// platform row, top-level or nested, so locking anything looks and behaves
// the same way everywhere.
function LiveLockSwitch({ locked, onChange, busy }) {
  const live = !locked
  return (
    <button
      onClick={() => onChange(!locked)}
      disabled={busy}
      role="switch"
      aria-checked={live}
      className={`shrink-0 relative h-8 w-16 rounded-full transition-colors duration-200 disabled:opacity-50 ${
        live ? 'bg-gradient-to-r from-amber-400 to-orange-600' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 grid place-items-center text-[8px] font-bold ${
          live ? 'translate-x-9 text-orange-600' : 'translate-x-1 text-white/40'
        }`}
      >
        {live ? 'LIVE' : 'LOCK'}
      </span>
    </button>
  )
}

// One row: name (+ optional meta line), the Live/Lock switch, and - only for
// items that have a real URL to manage - an editable link with a save icon
// that requires the secret code before it actually writes anything.
function PlatformRow({ item, meta, hasUrl, onToggle, onSaveUrl, onError }) {
  const [url, setUrl] = useState(item.href ?? item.url ?? '')
  const [saved, setSaved] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function toggle() {
    setToggling(true)
    onError('')
    try {
      await onToggle(!item.locked)
    } catch (err) {
      onError(describeError(err))
    } finally {
      setToggling(false)
    }
  }

  async function confirmSave() {
    setConfirmOpen(false)
    onError('')
    try {
      await onSaveUrl(url)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      onError(describeError(err))
    }
  }

  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{item.name}</p>
          {meta && <p className="text-xs text-white/40 truncate">{meta}</p>}
        </div>
        <LiveLockSwitch locked={item.locked} onChange={toggle} busy={toggling} />
      </div>

      {hasUrl && (
        <>
          <div className="flex items-center gap-2 mt-2.5">
            <input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setSaved(false)
              }}
              placeholder="https://…"
              className="flex-1 min-w-0 glass-pill rounded-full px-4 py-2 text-xs text-white/80 outline-none font-mono"
            />
            <button
              onClick={() => setConfirmOpen(true)}
              className="shrink-0 h-8 w-8 grid place-items-center rounded-full bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors"
              aria-label="Save"
            >
              <Save size={14} />
            </button>
          </div>
          {saved && <p className="text-[11px] text-emerald-400 mt-1">Saved &mdash; live for every visitor now.</p>}
        </>
      )}

      <SecretCodeModal open={confirmOpen} onConfirm={confirmSave} onCancel={() => setConfirmOpen(false)} />
    </div>
  )
}

function describeError(err) {
  return err.code === 'permission-denied'
    ? "Blocked by Firestore rules — publish firestore.rules in the Firebase console."
    : `Failed: ${err.message || 'unknown error'}`
}

export default function AdminLinks() {
  const [top, setTop] = useState(basePlatforms)
  const [pw, setPw] = useState([])
  const [nt, setNt] = useState([])
  const [error, setError] = useState('')

  useEffect(
    () =>
      subscribePlatforms((data) => {
        setTop(data.platforms)
        setPw(data.pwPlatforms)
        setNt(data.nextTopperPlatforms)
      }),
    []
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Links</h1>
        <p className="text-sm text-white/50 mt-1">Lock any card, or edit a link &mdash; live for every visitor.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl2 border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="glass rounded-xl2 p-5">
        <h2 className="font-display font-semibold text-white mb-1">Top-level cards</h2>
        <div className="divide-y divide-white/10">
          {top.map((item) => (
            <PlatformRow
              key={item.id}
              item={item}
              meta={item.kind === 'dashboard' ? `internal \u2192 ${item.to}` : null}
              hasUrl={item.kind === 'link'}
              onToggle={(locked) => setPlatformOverride(item.id, { locked })}
              onSaveUrl={(href) => setPlatformOverride(item.id, { href })}
              onError={setError}
            />
          ))}
        </div>
      </div>

      <div className="glass rounded-xl2 p-5">
        <h2 className="font-display font-semibold text-white mb-1">PW Ultimate links</h2>
        <div className="divide-y divide-white/10">
          {pw.map((item) => (
            <PlatformRow
              key={item.id}
              item={item}
              hasUrl
              onToggle={(locked) => setPlatformOverride(item.id, { locked })}
              onSaveUrl={(url) => setPlatformOverride(item.id, { url })}
              onError={setError}
            />
          ))}
        </div>
      </div>

      <div className="glass rounded-xl2 p-5">
        <h2 className="font-display font-semibold text-white mb-1">Next Topper Ultimate links</h2>
        <div className="divide-y divide-white/10">
          {nt.map((item) => (
            <PlatformRow
              key={item.id}
              item={item}
              hasUrl
              onToggle={(locked) => setPlatformOverride(item.id, { locked })}
              onSaveUrl={(url) => setPlatformOverride(item.id, { url })}
              onError={setError}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
