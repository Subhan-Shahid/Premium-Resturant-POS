import { useEffect, useState } from 'react'
import { ChefHat, UtensilsCrossed, CheckCircle2, Bell, X, Volume2, VolumeX } from 'lucide-react'
import useStore from '../../store/useStore'
import { soundManager } from '../../utils/soundAlerts'

export default function NotificationToastManager() {
  const { notifications, dismissNotification, currentUser } = useStore()
  const [activeToasts, setActiveToasts] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(true)

  const userRole = String(currentUser?.role || '').toLowerCase()

  // Track latest notification and fire sound/popup
  useEffect(() => {
    if (!notifications || notifications.length === 0) return

    const latest = notifications[0]
    if (!latest || latest.read) return

    // Check if this notification is targeted to the current user's role
    // 'chef' target => chef and admin
    // 'waiter' target => waiter, cashier, admin, manager
    const isChefTarget = latest.targetRole === 'chef'
    const isWaiterTarget = latest.targetRole === 'waiter'

    let shouldShow = false
    if (userRole === 'admin' || userRole === 'manager') {
      shouldShow = true
    } else if (isChefTarget && (userRole === 'chef' || userRole === 'kitchen')) {
      shouldShow = true
    } else if (isWaiterTarget && (userRole === 'waiter' || userRole === 'cashier')) {
      shouldShow = true
    }

    if (shouldShow) {
      // Avoid duplicate toasts in state
      setActiveToasts((prev) => {
        if (prev.some((t) => t.id === latest.id)) return prev
        return [latest, ...prev.slice(0, 3)] // Max 3 visible at once
      })

      // Audio notification
      if (soundEnabled) {
        if (latest.type === 'new_order') {
          soundManager.playKitchenOrderBell()
        } else if (latest.type === 'order_ready') {
          soundManager.playFoodReadyChime()
        } else {
          soundManager.playPop()
        }
      }

      // Auto dismiss from toast bar after 7 seconds
      const timer = setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.id !== latest.id))
      }, 7000)

      return () => clearTimeout(timer)
    }
  }, [notifications, userRole, soundEnabled])

  const handleClose = (id) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id))
    dismissNotification(id)
  }

  if (activeToasts.length === 0) return null

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {activeToasts.map((toast) => {
        const isNewOrder = toast.type === 'new_order'
        const isReady = toast.type === 'order_ready'

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all animate-slide-in ${
              isNewOrder
                ? 'bg-amber-500/95 dark:bg-[#1a140b]/95 border-amber-400/40 text-amber-950 dark:text-amber-100 shadow-amber-500/20'
                : isReady
                ? 'bg-emerald-600/95 dark:bg-[#091b13]/95 border-emerald-400/40 text-white dark:text-emerald-100 shadow-emerald-500/20'
                : 'bg-white/95 dark:bg-[#121820]/95 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white'
            }`}
          >
            {/* Notification Icon */}
            <div
              className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center ${
                isNewOrder
                  ? 'bg-amber-600/20 text-amber-900 dark:text-amber-300'
                  : isReady
                  ? 'bg-emerald-500/20 text-emerald-100 dark:text-emerald-300'
                  : 'bg-gray-100 dark:bg-white/[0.08]'
              }`}
            >
              {isNewOrder ? (
                <ChefHat size={22} className="animate-bounce" />
              ) : isReady ? (
                <UtensilsCrossed size={22} className="animate-pulse" />
              ) : (
                <Bell size={22} />
              )}
            </div>

            {/* Notification Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isNewOrder
                      ? 'bg-amber-950/20 dark:bg-amber-400/20 text-amber-950 dark:text-amber-200'
                      : 'bg-emerald-950/20 dark:bg-emerald-400/20 text-white dark:text-emerald-200'
                  }`}
                >
                  {isNewOrder ? 'KITCHEN ALERT' : 'WAITER ALERT'}
                </span>
                <span className="text-[10px] opacity-75">Just now</span>
              </div>

              <h4 className="font-extrabold text-sm mt-1 leading-snug">
                {toast.title}
              </h4>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed font-medium">
                {toast.message}
              </p>
            </div>

            {/* Actions: Sound Toggle + Close */}
            <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute alert sounds' : 'Unmute alert sounds'}
                className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <button
                type="button"
                onClick={() => handleClose(toast.id)}
                className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
