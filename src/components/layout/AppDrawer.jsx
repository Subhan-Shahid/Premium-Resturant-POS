import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Receipt,
  BarChart3,
  Wallet,
  Settings,
  Users,
  X,
  UtensilsCrossed
} from 'lucide-react'
import useStore from '../../store/useStore'
import { useEffect } from 'react'

const drawerItems = [
  { to: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, color: 'text-amber-500' },
  { to: '/reservations', label: 'Table Reservations', icon: CalendarDays, color: 'text-sky-500' },
  { to: '/inventory', label: 'Food & Raw Inventory', icon: Package, color: 'text-emerald-500' },
  { to: '/orders-history', label: 'Order & Bill History', icon: Receipt, color: 'text-purple-500' },
  { to: '/expenses', label: 'Kitchen & Daily Expenses', icon: Wallet, color: 'text-rose-500' },
  { to: '/reports', label: 'Sales & Revenue Reports', icon: BarChart3, color: 'text-indigo-500' },
  { to: '/users', label: 'Staff Management', icon: Users, color: 'text-teal-500' },
  { to: '/settings', label: 'Restaurant Settings', icon: Settings, color: 'text-slate-400' },
]

export default function AppDrawer({ open, onClose }) {
  const { settings, currentUser, logout } = useStore()

  useEffect(() => {
    if (!open) return
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 flex flex-col mx-auto max-w-lg w-full md:hidden
          bg-white dark:bg-[#121820] border-t border-gray-200 dark:border-white/10 rounded-t-3xl shadow-2xl
          transition-transform duration-300 ease-out max-h-[85vh]
          ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-white/20" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <UtensilsCrossed size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                {settings?.companyName || 'Bella Vista Bistro'}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">
                Logged in as {currentUser?.name || currentUser?.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3 space-y-1">
          {drawerItems.map(({ to, label, icon: Icon, color }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors
                ${isActive
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'
                }`
              }
            >
              <span className={`p-1.5 rounded-lg bg-gray-100 dark:bg-white/[0.05] ${color}`}>
                <Icon size={18} />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  )
}
