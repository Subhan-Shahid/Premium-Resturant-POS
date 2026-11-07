import { useMemo, useState, useRef } from 'react'
import {
  Wallet,
  Plus,
  Trash2,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  X,
  AlertTriangle
} from 'lucide-react'
import useStore from '../store/useStore'

export default function Expenses() {
  const { expenses, addExpense, removeExpense, settings } = useStore()
  const currency = settings.currency || '$'
  const todayStr = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    date: todayStr,
    category: 'Kitchen Utility',
    title: '',
    amount: '',
    paidBy: 'Cash',
  })
  const [range, setRange] = useState('today') // today | yesterday | weekly | monthly | all
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [printOpen, setPrintOpen] = useState(false)
  const [printHtml, setPrintHtml] = useState('')
  const frameRef = useRef(null)

  const [yesterdayStr, weekStartStr, monthStartStr] = useMemo(() => {
    const d = new Date()
    const y = new Date(d)
    y.setDate(d.getDate() - 1)
    const w = new Date(d)
    w.setDate(d.getDate() - 6)
    const m = new Date(d.getFullYear(), d.getMonth(), 1)
    const toStr = (dt) => dt.toISOString().slice(0, 10)
    return [toStr(y), toStr(w), toStr(m)]
  }, [])

  const list = useMemo(() => {
    const data = expenses || []
    if (range === 'today') return data.filter((e) => e.date === todayStr)
    if (range === 'yesterday') return data.filter((e) => e.date === yesterdayStr)
    if (range === 'weekly') return data.filter((e) => e.date >= weekStartStr && e.date <= todayStr)
    if (range === 'monthly') return data.filter((e) => e.date >= monthStartStr && e.date <= todayStr)
    if (range === 'date') return data.filter((e) => selectedDate && e.date === selectedDate)
    return data
  }, [expenses, range, selectedDate, todayStr, yesterdayStr, weekStartStr, monthStartStr])

  const totals = useMemo(() => {
    const totalFiltered = (list || []).reduce((a, b) => a + Number(b.amount || 0), 0)
    const totalToday = (expenses || [])
      .filter((e) => e.date === todayStr)
      .reduce((a, b) => a + Number(b.amount || 0), 0)
    return { totalFiltered, totalToday }
  }, [list, expenses, todayStr])

  const onSubmit = (e) => {
    e.preventDefault()
    const amt = Number(form.amount)
    if (!amt || amt <= 0 || !form.title.trim()) return

    addExpense({
      ...form,
      title: form.title.trim(),
      amount: amt,
    })
    setForm({
      date: form.date,
      category: 'Kitchen Utility',
      title: '',
      amount: '',
      paidBy: 'Cash',
    })
  }

  const handlePrint = () => {
    const thead = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Expense Title</th>
          <th>Payment</th>
          <th style="text-align:right">Amount (${currency})</th>
        </tr>
      </thead>
    `
    const tbody = list
      .map(
        (r) => `
      <tr>
        <td>${r.date}</td>
        <td>${r.category || 'General'}</td>
        <td>${r.title || r.description || ''}</td>
        <td>${r.paidBy || 'Cash'}</td>
        <td style="text-align:right">${currency}${Number(r.amount || 0).toFixed(2)}</td>
      </tr>
    `
      )
      .join('')

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Restaurant Expense Report</title>
      <style>
        @page { size: A4 portrait; margin: 12mm }
        body { margin: 0; padding: 12mm; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #111; }
        h2 { margin: 0 0 6px; }
        .meta { color: #555; margin-bottom: 12px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        .footer { margin-top: 14px; text-align: right; font-weight: bold; font-size: 13px; }
      </style>
      </head><body>
        <h2>${settings.companyName || 'Restaurant'} — Expenses Report</h2>
        <div class="meta">Filter: ${range.toUpperCase()} · Records: ${list.length}</div>
        <table>${thead}<tbody>${tbody}</tbody></table>
        <div class="footer">Filtered Total: ${currency}${totals.totalFiltered.toFixed(2)}</div>
      </body></html>`

    setPrintHtml(html)
    setPrintOpen(true)
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0d1219] p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
            <Wallet size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
              Kitchen & Operational Expenses
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Track restaurant overheads, ingredient purchases, utilities, and daily payouts
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 text-xs font-bold text-gray-800 dark:text-white transition-colors"
        >
          <Printer size={15} />
          <span>Print Report</span>
        </button>
      </div>

      {/* ─── SUMMARY CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Today's Total Expense</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {currency}{totals.totalToday.toFixed(2)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Filtered Range Expense</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {currency}{totals.totalFiltered.toFixed(2)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Active Scope</span>
          <p className="text-2xl font-black text-orange-500 mt-1 capitalize">
            {range}
          </p>
        </div>
      </div>

      {/* ─── ADD EXPENSE FORM ─── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Plus size={16} className="text-orange-500" />
          <span>Record New Expense</span>
        </h3>

        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Kitchen Utility">Kitchen Utility</option>
              <option value="Raw Materials">Raw Materials / Market</option>
              <option value="Wastage">Food Wastage</option>
              <option value="Staff Payout">Staff Wages / Meals</option>
              <option value="Maintenance">Maintenance & Repairs</option>
              <option value="Packaging">Takeaway Packaging</option>
              <option value="General">General Operating</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">Title / Details</label>
            <input
              type="text"
              placeholder="e.g. Gas Cylinder, Fresh Vegetables"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-semibold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">Amount ({currency})</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={15} />
              <span>Add Expense</span>
            </button>
          </div>
        </form>
      </div>

      {/* ─── EXPENSES LIST ─── */}
      <div className="bg-white dark:bg-[#0d1219] rounded-2xl border border-gray-100 dark:border-white/[0.08] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-white/[0.06] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setRange('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                range === 'today' ? 'bg-orange-500 text-white font-bold' : 'text-gray-600 dark:text-slate-400'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setRange('yesterday')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                range === 'yesterday' ? 'bg-orange-500 text-white font-bold' : 'text-gray-600 dark:text-slate-400'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setRange('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                range === 'weekly' ? 'bg-orange-500 text-white font-bold' : 'text-gray-600 dark:text-slate-400'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                range === 'all' ? 'bg-orange-500 text-white font-bold' : 'text-gray-600 dark:text-slate-400'
              }`}
            >
              All Time
            </button>
          </div>

          <span className="text-xs text-gray-500 dark:text-slate-400">
            {list.length} records found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/[0.08] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Details / Title</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-slate-500">
                    No expenses recorded in this period.
                  </td>
                </tr>
              ) : (
                list.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-semibold text-gray-600 dark:text-slate-400">
                      {e.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-slate-300">
                        {e.category || 'General'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">
                      {e.title || e.description || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-rose-600 dark:text-rose-400">
                      {currency}{Number(e.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setToDelete(e)
                          setConfirmOpen(true)
                        }}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL: DELETE CONFIRMATION ─── */}
      {confirmOpen && toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-5 space-y-4 animate-scale-in">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 text-rose-600">
              <AlertTriangle size={18} />
              <span>Delete Expense</span>
            </h3>

            <p className="text-xs text-gray-600 dark:text-slate-400">
              Are you sure you want to remove <strong>"{toDelete.title || toDelete.description}"</strong> ({currency}{Number(toDelete.amount).toFixed(2)})?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeExpense(toDelete.id)
                  setConfirmOpen(false)
                  setToDelete(null)
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: PRINT PREVIEW ─── */}
      {printOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-4 space-y-3 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Printer size={17} className="text-orange-500" />
                <span>Expenses Report Preview</span>
              </h3>
              <button
                onClick={() => setPrintOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-gray-300 h-96">
              <iframe
                ref={frameRef}
                title="expenses-print"
                srcDoc={printHtml}
                className="w-full h-full border-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPrintOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  frameRef.current?.contentWindow?.focus()
                  frameRef.current?.contentWindow?.print()
                }}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
