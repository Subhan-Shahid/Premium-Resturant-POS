import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid3X3,
  Users,
  Plus,
  Clock,
  ArrowRightLeft,
  CheckCircle,
  UtensilsCrossed,
  Receipt,
  Sparkles,
  Trash2,
  X
} from 'lucide-react'
import useStore from '../store/useStore'

export default function Tables() {
  const navigate = useNavigate()
  const {
    tables,
    orders,
    ui,
    setActiveFloor,
    setPosTable,
    loadTableOrderToCart,
    transferTable,
    updateTableStatus,
    addTable,
    deleteTable,
    settings,
  } = useStore()

  const activeFloor = ui.activeFloor || 'All'
  const currency = settings.currency || '$'

  // Modal for transferring table
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [sourceTable, setSourceTable] = useState(null)
  const [targetTableId, setTargetTableId] = useState('')

  // Modal for adding a new table
  const [addTableOpen, setAddTableOpen] = useState(false)
  const [newTableName, setNewTableName] = useState('')
  const [newTableSection, setNewTableSection] = useState('Ground Floor')
  const [newTableCapacity, setNewTableCapacity] = useState(4)

  // Unique sections list
  const sections = useMemo(() => {
    const list = Array.from(new Set(tables.map((t) => t.section)))
    return ['All', ...list]
  }, [tables])

  // Filtered tables by section
  const filteredTables = useMemo(() => {
    if (activeFloor === 'All') return tables
    return tables.filter((t) => t.section === activeFloor)
  }, [tables, activeFloor])

  // Aggregate stats
  const totalCount = tables.length
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length
  const availableCount = tables.filter((t) => t.status === 'available').length
  const reservedCount = tables.filter((t) => t.status === 'reserved').length
  const occupancyRate = totalCount ? Math.round((occupiedCount / totalCount) * 100) : 0

  // Open POS with this table
  const handleOpenPosForTable = (table) => {
    setPosTable(table.id)
    if (table.currentOrderId) {
      loadTableOrderToCart(table.id)
    }
    navigate('/pos')
  }

  // Open Transfer Modal
  const openTransfer = (table) => {
    setSourceTable(table)
    const availableTargets = tables.filter(
      (t) => t.id !== table.id && t.status === 'available'
    )
    if (availableTargets.length) {
      setTargetTableId(availableTargets[0].id)
    }
    setTransferModalOpen(true)
  }

  const handleConfirmTransfer = () => {
    if (sourceTable && targetTableId) {
      transferTable(sourceTable.id, targetTableId)
      setTransferModalOpen(false)
      setSourceTable(null)
    }
  }

  // Add Table
  const handleAddTable = (e) => {
    e.preventDefault()
    if (!newTableName.trim()) return
    addTable({
      name: newTableName.trim(),
      section: newTableSection.trim() || 'Main Floor',
      capacity: Number(newTableCapacity) || 4,
    })
    setNewTableName('')
    setAddTableOpen(false)
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* ─── TOP METRICS BAR ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] shadow-xs">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Total Tables</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{totalCount}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Available</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {availableCount}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] shadow-xs">
          <p className="text-xs font-semibold text-rose-500">Occupied (Dining)</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {occupiedCount}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08] shadow-xs">
          <p className="text-xs font-semibold text-amber-500">Occupancy Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-500">{occupancyRate}%</span>
            <span className="text-[11px] text-gray-400">({reservedCount} reserved)</span>
          </div>
        </div>
      </div>

      {/* ─── SECTION CONTROLS & ADD TABLE ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0d1219] p-3 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveFloor(sec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFloor === sec
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                  : 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAddTableOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black font-bold text-xs shadow-xs hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          <span>Add New Table</span>
        </button>
      </div>

      {/* ─── TABLES GRID ─── */}
      {filteredTables.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#0d1219] rounded-2xl border border-gray-100 dark:border-white/[0.08] p-8">
          <Grid3X3 className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">No tables found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            You don't have any tables configured for this section yet. Click "Add New Table" above to create your restaurant layout.
          </p>
          <button
            onClick={() => setAddTableOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
          >
            <Plus size={15} />
            <span>Create Table</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const activeOrder = orders.find((o) => o.id === table.currentOrderId)
          const isOccupied = table.status === 'occupied'
          const isReserved = table.status === 'reserved'
          const isAvailable = table.status === 'available'

          return (
            <div
              key={table.id}
              className={`flex flex-col justify-between rounded-2xl p-4 bg-white dark:bg-[#0d1219] border transition-all ${
                isOccupied
                  ? 'border-rose-500/50 shadow-md shadow-rose-500/5'
                  : isReserved
                  ? 'border-amber-500/50'
                  : 'border-gray-200/80 dark:border-white/[0.08] hover:border-orange-500/50'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                      {table.section}
                    </span>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                      {table.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isOccupied
                          ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 animate-pulse'
                          : isReserved
                          ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {table.status}
                    </span>
                    {!isOccupied && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm(`Delete ${table.name}?`)) {
                            deleteTable(table.id)
                          }
                        }}
                        title="Delete table"
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Capacity & Server */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{table.capacity} Seats</span>
                  </span>
                  {table.serverName && (
                    <span>• Server: <strong className="text-gray-700 dark:text-slate-300">{table.serverName}</strong></span>
                  )}
                </div>

                {/* Occupied Order Info */}
                {isOccupied && activeOrder && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50/60 dark:bg-rose-500/5 border border-rose-200/50 dark:border-rose-500/10 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-rose-700 dark:text-rose-400 font-semibold">
                        Order #{activeOrder.orderNumber}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {currency}{Number(activeOrder.total).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                      {activeOrder.items?.length || 0} dishes ordered
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center gap-2">
                <button
                  onClick={() => handleOpenPosForTable(table)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <UtensilsCrossed size={14} />
                  <span>{isOccupied ? 'View / Add Items' : 'Start Order'}</span>
                </button>

                {isOccupied && (
                  <button
                    onClick={() => openTransfer(table)}
                    title="Transfer order to another table"
                    className="p-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors"
                  >
                    <ArrowRightLeft size={15} />
                  </button>
                )}

                {isReserved && (
                  <button
                    onClick={() => updateTableStatus(table.id, 'available')}
                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    title="Mark available"
                  >
                    <CheckCircle size={15} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
        </div>
      )}

      {/* ─── MODAL: TRANSFER TABLE ─── */}
      {transferModalOpen && sourceTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="text-orange-500" size={17} />
                <span>Transfer {sourceTable.name}</span>
              </h3>
              <button
                onClick={() => setTransferModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400">
              Select an available table to transfer the active order and KOT tickets.
            </p>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Move To Available Table:
              </label>
              <select
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] border-none text-xs font-bold dark:text-white"
              >
                {tables
                  .filter((t) => t.id !== sourceTable.id && t.status === 'available')
                  .map((t) => (
                    <option key={t.id} value={t.id} className="dark:bg-slate-900">
                      {t.name} ({t.section}) - {t.capacity} seats
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTransferModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD TABLE ─── */}
      {addTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddTable}
            className="w-full max-w-sm bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-5 space-y-4 animate-scale-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Grid3X3 className="text-orange-500" size={17} />
                <span>Create New Table</span>
              </h3>
              <button
                type="button"
                onClick={() => setAddTableOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Table Name / Number:
              </label>
              <input
                type="text"
                placeholder="e.g. Table 10, Rooftop 3"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Floor Section:
              </label>
              <input
                type="text"
                placeholder="e.g. Ground Floor, Terrace, VIP"
                value={newTableSection}
                onChange={(e) => setNewTableSection(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Seating Capacity:
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={newTableCapacity}
                onChange={(e) => setNewTableCapacity(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddTableOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
              >
                Add Table
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

