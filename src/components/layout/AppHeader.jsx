import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, LogOut, UtensilsCrossed, ChefHat, Bell, Maximize2, Lock } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useStore from '../../store/useStore'
import ScreenLockModal from '../common/ScreenLockModal'

const syncMeta = {
  local:        { label: 'Local Storage', dot: 'bg-emerald-400' },
  connected:    { label: 'Local Storage', dot: 'bg-emerald-400' },
  connecting:   { label: 'Saving…',       dot: 'bg-amber-400'   },
  error:        { label: 'Storage alert', dot: 'bg-rose-400'    },
  disconnected: { label: 'Local Storage', dot: 'bg-emerald-400' },
}

export default function AppHeader() {
  const { settings, currentUser, cloudSyncStatus, ui, toggleDarkMode, logout, tables, kots, notifications, clearAllNotifications } = useStore()
  const meta = syncMeta[cloudSyncStatus] || syncMeta.connected
  const isDark = ui?.darkMode

  const [isLocked, setIsLocked] = useState(false)
  const [notiDropdownOpen, setNotiDropdownOpen] = useState(false)
  const idleTimerRef = useRef(null)

  // 15-minute automatic inactivity lock for terminal security
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      if (currentUser) {
        setIsLocked(true)
      }
    }, 15 * 60 * 1000) // 15 minutes
  }

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    const handleActivity = () => resetIdleTimer()
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }))
    resetIdleTimer()

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      events.forEach(e => window.removeEventListener(e, handleActivity))
    }
  }, [currentUser])

  const occupiedCount = tables?.filter(t => t.status === 'occupied').length || 0
  const activeKotsCount = kots?.filter(k => k.status === 'cooking' || k.status === 'pending').length || 0

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  return (
    <>
      <ScreenLockModal open={isLocked} onUnlock={() => setIsLocked(false)} />
      <header
        className="shrink-0 bg-white dark:bg-[#0d1219] border-b border-gray-100 dark:border-white/[0.08] transition-colors z-30"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="w-full px-3 md:px-5 flex items-center justify-between gap-3 h-14">
          {/* Brand & Restaurant Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <UtensilsCrossed size={19} className="stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm md:text-base font-bold text-gray-900 dark:text-slate-100 truncate leading-tight">
                  {settings?.companyName || 'Bella Vista Bistro'}
                </p>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400">
                  POS
                </span>
              </div>
              {currentUser && (
                <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-tight truncate">
                  {currentUser.name || currentUser.username} · <span className="capitalize font-medium text-orange-600 dark:text-orange-400">{currentUser.role}</span>
                </p>
              )}
            </div>
          </div>

          {/* Live Restaurant Badges & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Active Tables Pill */}
            <NavLink
              to="/tables"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-gray-700 dark:text-slate-300 text-xs font-medium transition-colors"
              title="View Active Tables"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Tables: <strong className="text-gray-900 dark:text-white">{occupiedCount}</strong>/{tables?.length || 0}</span>
            </NavLink>

            {/* Active KOTs Pill */}
            <NavLink
              to="/kitchen"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 transition-colors"
              title="Kitchen Display System"
            >
              <ChefHat size={14} />
              <span>KDS: <strong>{activeKotsCount}</strong></span>
            </NavLink>

            {/* Sync indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06]">
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400">{meta.label}</span>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotiDropdownOpen(!notiDropdownOpen)}
                aria-label="View notifications"
                title="Restaurant Notifications"
                className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
              >
                <Bell size={16} />
                {notifications && notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                )}
                {notifications && notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
                )}
              </button>

              {notiDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#121820] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-3 z-50 animate-scale-in">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
                    <div className="flex items-center gap-1.5">
                      <Bell size={14} className="text-orange-500" />
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Recent Alerts</h4>
                    </div>
                    {notifications && notifications.length > 0 && (
                      <button
                        onClick={() => clearAllNotifications()}
                        className="text-[10px] font-semibold text-gray-400 hover:text-rose-500"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.06] my-1">
                    {!notifications || notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className="py-2.5 flex flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              n.type === 'new_order'
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {n.type === 'new_order' ? 'Chef Alert' : 'Waiter Alert'}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-tight">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Lock Screen Button */}
            <button
              onClick={() => setIsLocked(true)}
              aria-label="Lock POS Terminal"
              title="Lock Terminal (Requires password to unlock)"
              className="p-2 rounded-xl text-gray-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
            >
              <Lock size={16} />
            </button>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              aria-label="Toggle Fullscreen"
              title="Toggle Fullscreen (POS Mode)"
              className="hidden lg:flex p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
            >
              <Maximize2 size={16} />
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
            >
              {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            {/* Sign Out */}
            <button
              onClick={() => {
                logout()
                window.location.pathname = '/login'
              }}
              aria-label="Sign out"
              title="Sign out"
              className="p-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-95 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
