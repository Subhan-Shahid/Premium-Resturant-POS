import { useState } from 'react'
import { Lock, Unlock, KeyRound, AlertCircle, ArrowRight } from 'lucide-react'
import useStore from '../../store/useStore'
import { verifyPassword } from '../../utils/security'

export default function ScreenLockModal({ open, onUnlock }) {
  const { currentUser } = useStore()
  const [passwordInput, setPasswordInput] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)

  if (!open || !currentUser) return null

  const handleUnlock = async (e) => {
    e.preventDefault()
    setError('')
    if (!passwordInput) return

    setVerifying(true)
    const isValid = await verifyPassword(passwordInput, currentUser.password)
    setVerifying(false)

    if (isValid) {
      setPasswordInput('')
      onUnlock()
    } else {
      setError('Incorrect password or PIN')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-[#0e131b] border border-white/10 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-scale-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center shadow-inner">
          <Lock size={30} className="stroke-[2.2]" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">Terminal Locked</h2>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-white">{currentUser.name || currentUser.username}</strong> ({currentUser.role})
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3">
          <div className="relative">
            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              placeholder="Enter password to unlock"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-400 flex items-center justify-center gap-1">
              <AlertCircle size={13} />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Unlock size={15} />
            <span>{verifying ? 'Verifying...' : 'Unlock Terminal'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}

