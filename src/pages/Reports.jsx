import { useState, useMemo } from 'react'
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Users,
  UtensilsCrossed,
  PieChart,
  Download
} from 'lucide-react'
import useStore from '../store/useStore'

export default function Reports() {
  const { sales, settings, staff, expenses } = useStore()
  const currency = settings.currency || '$'

  const [dateRange, setDateRange] = useState('all') // 'today' | 'week' | 'all'

  const filteredSales = useMemo(() => {
    if (dateRange === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10)
      return (sales || []).filter((s) => (s.date || '').slice(0, 10) === todayStr)
    }
    return sales || []
  }, [sales, dateRange])

  // Calculations
  const grossSales = filteredSales.reduce((acc, s) => acc + Number(s.total || 0), 0)
  const netSales = filteredSales.reduce((acc, s) => acc + Number(s.subtotal || 0), 0)
  const totalTax = filteredSales.reduce((acc, s) => acc + Number(s.tax || 0), 0)
  const totalServiceCharge = filteredSales.reduce((acc, s) => acc + Number(s.serviceCharge || 0), 0)
  const totalDiscounts = filteredSales.reduce((acc, s) => acc + Number(s.discount || 0), 0)
  const totalExpenses = (expenses || []).reduce((acc, e) => acc + Number(e.amount || 0), 0)
  const netProfit = grossSales - totalExpenses

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const map = { cash: 0, card: 0, digital: 0 }
    filteredSales.forEach((s) => {
      const method = (s.paymentMethod || 'cash').toLowerCase()
      if (method.includes('card')) map.card += Number(s.total || 0)
      else if (method.includes('digital') || method.includes('online')) map.digital += Number(s.total || 0)
      else map.cash += Number(s.total || 0)
    })
    return map
  }, [filteredSales])

  // Waiter Performance
  const waiterStats = useMemo(() => {
    const map = {}
    filteredSales.forEach((s) => {
      const server = s.serverName || 'Counter'
      if (!map[server]) map[server] = { server, orders: 0, revenue: 0 }
      map[server].orders += 1
      map[server].revenue += Number(s.total || 0)
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue)
  }, [filteredSales])

  // Top Dishes
  const dishBreakdown = useMemo(() => {
    const map = {}
    filteredSales.forEach((s) => {
      ;(s.items || []).forEach((it) => {
        if (!map[it.name]) map[it.name] = { name: it.name, qty: 0, revenue: 0 }
        map[it.name].qty += Number(it.qty || 1)
        map[it.name].revenue += Number(it.price || 0) * Number(it.qty || 1)
      })
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue)
  }, [filteredSales])

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0d1219] p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
            <BarChart3 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
              Restaurant Analytics & Performance
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Tax collection, dining margins, server commissions & sales channels
            </p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-white/[0.06] rounded-xl text-xs font-semibold">
          <button
            onClick={() => setDateRange('today')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === 'today'
                ? 'bg-orange-500 text-white font-bold shadow-xs'
                : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dateRange === 'all'
                ? 'bg-orange-500 text-white font-bold shadow-xs'
                : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* ─── REVENUE & FINANCIAL KPI CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Gross Revenue</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {currency}{grossSales.toFixed(2)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Net Sales (Pre-Tax)</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {currency}{netSales.toFixed(2)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-blue-500">VAT / Tax Collected</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {currency}{totalTax.toFixed(2)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-purple-500">Service Charge</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {currency}{totalServiceCharge.toFixed(2)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-rose-500">Expenses & Wastage</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {currency}{totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* ─── PAYMENT CHANNELS & WAITER PERFORMANCE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Channels */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">
            Payment Mode Collections
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
            Cash, Card POS & Digital Wallets
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-600">💵 Cash</span>
                <span>{currency}{paymentBreakdown.cash.toFixed(2)} ({grossSales ? Math.round((paymentBreakdown.cash / grossSales) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${grossSales ? (paymentBreakdown.cash / grossSales) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-blue-500">💳 Card POS Terminal</span>
                <span>{currency}{paymentBreakdown.card.toFixed(2)} ({grossSales ? Math.round((paymentBreakdown.card / grossSales) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${grossSales ? (paymentBreakdown.card / grossSales) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-purple-500">📱 Digital QR / Online</span>
                <span>{currency}{paymentBreakdown.digital.toFixed(2)} ({grossSales ? Math.round((paymentBreakdown.digital / grossSales) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${grossSales ? (paymentBreakdown.digital / grossSales) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Waiter / Staff Performance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">
            Server & Waiter Sales
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
            Tickets handled and total volume billed
          </p>

          <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
            {waiterStats.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No waiter sales recorded yet.</p>
            ) : (
              waiterStats.map((w) => (
                <div key={w.server} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-gray-900 dark:text-white">{w.server}</p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">{w.orders} tables served</p>
                  </div>
                  <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                    {currency}{w.revenue.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── DISH REVENUE PERFORMANCE TABLE ─── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">
          Menu Item Sales Breakdown
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
          All dishes ordered, quantities, and gross revenues generated
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/[0.08] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3 text-center">Quantity Sold</th>
                <th className="py-2.5 px-3 text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {dishBreakdown.map((dish) => (
                <tr key={dish.name} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">
                    {dish.name}
                  </td>
                  <td className="py-2.5 px-3 text-center font-extrabold text-gray-700 dark:text-slate-300">
                    {dish.qty}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-orange-600 dark:text-orange-400">
                    {currency}{dish.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
