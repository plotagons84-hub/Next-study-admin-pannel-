import { useEffect, useState } from 'react'
import { AlertOctagon, Send, Siren, Tv, Users, AlertCircle, Trash2 } from 'lucide-react'
import { subscribeAppControl, setAppControl } from '../../lib/platformsFirestore'
import { subscribeAdminsList, revokeAdmin } from '../../lib/adminAuth'
import { auth } from '../../lib/firebase'
import SecretCodeModal from './SecretCodeModal'

function ToggleCard({ icon: Icon, title, description, checked, onChange, danger, busy }) {
  return (
    <div className="glass rounded-xl2 p-4 sm:p-5 flex items-center gap-4">
      <div
        className={`h-10 w-10 shrink-0 rounded-full grid place-items-center border ${
          danger
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
        }`}
      >
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-white/50 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={busy}
        role="switch"
        aria-checked={checked}
        className={`shrink-0 relative h-8 w-16 rounded-full transition-colors duration-200 disabled:opacity-50 ${
          checked ? (danger ? 'bg-red-500' : 'bg-gradient-to-r from-amber-400 to-orange-600') : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 grid place-items-center text-[9px] font-bold ${
            checked ? 'translate-x-9 text-orange-600' : 'translate-x-1 text-white/40'
          }`}
        >
          {checked ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  )
}

export default function AdminControl() {
  const [control, setControl] = useState({
    maintenanceMode: false,
    telegramPopupEnabled: true,
    urgentAlertEnabled: true,
    kukuTvEnabled: true,
  })
  const [admins, setAdmins] = useState([])
  const [busyKey, setBusyKey] = useState('')
  const [error, setError] = useState('')
  const [pendingRemove, setPendingRemove] = useState(null) // { id, name } | null

  useEffect(() => {
    const unsub1 = subscribeAppControl(setControl)
    const unsub2 = subscribeAdminsList(setAdmins)
    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  async function update(key, patch) {
    setError('')
    setBusyKey(key)
    // optimistic UI - flip it back if the write actually fails
    setControl((c) => ({ ...c, ...patch }))
    try {
      await setAppControl(patch)
    } catch (err) {
      setControl((c) => ({ ...c, ...Object.fromEntries(Object.keys(patch).map((k) => [k, !patch[k]])) }))
      setError(
        err.code === 'permission-denied'
          ? "Save blocked by Firestore rules — make sure firestore.rules is published in the Firebase console, and you're logged in."
          : `Save failed: ${err.message || 'unknown error'}`
      )
    } finally {
      setBusyKey('')
    }
  }

  async function confirmRemove() {
    const target = pendingRemove
    setPendingRemove(null)
    setError('')
    try {
      await revokeAdmin(target.id)
    } catch (err) {
      setError(
        err.code === 'permission-denied'
          ? "Blocked by Firestore rules — publish firestore.rules in the Firebase console."
          : `Failed: ${err.message || 'unknown error'}`
      )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Control</h1>
        <p className="text-sm text-white/50 mt-1">App-wide switches &mdash; changes apply to every visitor.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl2 border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <ToggleCard
          icon={AlertOctagon}
          title="Maintenance Mode"
          description="Blocks the entire public site with a maintenance screen"
          checked={control.maintenanceMode}
          onChange={(v) => update('maintenanceMode', { maintenanceMode: v })}
          busy={busyKey === 'maintenanceMode'}
          danger
        />
        <ToggleCard
          icon={Send}
          title="Telegram Popup"
          description="Show the join-Telegram popup when the app opens"
          checked={control.telegramPopupEnabled}
          onChange={(v) => update('telegramPopupEnabled', { telegramPopupEnabled: v })}
          busy={busyKey === 'telegramPopupEnabled'}
        />
        <ToggleCard
          icon={Siren}
          title="Urgent Alert Banner"
          description="Show the red urgent-alert banner on the home page"
          checked={control.urgentAlertEnabled}
          onChange={(v) => update('urgentAlertEnabled', { urgentAlertEnabled: v })}
          busy={busyKey === 'urgentAlertEnabled'}
        />
        <ToggleCard
          icon={Tv}
          title="Kuku TV Banner"
          description="Show the Kuku TV banner, right above Urgent Alert"
          checked={control.kukuTvEnabled}
          onChange={(v) => update('kukuTvEnabled', { kukuTvEnabled: v })}
          busy={busyKey === 'kukuTvEnabled'}
        />
      </div>

      <div className="glass rounded-xl2 p-5">
        <h2 className="font-display font-semibold text-white flex items-center gap-2">
          <Users size={17} className="text-orange-400" />
          Admins ({admins.length})
        </h2>
        <div className="mt-3 divide-y divide-white/10">
          {admins.length === 0 && <p className="text-sm text-white/40 py-2">No admins yet.</p>}
          {admins.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2.5 text-sm gap-2">
              <div className="min-w-0">
                <span className="text-white/80 truncate block">{a.name}</span>
                <span className="text-[11px] text-white/35 font-mono">
                  {a.lastLogin?.toDate ? a.lastLogin.toDate().toLocaleString() : '\u2014'}
                </span>
              </div>
              {a.id !== auth.currentUser?.uid && (
                <button
                  onClick={() => setPendingRemove(a)}
                  className="shrink-0 h-8 w-8 grid place-items-center rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label={`Remove ${a.name}`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <SecretCodeModal
        open={!!pendingRemove}
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  )
}
