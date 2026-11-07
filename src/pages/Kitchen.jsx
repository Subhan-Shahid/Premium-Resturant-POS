import { useState, useEffect, useRef } from 'react'
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  UtensilsCrossed,
  Filter,
  CheckCheck
} from 'lucide-react'
import useStore from '../store/useStore'
import { buildKotHtml } from '../utils/restaurantReceipt'

export default function Kitchen() {
  const { kots, updateKotStatus } = useStore()
  const [filterStatus, setFilterStatus] = useState('active') // 'active' | 'cooking' | 'ready' | 'all'
  const [now, setNow] = useState(Date.now())

  // Thermal reprint preview
  const [reprintModalOpen, setReprintModalOpen] = useState(false)
  const [reprintHtml, setReprintHtml] = useState('')
  const printFrameRef = useRef(null)

  // Update elapsed timer tick every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000)
    return () => clearInterval(timer)
  }, [])

  // Filter tickets
  const filteredKots = kots.filter((k) => {
    if (filterStatus === 'active') return k.status === 'cooking' || k.status === 'pending'
    if (filterStatus === 'cooking') return k.status === 'cooking'
    if (filterStatus === 'ready') return k.status === 'ready'
    return true // 'all'
  })

  // Elapsed time helper
  const getElapsedMinutes = (createdAt) => {
    const diffMs = now - new Date(createdAt).getTime()
    return Math.max(0, Math.floor(diffMs / 60000))
  }

  // Handle reprint
  const handleReprintKot = (kot) => {
    const html = buildKotHtml({
      kotNumber: kot.kotNumber,
      orderType: kot.orderType,
      tableName: kot.tableName,
      serverName: kot.serverName,
      items: kot.items,
      notes: kot.notes,
      timestamp: new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reprint: true,
    })
    setReprintHtml(html)
    setReprintModalOpen(true)
  }

  const printFrame = () => {
    if (printFrameRef.current) {
      printFrameRef.current.contentWindow.focus()
      printFrameRef.current.contentWindow.print()
    }
  }

  const activeCount = kots.filter((k) => k.status === 'cooking' || k.status === 'pending').length
  const readyCount = kots.filter((k) => k.status === 'ready').length

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* ─── KDS HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0d1219] p-3.5 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <ChefHat size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
              Kitchen Display System (KDS)
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Real-time ticket dispatch & preparation status
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-white/[0.06] rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'active'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            Active In Prep ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('ready')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'ready'
                ? 'bg-emerald-500 text-white font-bold shadow-xs'
                : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            Ready to Serve ({readyCount})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'all'
                ? 'bg-gray-800 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            All Tickets ({kots.length})
          </button>
        </div>
      </div>

      {/* ─── LIVE TICKETS BOARD ─── */}
      {filteredKots.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-[#0d1219] rounded-2xl border border-gray-100 dark:border-white/[0.08]">
          <CheckCheck size={42} className="text-emerald-500 mb-2" />
          <h2 className="text-base font-bold text-gray-800 dark:text-slate-200">
            All Caught Up!
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm">
            There are no pending tickets for the selected filter. Any incoming order from POS will instantly appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredKots.map((kot) => {
            const mins = getElapsedMinutes(kot.createdAt)
            const isCooking = kot.status === 'cooking' || kot.status === 'pending'
            const isReady = kot.status === 'ready'
            const isServed = kot.status === 'served'

            // Color status based on urgency
            let urgencyBorder = 'border-amber-500/40'
            let urgencyTimerBg = 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'
            if (mins >= 20) {
              urgencyBorder = 'border-rose-500 ring-2 ring-rose-500/20 animate-pulse'
              urgencyTimerBg = 'bg-rose-500 text-white font-black'
            } else if (mins < 10) {
              urgencyBorder = 'border-emerald-500/40'
              urgencyTimerBg = 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
            }

            return (
              <div
                key={kot.id}
                className={`flex flex-col justify-between rounded-2xl bg-white dark:bg-[#0d1219] border ${urgencyBorder} p-4 shadow-sm transition-all`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/[0.08]">
                    <div>
                      <span className="font-mono text-xs font-black text-gray-900 dark:text-white">
                        {kot.kotNumber}
                      </span>
                      <h3 className="text-sm font-black text-orange-600 dark:text-orange-400 mt-0.5">
                        {kot.orderType} · {kot.tableName}
                      </h3>
                    </div>

                    {/* Timer Pill */}
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${urgencyTimerBg}`}
                    >
                      <Clock size={13} />
                      <span>{mins}m ago</span>
                    </div>
                  </div>

                  {/* Server & Notes */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 py-1.5">
                    <span>Server: <strong className="text-gray-700 dark:text-slate-200">{kot.serverName}</strong></span>
                    <span>{new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {kot.notes && (
                    <div className="p-2 mb-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold">
                      ⚠️ Note: {kot.notes}
                    </div>
                  )}

                  {/* Line Items List */}
                  <div className="divide-y divide-gray-100 dark:divide-white/[0.06] my-2">
                    {kot.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-start gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center font-black text-sm text-gray-900 dark:text-white shrink-0">
                          {item.qty}x
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-slate-100 leading-tight">
                            {item.name}
                          </p>
                          {item.variant && (
                            <span className="text-[10px] text-gray-500 dark:text-slate-400">
                              • {item.variant}
                            </span>
                          )}
                          {Array.isArray(item.addons) && item.addons.length > 0 && (
                            <p className="text-[10px] text-orange-600 dark:text-orange-400">
                              + {item.addons.join(', ')}
                            </p>
                          )}
                          {item.note && (
                            <p className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded inline-block mt-0.5">
                              "{item.note}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Actions */}
                <div className="pt-3 border-t border-gray-100 dark:border-white/[0.08] flex items-center gap-2">
                  <button
                    onClick={() => handleReprintKot(kot)}
                    title="Reprint KOT"
                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors"
                  >
                    <Printer size={15} />
                  </button>

                  {isCooking && (
                    <button
                      onClick={() => updateKotStatus(kot.id, 'ready')}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <CheckCircle2 size={15} />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => updateKotStatus(kot.id, 'served')}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <CheckCheck size={15} />
                      <span>Mark Served</span>
                    </button>
                  )}

                  {isServed && (
                    <span className="flex-1 text-center py-2 text-xs font-bold text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/[0.04] rounded-xl">
                      Served ✓
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── MODAL: REPRINT PREVIEW ─── */}
      {reprintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-4 space-y-3 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Printer size={17} className="text-orange-500" />
                <span>Reprint Kitchen Ticket</span>
              </h3>
              <button
                onClick={() => setReprintModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-gray-300 h-80">
              <iframe
                ref={printFrameRef}
                title="reprint-frame"
                srcDoc={reprintHtml}
                className="w-full h-full border-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setReprintModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={printFrame}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

