import { useEffect, useState } from 'react'
import { Save, AlertCircle, MoreVertical, Lock, EyeOff } from 'lucide-react'
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

// Small toggle used inside the kebab dropdown (Lock / Hide options) - same
// visual language as LiveLockSwitch but compact enough to sit in a menu row.
// The OFF-state track uses a visible border + solid fill (not just a faint
// white wash) so it doesn't disappear against the dropdown's background.
function MiniSwitch({ checked, onChange, busy }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={busy}
      role="switch"
      aria-checked={checked}
      className={`shrink-0 relative h-6 w-11 rounded-full border transition-colors duration-200 disabled:opacity-50 ${
        checked ? 'bg-gradient-to-r from-amber-400 to-orange-600 border-orange-400/50' : 'bg-night-700 border-white/15'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

// The kebab (3-dot) menu attached to every platform row. Both options
// inside it (Lock, Hide) require the secret code before they actually
// write anything - unlike the standalone LiveLockSwitch above, which stays
// exactly where it is and keeps its old no-password behavior.
function KebabMenu({ locked, hidden, onToggleLocked, onToggleHidden, onError }) {
  const [open, setOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // 'lock' | 'hide' | null
  const [busyAction, setBusyAction] = useState('')

  function requestToggle(action) {
    setOpen(false)
    setConfirmAction(action)
  }

  async function confirm() {
    const action = confirmAction
    setConfirmAction(null)
    onError('')
    setBusyAction(action)
    try {
      if (action === 'lock') await onToggleLocked(!locked)
      if (action === 'hide') await onToggleHidden(!hidden)
    } catch (err) {
      onError(describeError(err))
    } finally {
      setBusyAction('')
    }
  }

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-8 w-8 grid place-items-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="More options"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 w-56 bg-night-800 border border-white/10 shadow-glass-lg rounded-xl2 p-3 space-y-3 animate-pop-in">
            <div className="flex items-center gap-2.5">
              <Lock size={14} className="text-orange-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white">Lock</p>
                <p className="text-[10px] text-white/40 leading-snug">Shows "Coming Soon", card stays visible</p>
              </div>
              <MiniSwitch checked={locked} onChange={() => requestToggle('lock')} busy={busyAction === 'lock'} />
            </div>
            <div className="flex items-center gap-2.5">
              <EyeOff size={14} className="text-orange-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white">Hide</p>
                <p className="text-[10px] text-white/40 leading-snug">Removed from the site completely</p>
              </div>
              <MiniSwitch checked={hidden} onChange={() => requestToggle('hide')} busy={busyAction === 'hide'} />
            </div>
          </div>
        </>
      )}

      <SecretCodeModal open={!!confirmAction} onConfirm={confirm} onCancel={() => setConfirmAction(null)} />
    </div>
  )
}

// One row: name (+ optional meta line), the Live/Lock switch, the kebab
// menu (Lock/Hide, password-gated), and - only for items that have a real
// URL to manage - an editable link with a save icon that requires the
// secret code before it actually writes anything.
function PlatformRow({ item, meta, hasUrl, onToggle, onToggleHidden, onSaveUrl, onError }) {
  const [url, setUrl] = useState(item.href ?? item.url ?? '')
  const [saved, setSaved] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Keep the input in sync with whatever Firestore actually has - not just
  // whatever was typed here. Without this, the field could look "wrong" or
  // empty after a save if this row never remounts (e.g. after toggling
  // Lock/Hide right after saving a link), even though Firestore is fine.
  useEffect(() => {
    setUrl(item.href ?? item.url ?? '')
  }, [item.href, item.url])

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
    // Auto-fix the single most common typo: pasting a link without
    // "https://" in front. Browsers treat a bare domain like
    // "next-study-pi.faizan92048.workers.dev" as a *relative* path on the
    // CURRENT site instead of an external address, so clicking the card on
    // the public site 404s on the public site itself instead of opening
    // the intended link. Prepending the scheme here fixes that for good.
    const normalized = url && !/^https?:\/\//i.test(url) ? `https://${url}` : url
    try {
      await onSaveUrl(normalized)
      setUrl(normalized)
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
          <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
            {item.name}
            {item.hidden && (
              <span className="text-[9px] font-mono uppercase tracking-wide text-white/40 border border-white/15 rounded-full px-1.5 py-0.5">
                Hidden
              </span>
            )}
          </p>
          {meta && <p className="text-xs text-white/40 truncate">{meta}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <LiveLockSwitch locked={item.locked} onChange={toggle} busy={toggling} />
          <KebabMenu
            locked={!!item.locked}
            hidden={!!item.hidden}
            onToggleLocked={onToggle}
            onToggleHidden={onToggleHidden}
            onError={onError}
          />
        </div>
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
      // includeHidden: true - the admin panel must still see (and be able
      // to un-hide) cards that are currently hidden from the public site.
      subscribePlatforms(
        (data) => {
          setTop(data.platforms)
          setPw(data.pwPlatforms)
          setNt(data.nextTopperPlatforms)
        },
        { includeHidden: true }
      ),
    []
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Links</h1>
        <p className="text-sm text-white/50 mt-1">
          Lock, hide, or edit a link &mdash; live for every visitor. Use the <MoreVertical size={12} className="inline -mt-0.5" /> menu to hide a card completely.
        </p>
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
              onToggleHidden={(hidden) => setPlatformOverride(item.id, { hidden })}
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
              onToggleHidden={(hidden) => setPlatformOverride(item.id, { hidden })}
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
              onToggleHidden={(hidden) => setPlatformOverride(item.id, { hidden })}
              onSaveUrl={(url) => setPlatformOverride(item.id, { url })}
              onError={setError}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
