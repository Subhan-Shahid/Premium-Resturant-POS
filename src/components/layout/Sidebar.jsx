import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Grid3X3,
  ChefHat,
  BookOpen,
  CalendarDays,
  Package,
  Receipt,
  BarChart3,
  Wallet,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import useStore from '../../store/useStore'

const navGroups = [
  {
    title: 'OPERATIONS',
    items: [
      { to: '/pos', label: 'POS Terminal', icon: UtensilsCrossed, badge: null },
      { to: '/tables', label: 'Tables & Floor', icon: Grid3X3, badgeKey: 'occupiedTables' },
      { to: '/kitchen', label: 'Kitchen KDS', icon: ChefHat, badgeKey: 'activeKots' },
      { to: '/menu', label: 'Menu Catalog', icon: BookOpen },
      { to: '/reservations', label: 'Reservations', icon: CalendarDays },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/orders-history', label: 'Order History', icon: Receipt },
      { to: '/inventory', label: 'Food Inventory', icon: Package },
      { to: '/expenses', label: 'Expenses', icon: Wallet },
      { to: '/reports', label: 'Sales Reports', icon: BarChart3 },
      { to: '/users', label: 'Staff & Roles', icon: Users },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const { ui, toggleSidebar, tables, kots } = useStore()
  const open = !!ui?.sidebarOpen

  const occupiedCount = tables?.filter(t => t.status === 'occupied').length || 0
  const activeKotsCount = kots?.filter(k => k.status === 'cooking' || k.status === 'pending').length || 0

  const getBadge = (badgeKey) => {
    if (badgeKey === 'occupiedTables' && occupiedCount > 0) {
      return <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">{occupiedCount}</span>
    }
    if (badgeKey === 'activeKots' && activeKotsCount > 0) {
      return <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-black">{activeKotsCount}</span>
    }
    return null
  }

  return (
    <aside
      className={`
        hidden md:flex flex-col bg-white dark:bg-[#0d1219] border-r border-gray-100 dark:border-white/[0.08]
        transition-all duration-300 ease-in-out shrink-0 select-none
        ${open ? 'w-60' : 'w-[72px]'}
      `}
    >
      {/* Sidebar Top Toggle */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-gray-100 dark:border-white/[0.08]">
        {open ? (
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 px-2">
            Navigation
          </span>
        ) : <div />}

        <button
          onClick={toggleSidebar}
          aria-label={open ? 'Collapse Sidebar' : 'Expand Sidebar'}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors mx-auto"
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {open && (
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">
                {group.title}
              </p>
            )}
            {group.items.map(({ to, label, icon: Icon, badgeKey }) => (
              <NavLink
                key={to}
                to={to}
                title={!open ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative
                  ${isActive
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-slate-100'
                  }
                  ${!open ? 'justify-center px-0' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className="shrink-0 stroke-[2.2]" />
                    {open && <span className="truncate">{label}</span>}
                    {open && getBadge(badgeKey)}
                    {!open && getBadge(badgeKey) && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </aside>
  )
}
