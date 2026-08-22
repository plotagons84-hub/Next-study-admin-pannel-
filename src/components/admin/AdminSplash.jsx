import { Zap, ShieldOff } from 'lucide-react'
import { ADMIN_BRAND } from '../../data/constants'

export default function AdminSplash({ onEnter, revokedMessage }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center animate-fade-in-up">
      <div className="flex flex-col items-center">
        <div className="relative h-28 w-28">
          <div className="absolute inset-[-14px] rounded-full border border-orange-500/20 animate-pulse-glow" />
          <div className="absolute inset-0 rounded-full overflow-hidden bg-white shadow-glow">
            <img src="/logos/admin-icon.png" alt={ADMIN_BRAND.name} className="h-full w-full object-cover" />
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-8 tracking-tight">
          {ADMIN_BRAND.name}
        </h1>
        <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.3em] text-white/40 mt-2">
          Admin Control System
        </p>

        {revokedMessage ? (
          <p className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red-400 mt-5">
            <ShieldOff size={14} />
            {revokedMessage}
          </p>
        ) : (
          <p className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mt-5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            AI Tutor Online
          </p>
        )}

        <button
          onClick={onEnter}
          className="mt-9 flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-600 hover:brightness-110 transition rounded-full px-8 py-3.5 text-sm font-bold text-night shadow-glow"
        >
          <Zap size={16} fill="currentColor" />
          Enter System
        </button>

        <p className="text-[11px] text-white/30 mt-5 tracking-wide">Authorized personnel only</p>
      </div>
    </div>
  )
}
