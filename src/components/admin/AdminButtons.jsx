import { useEffect, useState } from 'react'
import { Send, Siren, Tv, Save, AlertCircle } from 'lucide-react'
import { TELEGRAM_URL, URGENT_ALERT_URL, KUKU_TV_URL } from '../../data/constants'
import { subscribeAppControl, setAppControl } from '../../lib/platformsFirestore'
import SecretCodeModal from './SecretCodeModal'

function LinkEditor({ icon: Icon, title, description, value, onChange, onRequestSave, saved }) {
  return (
    <div className="glass rounded-xl2 p-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-orange-500/10 border border-orange-500/30 grid place-items-center shrink-0">
          <Icon size={16} className="text-orange-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-white/50">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 glass-pill rounded-full px-4 py-2.5 text-xs text-white/80 outline-none font-mono"
        />
        <button
          onClick={onRequestSave}
          className="shrink-0 h-9 w-9 grid place-items-center rounded-full bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors"
          aria-label="Save"
        >
          <Save size={15} />
        </button>
      </div>
      {saved && <p className="text-[11px] text-emerald-400 mt-1.5">Saved &mdash; live for every visitor now.</p>}
    </div>
  )
}

export default function AdminButtons() {
  const [telegramUrl, setTelegramUrl] = useState(TELEGRAM_URL)
  const [urgentAlertUrl, setUrgentAlertUrl] = useState(URGENT_ALERT_URL)
  const [kukuTvUrl, setKukuTvUrl] = useState(KUKU_TV_URL)
  const [savedField, setSavedField] = useState('')
  const [error, setError] = useState('')
  const [pendingField, setPendingField] = useState(null) // 'telegram' | 'urgent' | 'kukutv' | null

  useEffect(
    () =>
      subscribeAppControl((c) => {
        if (c.telegramUrl) setTelegramUrl(c.telegramUrl)
        if (c.urgentAlertUrl) setUrgentAlertUrl(c.urgentAlertUrl)
        if (c.kukuTvUrl) setKukuTvUrl(c.kukuTvUrl)
      }),
    []
  )

  async function confirmSave() {
    const field = pendingField
    setPendingField(null)
    setError('')
    const patch =
      field === 'telegram'
        ? { telegramUrl }
        : field === 'urgent'
        ? { urgentAlertUrl }
        : { kukuTvUrl }
    try {
      await setAppControl(patch)
      setSavedField(field)
      setTimeout(() => setSavedField(''), 2000)
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
        <h1 className="font-display text-2xl font-bold text-white">Buttons</h1>
        <p className="text-sm text-white/50 mt-1">Where each action button on the site actually points.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl2 border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <LinkEditor
        icon={Send}
        title="Telegram Popup"
        description="The 'Join Telegram Community' button in the welcome popup"
        value={telegramUrl}
        onChange={setTelegramUrl}
        onRequestSave={() => setPendingField('telegram')}
        saved={savedField === 'telegram'}
      />

      <LinkEditor
        icon={Tv}
        title="Kuku TV Banner"
        description="The Kuku TV banner's link, shown above Urgent Alert"
        value={kukuTvUrl}
        onChange={setKukuTvUrl}
        onRequestSave={() => setPendingField('kukutv')}
        saved={savedField === 'kukutv'}
      />

      <LinkEditor
        icon={Siren}
        title="Urgent Alert Banner"
        description="The red urgent-alert banner's Telegram link"
        value={urgentAlertUrl}
        onChange={setUrgentAlertUrl}
        onRequestSave={() => setPendingField('urgent')}
        saved={savedField === 'urgent'}
      />

      <p className="text-xs text-white/30 text-center">Turn these on or off entirely from the Control tab.</p>

      <SecretCodeModal open={!!pendingField} onConfirm={confirmSave} onCancel={() => setPendingField(null)} />
    </div>
  )
}
