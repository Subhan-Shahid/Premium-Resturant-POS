import { useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  UtensilsCrossed,
  Grid3X3,
  ChefHat,
  CalendarDays,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Receipt,
  ArrowRight,
  Clock,
  Sparkles,
  ShoppingBag,
  Bike
} from 'lucide-react'
import useStore from '../store/useStore'

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    sales,
    orders,
    tables,
    kots,
    inventory,
    menuItems,
    settings,
    currentUser,
  } = useStore()

  const currency = settings.currency || '$'

  // Calculations
  const todayRevenue = useMemo(() => {
    return (sales || []).reduce((sum, s) => sum + Number(s.total || 0), 0)
  }, [sales])

  const totalOrdersCount = (sales || []).length + (orders || []).length
  const avgOrderValue = (sales || []).length ? todayRevenue / (sales || []).length : 0

  const occupiedTables = (tables || []).filter((t) => t.status === 'occupied').length
  const activeKots = (kots || []).filter((k) => k.status === 'cooking' || k.status === 'pending').length

  // Channel breakdown
  const dineInSales = (sales || []).filter((s) => s.type === 'dine_in').reduce((a, s) => a + Number(s.total || 0), 0)
  const takeawaySales = (sales || []).filter((s) => s.type === 'takeaway').reduce((a, s) => a + Number(s.total || 0), 0)
  const deliverySales = (sales || []).filter((s) => s.type === 'delivery').reduce((a, s) => a + Number(s.total || 0), 0)

  // Low stock ingredients alert
  const lowStockIngredients = (inventory || []).filter(
    (i) => Number(i.currentStock) <= Number(i.minStock)
  )

  // Top selling dishes
  const topDishes = useMemo(() => {
    const dishMap = {}
    ;(sales || []).forEach((s) => {
      ;(s.items || []).forEach((item) => {
        if (!dishMap[item.name]) {
          dishMap[item.name] = { name: item.name, qty: 0, revenue: 0 }
        }
        dishMap[item.name].qty += Number(item.qty || 1)
        dishMap[item.name].revenue += Number(item.price || 0) * Number(item.qty || 1)
      })
    })
    return Object.values(dishMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [sales])

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* ─── WELCOME BANNER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white shadow-xl shadow-orange-500/10">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
            Restaurant Command Center
          </span>
          <h1 className="text-xl md:text-2xl font-black mt-2 leading-tight">
            Welcome back, {currentUser?.name || 'Manager'}!
          </h1>
          <p className="text-xs md:text-sm text-white/90 mt-1">
            {settings.companyName || 'Bella Vista Bistro'} is operating smoothly today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <NavLink
            to="/pos"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-orange-600 font-extrabold text-xs shadow-md hover:bg-white/95 transition-all"
          >
            <UtensilsCrossed size={16} />
            <span>Open POS Terminal</span>
          </NavLink>
          <NavLink
            to="/kitchen"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/30 hover:bg-black/40 text-white font-extrabold text-xs backdrop-blur-xs transition-all"
          >
            <ChefHat size={16} />
            <span>Kitchen Display</span>
          </NavLink>
        </div>
      </div>

      {/* ─── REAL-TIME OPERATIONAL METRICS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
              <DollarSign size={17} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">
            {currency}{todayRevenue.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            +{(sales || []).length} completed bills
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Active Tables</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600">
              <Grid3X3 size={17} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {occupiedTables} / {tables.length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            {tables.length ? Math.round((occupiedTables / tables.length) * 100) : 0}% floor occupancy
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Live KDS Orders</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600">
              <ChefHat size={17} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-500 mt-2">
            {activeKots} Tickets
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            In kitchen preparation
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Average Order (AOV)</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600">
              <TrendingUp size={17} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">
            {currency}{avgOrderValue.toFixed(2)}
          </p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-1">
            Per guest ticket
          </p>
        </div>
      </div>

      {/* ─── MIDDLE: CHANNEL SHARE & LOW INVENTORY ALERTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales by Channel */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">
              Sales by Channel
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Revenue distribution across dining modes
            </p>

            <div className="space-y-3 mt-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                    <UtensilsCrossed size={14} /> Dine-In
                  </span>
                  <span>{currency}{dineInSales.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{
                      width: `${todayRevenue ? (dineInSales / todayRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <ShoppingBag size={14} /> Takeaway
                  </span>
                  <span>{currency}{takeawaySales.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${todayRevenue ? (takeawaySales / todayRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-blue-500">
                    <Bike size={14} /> Delivery
                  </span>
                  <span>{currency}{deliverySales.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${todayRevenue ? (deliverySales / todayRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-gray-500">Total Orders:</span>
            <span className="font-extrabold text-gray-900 dark:text-white">{totalOrdersCount}</span>
          </div>
        </div>

        {/* Low Stock Ingredient Alerts */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500">
                <AlertTriangle size={16} />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                Low Raw Material & Ingredient Alerts
              </h3>
            </div>
            <NavLink
              to="/inventory"
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Inventory</span>
              <ArrowRight size={13} />
            </NavLink>
          </div>

          {lowStockIngredients.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 dark:text-slate-500">
              All raw kitchen ingredients are well stocked above safety limits.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lowStockIngredients.map((ing) => (
                <div
                  key={ing.id}
                  className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-500/5 border border-rose-200/50 dark:border-rose-500/10 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-xs text-gray-900 dark:text-white">
                      {ing.name}
                    </p>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                      Current: {ing.currentStock} {ing.unit} (Min: {ing.minStock})
                    </p>
                  </div>
                  <NavLink
                    to="/inventory"
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs"
                  >
                    Restock
                  </NavLink>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── BOTTOM: TOP SELLING DISHES & ACTIVE TICKETS PREVIEW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Dishes */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">
            Top Performing Dishes Today
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
            Best sellers ranked by ordered volume
          </p>

          <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
            {topDishes.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No dishes sold yet today.</p>
            ) : (
              topDishes.map((dish, i) => (
                <div key={dish.name} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-black">
                      #{i + 1}
                    </span>
                    <span className="font-bold text-xs text-gray-900 dark:text-white">
                      {dish.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white block">
                      {dish.qty} orders
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-slate-500">
                      {currency}{dish.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Active Dine-In Tables */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                Live Tables Overview
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Floor status at a glance
              </p>
            </div>
            <NavLink
              to="/tables"
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              <span>Floor Plan</span>
              <ArrowRight size={13} />
            </NavLink>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
            {tables.slice(0, 9).map((t) => (
              <div
                key={t.id}
                onClick={() => navigate('/tables')}
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                  t.status === 'occupied'
                    ? 'border-rose-500/50 bg-rose-50/50 dark:bg-rose-500/10'
                    : t.status === 'reserved'
                    ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-500/10'
                    : 'border-gray-200 dark:border-white/[0.06] hover:border-orange-500/40'
                }`}
              >
                <p className="font-extrabold text-xs text-gray-900 dark:text-white">
                  {t.name}
                </p>
                <span
                  className={`text-[9px] font-bold uppercase ${
                    t.status === 'occupied'
                      ? 'text-rose-600 dark:text-rose-400'
                      : t.status === 'reserved'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
