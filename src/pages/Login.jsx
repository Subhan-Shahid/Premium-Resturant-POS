import { useState } from 'react'
import { User, Lock, Eye, EyeOff, ArrowRight, UtensilsCrossed, ChefHat, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Login() {
  const navigate = useNavigate()
  const { login, settings } = useStore()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const brand = settings?.companyName || 'Bella Vista Bistro'

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')
    const uname = username.trim()
    if (!uname || !password) {
      setError('Please enter your username and password')
      return
    }

    setLoading(true)
    const res = login(uname, password)
    if (!res.success) {
      setError(res.message || 'Invalid username or password')
      setLoading(false)
      return
    }

    const role = String(res.user?.role || '').toLowerCase()
    if (role === 'chef') {
      navigate('/kitchen', { replace: true })
    } else if (role === 'waiter') {
      navigate('/tables', { replace: true })
    } else if (role === 'cashier') {
      navigate('/pos', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  const handleQuickLogin = (uname, pwd) => {
    setUsername(uname)
    setPassword(pwd)
    const res = login(uname, pwd)
    if (res.success) {
      const role = String(res.user?.role || '').toLowerCase()
      if (role === 'chef') navigate('/kitchen', { replace: true })
      else if (role === 'waiter') navigate('/tables', { replace: true })
      else if (role === 'cashier') navigate('/pos', { replace: true })
      else navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#07090e] text-slate-100 flex items-center justify-center p-4">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(249, 115, 22, 0.25), transparent 50%), radial-gradient(circle at 80% 80%, rgba(217, 119, 6, 0.15), transparent 40%)'
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 mb-3">
            <UtensilsCrossed size={32} className="stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{brand}</h1>
          <p className="text-xs text-orange-400 font-semibold tracking-wide uppercase mt-1">
            Restaurant POS & Management System
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-white/10 bg-[#0f141c]/90 backdrop-blur-md p-6 shadow-2xl space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (e.g. admin)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Restaurant POS'}</span>
            <ArrowRight size={15} />
          </button>

          {/* Quick Demo Login Badges */}
          <div className="pt-3 border-t border-white/[0.08]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center mb-2">
              Fast Demo Sign In:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-orange-500/20 border border-white/10 text-left transition-colors"
              >
                <p className="font-bold text-white">Manager</p>
                <p className="text-[10px] text-slate-400">admin / admin123</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('cashier', 'cashier123')}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-orange-500/20 border border-white/10 text-left transition-colors"
              >
                <p className="font-bold text-white">Cashier</p>
                <p className="text-[10px] text-slate-400">cashier / cashier123</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('waiter', 'waiter123')}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-orange-500/20 border border-white/10 text-left transition-colors"
              >
                <p className="font-bold text-white">Waiter</p>
                <p className="text-[10px] text-slate-400">waiter / waiter123</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('kitchen', 'kitchen123')}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-orange-500/20 border border-white/10 text-left transition-colors"
              >
                <p className="font-bold text-white">Head Chef (KDS)</p>
                <p className="text-[10px] text-slate-400">kitchen / kitchen123</p>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
