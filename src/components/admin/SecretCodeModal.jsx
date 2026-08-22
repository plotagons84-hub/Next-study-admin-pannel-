import { useState } from 'react'
import { ShieldAlert, Lock } from 'lucide-react'
import { verifySecretCode } from '../../lib/secretCode'

// A confirmation modal required before any URL save. Verifies against a
// SHA-256 hash only - see src/lib/secretCode.js for the honest limits of
// what that does and doesn't protect against in a client-only app.
export default function SecretCodeModal({ open, onConfirm, onCancel }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!open) return null

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const ok = await verifySecretCode(code)
    setBusy(false)
    if (ok) {
      setCode('')
      onConfirm()
    } else {
      setError('Incorrect code.')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-night/80 backdrop-blur-sm" onClick={onCancel} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-xs glass-strong rounded-xl3 p-6 animate-pop-in"
      >
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-orange-500/10 border border-orange-500/40 grid place-items-center">
            <ShieldAlert size={22} className="text-orange-400" />
          </div>
          <p className="text-sm font-semibold text-white mt-3">Confirm with secret code</p>
          <p className="text-xs text-white/50 mt-1">Required to save any link change.</p>
        </div>

        <div className="relative mt-5">
          <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError('')
            }}
            autoFocus
            placeholder="Secret code"
            className="w-full glass-pill rounded-full pl-10 pr-4 py-2.5 text-sm text-white outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-400 text-center mt-2">{error}</p>}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full py-2.5 text-sm text-white/60 hover:text-white border border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-full py-2.5 text-sm font-semibold text-night bg-gradient-to-r from-amber-400 to-orange-600 hover:brightness-110 transition disabled:opacity-60"
          >
            {busy ? 'Checking…' : 'Confirm'}
          </button>
        </div>
      </form>
    </div>
  )
}
