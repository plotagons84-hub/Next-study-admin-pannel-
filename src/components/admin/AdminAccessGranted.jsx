import { useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'
import { speak } from '../../lib/speech'

export default function AdminAccessGranted({ name, onDone }) {
  useEffect(() => {
    speak(`Access granted. Welcome back, ${name || 'admin'}.`)
    const timer = setTimeout(onDone, 1800)
    return () => clearTimeout(timer)
  }, [name, onDone])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center animate-pop-in">
        <div className="h-24 w-24 rounded-full bg-orange-500/10 border border-orange-500/40 grid place-items-center shadow-glow">
          <ShieldCheck size={44} className="text-orange-400" />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-7 tracking-tight">
          Access Granted
        </h1>
        <p className="text-sm font-mono uppercase tracking-widest text-orange-300 mt-2">
          Welcome back, {name || 'Admin'}
        </p>
        <p className="text-xs text-white/40 mt-1">Initializing admin panel&hellip;</p>

        <div className="w-56 h-1.5 rounded-full bg-white/10 mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-600 rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  )
}
