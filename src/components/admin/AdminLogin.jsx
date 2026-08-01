import { useEffect, useRef, useState } from 'react'
import { Lock, User, Eye, EyeOff, Zap } from 'lucide-react'
import { ADMIN_BRAND } from '../../data/constants'
import { signInAdmin, registerAdmin } from '../../lib/adminAuth'
import { speak } from '../../lib/speech'

export default function AdminLogin({ onSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [busy, setBusy] = useState(false)
  const greeted = useRef(false)

  useEffect(() => {
    const greet = () => {
      if (greeted.current) return
      greeted.current = true
      speak(`Welcome to ${ADMIN_BRAND.name}. Please enter your name and password to continue.`)
    }
    window.addEventListener('pointerdown', greet, { once: true })
    window.addEventListener('keydown', greet, { once: true })
    return () => {
      window.removeEventListener('pointerdown', greet)
      window.removeEventListener('keydown', greet)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !password) return
    setBusy(true)
    setError('')
    try {
      if (mode === 'register') {
        await registerAdmin(name.trim(), password)
      } else {
        await signInAdmin(name.trim(), password)
      }
      speak(`Login successful. Welcome, ${name.trim()}.`)
      onSuccess()
    } catch (err) {
      const message =
        err.code === 'auth/email-already-in-use'
          ? 'That name is already registered - try logging in instead.'
          : err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Incorrect name or password.'
          : err.code === 'auth/weak-password'
          ? 'Password should be at least 6 characters.'
          : 'Something went wrong. Please try again.'
      setError(message)
      setShaking(true)
      setTimeout(() => setShaking(false), 450)
      speak(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div
        className={`w-full max-w-sm glass-strong rounded-xl3 p-7 sm:p-8 animate-fade-in-up ${
          shaking ? 'animate-shake' : ''
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-white shadow-glow">
            <img src="/logos/admin-icon.png" alt={ADMIN_BRAND.name} className="h-full w-full object-cover" />
          </div>
          <h1 className="font-display text-xl font-bold text-white mt-4">{ADMIN_BRAND.name}</h1>
          <p className="text-sm text-white/50 mt-1">
            {mode === 'login' ? 'Restricted area — sign in to continue' : 'Create a new admin account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-3.5">
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              className="w-full glass-pill rounded-full pl-11 pr-4 py-3 text-sm text-white outline-none"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full glass-pill rounded-full pl-11 pr-11 py-3 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-600 hover:brightness-110 transition rounded-full py-3 text-sm font-bold text-night shadow-glow disabled:opacity-60"
          >
            <Zap size={15} fill="currentColor" />
            {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === 'login' ? 'register' : 'login'))
              setError('')
            }}
            className="w-full text-center text-xs text-white/40 hover:text-white/70 transition-colors py-1"
          >
            {mode === 'login' ? "First time here? Create an admin account" : 'Already have an account? Log in'}
          </button>
        </form>

        <p className="text-[11px] text-white/25 text-center mt-4 tracking-wide">Authorized access only</p>
      </div>
    </div>
  )
}
