import { BarChart3, Settings, Link2, SquarePlus, Bell, Bot, LogOut, Zap } from 'lucide-react'
import { ADMIN_BRAND } from '../../data/constants'

const TABS = [
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'control', label: 'Control', icon: Settings },
  { id: 'links', label: 'Links', icon: Link2 },
  { id: 'buttons', label: 'Buttons', icon: SquarePlus },
  { id: 'announce', label: 'Announce', icon: Bell },
  { id: 'ai-chat', label: 'AI Chat', icon: Bot },
]

export default function AdminShell({ activeTab, onTabChange, onLogout, onlineCount, children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 shrink-0">
        <div className="min-w-0">
          <p className="font-display font-bold text-white text-sm sm:text-base flex items-center gap-1.5 truncate">
            {ADMIN_BRAND.name}
            <Zap size={14} className="text-orange-400 shrink-0" fill="currentColor" />
          </p>
          <p className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-white/40 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            Online &middot; {onlineCount} {onlineCount === 1 ? 'user' : 'users'}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="shrink-0 h-9 w-9 grid place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-red-400 transition"
          aria-label="Log out"
        >
          <LogOut size={17} />
        </button>
      </header>

      <main className="flex-1 min-w-0 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pb-24">{children}</main>

      <nav className="glass fixed bottom-0 inset-x-0 flex items-stretch justify-around px-1 py-1.5 sm:relative sm:mt-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors"
            >
              <Icon size={19} className={active ? 'text-orange-400' : 'text-white/40'} />
              <span
                className={`text-[10px] font-mono uppercase tracking-wide ${
                  active ? 'text-orange-400' : 'text-white/40'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
