import { NavLink, useLocation } from 'react-router-dom'
import {
  UtensilsCrossed,
  Grid3X3,
  ChefHat,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react'
import { useState } from 'react'
import AppDrawer from './AppDrawer'
import useStore from '../../store/useStore'

const primaryNav = [
  { to: '/pos', label: 'POS', icon: UtensilsCrossed },
  { to: '/tables', label: 'Tables', icon: Grid3X3, badgeKey: 'occupied' },
  { to: '/kitchen', label: 'Kitchen', icon: ChefHat, badgeKey: 'kds' },
  { to: '/menu', label: 'Menu', icon: BookOpen },
]

export default function BottomNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const { tables, kots } = useStore()

  const occupiedCount = tables?.filter(t => t.status === 'occupied').length || 0
  const activeKotsCount = kots?.filter(k => k.status === 'cooking' || k.status === 'pending').length || 0

  const moreRoutes = [
    '/dashboard', '/reservations', '/inventory', '/orders-history', '/expenses', '/reports', '/users', '/settings'
  ]
  const moreActive = moreRoutes.some(r => location.pathname.startsWith(r))

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#0d1219] border-t border-gray-100 dark:border-white/[0.08]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-14">
          {primaryNav.map(({ to, label, icon: Icon, badgeKey }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-semibold relative
                ${isActive ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-slate-400'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                    {badgeKey === 'occupied' && occupiedCount > 0 && (
                      <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-rose-500 text-white leading-tight">
                        {occupiedCount}
                      </span>
                    )}
                    {badgeKey === 'kds' && activeKotsCount > 0 && (
                      <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-amber-500 text-black leading-tight">
                        {activeKotsCount}
                      </span>
                    )}
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* More Drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-semibold relative
              ${moreActive ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-slate-400'}`}
          >
            <MoreHorizontal size={20} strokeWidth={moreActive ? 2.3 : 1.8} />
            <span>More</span>
          </button>
        </div>
      </nav>

      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
