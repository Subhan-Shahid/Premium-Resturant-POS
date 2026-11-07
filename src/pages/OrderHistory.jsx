import { useState, useRef, useMemo } from 'react'
import {
  Receipt,
  Search,
  Calendar,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  X
} from 'lucide-react'
import useStore from '../store/useStore'
import { buildCustomerBillHtml } from '../utils/restaurantReceipt'

export default function OrderHistory() {
  const { sales, settings } = useStore()
  const currency = settings.currency || '$'

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'dine_in' | 'takeaway' | 'delivery'

  // Print Preview
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [receiptHtml, setReceiptHtml] = useState('')
  const [activeBillNumber, setActiveBillNumber] = useState('')
  const printFrameRef = useRef(null)

  const filteredSales = useMemo(() => {
    return (sales || []).filter((s) => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchNum = String(s.orderNumber || '').toLowerCase().includes(q)
        const matchTable = String(s.tableName || '').toLowerCase().includes(q)
        const matchServer = String(s.serverName || '').toLowerCase().includes(q)
        const matchCustomer = String(s.customerName || '').toLowerCase().includes(q)
        if (!matchNum && !matchTable && !matchServer && !matchCustomer) return false
      }
      return true
    })
  }, [sales, typeFilter, search])

  // Summary Metrics
  const totalRevenue = filteredSales.reduce((acc, s) => acc + Number(s.total || 0), 0)
  const cashTotal = filteredSales
    .filter((s) => s.paymentMethod === 'cash')
    .reduce((acc, s) => acc + Number(s.total || 0), 0)
  const cardTotal = filteredSales
    .filter((s) => s.paymentMethod === 'card')
    .reduce((acc, s) => acc + Number(s.total || 0), 0)
  const digitalTotal = filteredSales
    .filter((s) => s.paymentMethod === 'digital' || s.paymentMethod === 'online')
    .reduce((acc, s) => acc + Number(s.total || 0), 0)

  const handlePrintBill = (sale) => {
    const html = buildCustomerBillHtml({
      restaurant: settings,
      orderId: sale.orderNumber,
      orderType: sale.type === 'dine_in' ? 'Dine-In' : sale.type === 'takeaway' ? 'Takeaway' : 'Delivery',
      tableName: sale.tableName,
      serverName: sale.serverName,
      customerName: sale.customerName,
      dateTime: new Date(sale.date).toLocaleString(),
      items: sale.items || [],
      subtotal: sale.subtotal,
      discount: sale.discount,
      serviceChargeRate: (settings.serviceChargePercent || 10) / 100,
      serviceCharge: sale.serviceCharge,
      taxRate: (settings.salesTaxPercent || 8) / 100,
      tax: sale.tax,
      total: sale.total,
      paymentMethod: sale.paymentMethod || 'Cash',
      currency: currency,
    })
    setReceiptHtml(html)
    setActiveBillNumber(sale.orderNumber)
    setPrintModalOpen(true)
  }

  const printFrame = () => {
    if (printFrameRef.current) {
      printFrameRef.current.contentWindow.focus()
      printFrameRef.current.contentWindow.print()
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0d1219] p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <Receipt size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
              Order & Dining Bill History
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Audit settled customer receipts, reprint invoices & check payment channels
            </p>
          </div>
        </div>
      </div>

      {/* ─── METRIC CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Total Billed</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {currency}{totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Cash Payments</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {currency}{cashTotal.toFixed(2)}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-blue-500">Card / Terminal</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {currency}{cardTotal.toFixed(2)}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-purple-500">Digital / Online</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {currency}{digitalTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* ─── FILTER ROW ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Bill #, table, guest, or server..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#0d1219] border border-gray-200/80 dark:border-white/[0.08] text-xs font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              typeFilter === 'all'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white dark:bg-[#0d1219] text-gray-600 dark:text-slate-400 border border-gray-200/80 dark:border-white/[0.08]'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setTypeFilter('dine_in')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              typeFilter === 'dine_in'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white dark:bg-[#0d1219] text-gray-600 dark:text-slate-400 border border-gray-200/80 dark:border-white/[0.08]'
            }`}
          >
            Dine-In
          </button>
          <button
            onClick={() => setTypeFilter('takeaway')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              typeFilter === 'takeaway'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white dark:bg-[#0d1219] text-gray-600 dark:text-slate-400 border border-gray-200/80 dark:border-white/[0.08]'
            }`}
          >
            Takeaway
          </button>
          <button
            onClick={() => setTypeFilter('delivery')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              typeFilter === 'delivery'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white dark:bg-[#0d1219] text-gray-600 dark:text-slate-400 border border-gray-200/80 dark:border-white/[0.08]'
            }`}
          >
            Delivery
          </button>
        </div>
      </div>

      {/* ─── SALES LIST ─── */}
      <div className="bg-white dark:bg-[#0d1219] rounded-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center text-gray-400 dark:text-slate-500">
            <Receipt size={36} className="mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-sm">No settled bills found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-gray-900 dark:text-white">
                      Bill #{sale.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-slate-300">
                      {sale.tableName}
                    </span>
                    <span className="capitalize text-[11px] font-bold text-orange-600 dark:text-orange-400">
                      • {sale.type?.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Server: {sale.serverName || 'Staff'} · {new Date(sale.date).toLocaleString()}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(sale.items || []).map((it, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.04] text-gray-700 dark:text-slate-300"
                      >
                        {it.qty}x {it.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                  <div className="text-right">
                    <p className="text-base font-black text-gray-900 dark:text-white">
                      {currency}{Number(sale.total).toFixed(2)}
                    </p>
                    <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-slate-400">
                      Paid via {sale.paymentMethod || 'Cash'}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePrintBill(sale)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-bold text-gray-800 dark:text-white transition-colors"
                    title="Reprint receipt"
                  >
                    <Printer size={15} />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── MODAL: REPRINT BILL ─── */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-4 space-y-3 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Printer size={17} className="text-orange-500" />
                <span>Invoice #{activeBillNumber}</span>
              </h3>
              <button
                onClick={() => setPrintModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-gray-300 h-96">
              <iframe
                ref={printFrameRef}
                title="print-bill-frame"
                srcDoc={receiptHtml}
                className="w-full h-full border-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPrintModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={printFrame}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

