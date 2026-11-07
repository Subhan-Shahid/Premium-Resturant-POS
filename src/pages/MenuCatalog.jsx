import { useState, useMemo } from 'react'
import {
  BookOpen,
  Plus,
  Search,
  Flame,
  Clock,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  UtensilsCrossed,
  X
} from 'lucide-react'
import useStore from '../store/useStore'

export default function MenuCatalog() {
  const {
    menuItems,
    categories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleDishStock,
    settings,
  } = useStore()

  const currency = settings.currency || '$'
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Add / Edit Dish Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDishId, setEditingDishId] = useState(null)

  // Form fields
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Main Course')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [prepTime, setPrepTime] = useState(15)
  const [dietary, setDietary] = useState('veg')
  const [spicyLevel, setSpicyLevel] = useState(0)
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return menuItems.filter((dish) => {
      if (activeCategory !== 'All' && dish.category !== activeCategory) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = (dish.name || '').toLowerCase().includes(q)
        const matchDesc = (dish.description || '').toLowerCase().includes(q)
        if (!matchName && !matchDesc) return false
      }
      return true
    })
  }, [menuItems, activeCategory, searchQuery])

  // Open modal for new dish
  const handleOpenAdd = () => {
    setEditingDishId(null)
    setName('')
    setCategory(categories[1] || 'Main Course')
    setPrice('')
    setCost('')
    setPrepTime(15)
    setDietary('veg')
    setSpicyLevel(0)
    setDescription('')
    setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80')
    setModalOpen(true)
  }

  // Open modal for editing
  const handleOpenEdit = (dish) => {
    setEditingDishId(dish.id)
    setName(dish.name)
    setCategory(dish.category)
    setPrice(dish.price)
    setCost(dish.cost || '')
    setPrepTime(dish.prepTime || 15)
    setDietary(dish.dietary || 'veg')
    setSpicyLevel(dish.spicyLevel || 0)
    setDescription(dish.description || '')
    setImageUrl(dish.imageUrl || '')
    setModalOpen(true)
  }

  // Save dish
  const handleSaveDish = (e) => {
    e.preventDefault()
    if (!name.trim() || !price) return

    const dishPayload = {
      name: name.trim(),
      category,
      price: Number(price),
      cost: Number(cost) || 0,
      prepTime: Number(prepTime) || 10,
      dietary,
      spicyLevel: Number(spicyLevel) || 0,
      description: description.trim(),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
    }

    if (editingDishId) {
      updateMenuItem(editingDishId, dishPayload)
    } else {
      addMenuItem(dishPayload)
    }

    setModalOpen(false)
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0d1219] p-4 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
            <BookOpen size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
              Food & Menu Catalog
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Manage dishes, prices, prep times, and availability
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
        >
          <Plus size={16} />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* ─── SEARCH & CATEGORY FILTERS ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#0d1219] border border-gray-200/80 dark:border-white/[0.08] text-xs font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0d1219] text-gray-600 dark:text-slate-400 border border-gray-200/80 dark:border-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── DISH CARDS GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDishes.map((dish) => {
          const margin = dish.cost ? Math.round(((dish.price - dish.cost) / dish.price) * 100) : 0
          return (
            <div
              key={dish.id}
              className={`flex flex-col justify-between rounded-2xl bg-white dark:bg-[#0d1219] border transition-all p-3.5 ${
                !dish.inStock
                  ? 'opacity-60 border-gray-200 dark:border-white/[0.04]'
                  : 'border-gray-200/80 dark:border-white/[0.08] hover:border-orange-500/40 shadow-xs'
              }`}
            >
              <div>
                {/* Photo & Badge */}
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 dark:bg-black/30 mb-3">
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Dietary */}
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      dish.dietary === 'veg'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {dish.dietary}
                  </span>

                  {/* Stock Status Pill */}
                  <span
                    className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      dish.inStock
                        ? 'bg-emerald-950/80 text-emerald-300 backdrop-blur-xs'
                        : 'bg-rose-950/80 text-rose-300 backdrop-blur-xs'
                    }`}
                  >
                    {dish.inStock ? 'In Stock' : '86’d (Sold Out)'}
                  </span>

                  {dish.prepTime && (
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold backdrop-blur-xs">
                      <Clock size={11} />
                      {dish.prepTime} min
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    {dish.category}
                  </span>
                  {dish.spicyLevel > 0 && (
                    <span className="flex items-center text-rose-500 text-xs font-bold">
                      <Flame size={13} />
                      {'🌶️'.repeat(dish.spicyLevel)}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mt-0.5 leading-snug">
                  {dish.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {dish.description}
                </p>

                {/* Price & Food Cost */}
                <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                  <div>
                    <span className="text-base font-black text-gray-900 dark:text-white">
                      {currency}{Number(dish.price).toFixed(2)}
                    </span>
                    {dish.cost > 0 && (
                      <span className="text-[11px] text-gray-400 dark:text-slate-500 ml-1.5">
                        (Cost: {currency}{Number(dish.cost).toFixed(2)})
                      </span>
                    )}
                  </div>
                  {margin > 0 && (
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {margin}% margin
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                {/* Stock Toggle */}
                <button
                  onClick={() => toggleDishStock(dish.id)}
                  className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                    dish.inStock
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-400 dark:text-slate-500'
                  }`}
                  title="Toggle In Stock / 86'd"
                >
                  {dish.inStock ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  <span>{dish.inStock ? 'Available' : 'Unavailable'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(dish)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                    title="Edit dish"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteMenuItem(dish.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    title="Delete dish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── MODAL: ADD / EDIT DISH ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveDish}
            className="w-full max-w-lg bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <UtensilsCrossed className="text-orange-500" size={18} />
                <span>{editingDishId ? 'Edit Dish' : 'Add New Culinary Dish'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Dish Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Truffle Mushroom Risotto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Category:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] border-none text-xs font-bold dark:text-white focus:ring-2 focus:ring-orange-500"
                >
                  {categories
                    .filter((c) => c !== 'All')
                    .map((cat) => (
                      <option key={cat} value={cat} className="dark:bg-slate-900">
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Dietary Type:
                </label>
                <select
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] border-none text-xs font-bold dark:text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="veg" className="dark:bg-slate-900">Vegetarian 🥗</option>
                  <option value="non-veg" className="dark:bg-slate-900">Non-Vegetarian 🥩</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Selling Price ({currency}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="14.50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Raw Food Cost ({currency}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="4.20"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Avg Prep Time (Minutes):
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Spiciness Level (0-3):
                </label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={spicyLevel}
                  onChange={(e) => setSpicyLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Photo URL:
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-semibold dark:text-white border-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                  Description & Ingredients:
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe dish ingredients and presentation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-semibold dark:text-white border-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
              >
                Save Dish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

