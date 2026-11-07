import { useState, useMemo } from 'react'
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  RotateCcw,
  TrendingDown,
  Trash2,
  DollarSign,
  X
} from 'lucide-react'
import useStore from '../store/useStore'

export default function Inventory() {
  const {
    inventory,
    addIngredient,
    updateIngredientStock,
    logIngredientWastage,
    settings,
  } = useStore()

  const currency = settings.currency || '$'
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [restockModalOpen, setRestockModalOpen] = useState(false)
  const [wastageModalOpen, setWastageModalOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(null)

  // Add Item Fields
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Dairy')
  const [currentStock, setCurrentStock] = useState('')
  const [minStock, setMinStock] = useState('')
  const [unit, setUnit] = useState('kg')
  const [costPerUnit, setCostPerUnit] = useState('')
  const [supplier, setSupplier] = useState('')

  // Restock / Wastage Fields
  const [deltaQty, setDeltaQty] = useState('')
  const [wastageReason, setWastageReason] = useState('Expired / Spoiled')

  const categories = useMemo(() => {
    const set = new Set(inventory.map((i) => i.category))
    return ['All', ...Array.from(set)]
  }, [inventory])

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchName = (item.name || '').toLowerCase().includes(q)
        const matchSupplier = (item.supplier || '').toLowerCase().includes(q)
        if (!matchName && !matchSupplier) return false
      }
      return true
    })
  }, [inventory, selectedCategory, search])

  // Total inventory asset value
  const totalAssetValue = inventory.reduce(
    (acc, i) => acc + Number(i.currentStock || 0) * Number(i.costPerUnit || 0),
    0
  )
  const lowStockCount = inventory.filter(
    (i) => Number(i.currentStock) <= Number(i.minStock)
  ).length

  // Add Ingredient
  const handleAddIngredient = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    addIngredient({
      name: name.trim(),
      category,
      currentStock: Number(currentStock) || 0,
      minStock: Number(minStock) || 5,
      unit,
      costPerUnit: Number(costPerUnit) || 0,
      supplier: supplier.trim() || 'General Vendor',
    })

    setName('')
    setCurrentStock('')
    setMinStock('')
    setCostPerUnit('')
    setSupplier('')
    setAddModalOpen(false)
  }

  // Restock
  const handleConfirmRestock = () => {
    if (!activeItem || !deltaQty) return
    const newStock = Number(activeItem.currentStock) + Number(deltaQty)
    updateIngredientStock(activeItem.id, newStock)
    setRestockModalOpen(false)
    setActiveItem(null)
    setDeltaQty('')
  }

  // Log Wastage
  const handleConfirmWastage = () => {
    if (!activeItem || !deltaQty) return
    logIngredientWastage(activeItem.id, deltaQty, wastageReason)
    setWastageModalOpen(false)
    setActiveItem(null)
    setDeltaQty('')
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0d1219] p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Package size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
              Raw Ingredients & Kitchen Stock
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Track raw food supplies, minimum stock thresholds & food wastage
            </p>
          </div>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
        >
          <Plus size={16} />
          <span>Add Raw Material</span>
        </button>
      </div>

      {/* ─── SUMMARY CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Total Ingredients</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {inventory.length}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-rose-500">Low Stock Alert</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {lowStockCount}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Stock Valuation</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {currency}{totalAssetValue.toFixed(2)}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d1219] border border-gray-100 dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Categories</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {categories.length - 1}
          </p>
        </div>
      </div>

      {/* ─── FILTERS & SEARCH ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search raw ingredients, beef, flour, cheese, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#0d1219] border border-gray-200/80 dark:border-white/[0.08] text-xs font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0d1219] text-gray-600 dark:text-slate-400 border border-gray-200/80 dark:border-white/[0.08]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ─── INVENTORY TABLE ─── */}
      <div className="bg-white dark:bg-[#0d1219] rounded-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/[0.08] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Ingredient Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Unit Cost</th>
                <th className="py-3 px-4 text-center">Total Value</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Stock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {filteredItems.map((item) => {
                const isLow = Number(item.currentStock) <= Number(item.minStock)
                const val = Number(item.currentStock) * Number(item.costPerUnit || 0)
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      {isLow && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                          <AlertTriangle size={12} /> Low Stock (Threshold: {item.minStock} {item.unit})
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-600 dark:text-slate-400">
                      {item.category}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                          isLow
                            ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {item.currentStock} {item.unit}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-gray-800 dark:text-slate-200">
                      {currency}{Number(item.costPerUnit).toFixed(2)} / {item.unit}
                    </td>

                    <td className="py-3.5 px-4 text-center font-extrabold text-gray-900 dark:text-white">
                      {currency}{val.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 dark:text-slate-400 font-medium">
                      {item.supplier || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setActiveItem(item)
                            setRestockModalOpen(true)
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 font-bold text-[11px] transition-colors"
                        >
                          + Restock
                        </button>
                        <button
                          onClick={() => {
                            setActiveItem(item)
                            setWastageModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Log Food Wastage / Spoilage"
                        >
                          <TrendingDown size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL: ADD RAW MATERIAL ─── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddIngredient}
            className="w-full max-w-md bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-5 space-y-3 animate-scale-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="text-orange-500" size={18} />
                <span>Add Kitchen Raw Material</span>
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Item Name:
              </label>
              <input
                type="text"
                placeholder="e.g. Fresh Mozzarella Cheese"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Category:
                </label>
                <input
                  type="text"
                  placeholder="Dairy, Meat, Produce, etc."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Measurement Unit:
                </label>
                <input
                  type="text"
                  placeholder="kg, pcs, liters, cans"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Initial Stock:
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="10"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Min Alert Stock:
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="3"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Cost per Unit ({currency}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="8.50"
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Supplier / Vendor:
                </label>
                <input
                  type="text"
                  placeholder="MilkyWay Farms"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
              >
                Save Material
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: RESTOCK ─── */}
      {restockModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Restock {activeItem.name}
              </h3>
              <button
                onClick={() => setRestockModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400">
              Current stock: <strong>{activeItem.currentStock} {activeItem.unit}</strong>
            </p>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Add Quantity ({activeItem.unit}):
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 10"
                value={deltaQty}
                onChange={(e) => setDeltaQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-sm font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRestockModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestock}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
              >
                Add to Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: LOG WASTAGE ─── */}
      {wastageModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white text-rose-600">
                Record Food Spoilage / Wastage
              </h3>
              <button
                onClick={() => setWastageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400">
              Item: <strong>{activeItem.name}</strong> ({activeItem.currentStock} {activeItem.unit} in stock)
            </p>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Wasted Quantity ({activeItem.unit}):
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 2.5"
                value={deltaQty}
                onChange={(e) => setDeltaQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-sm font-bold dark:text-white border-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                Reason for Loss:
              </label>
              <input
                type="text"
                placeholder="Expired, burnt during cooking, prep spillage..."
                value={wastageReason}
                onChange={(e) => setWastageReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-semibold dark:text-white border-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setWastageModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWastage}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Confirm Loss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
