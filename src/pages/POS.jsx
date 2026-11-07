import { useState, useMemo, useRef } from 'react'
import {
  UtensilsCrossed,
  Search,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  Receipt,
  Flame,
  Clock,
  CheckCircle2,
  Users,
  Grid3X3,
  Bike,
  ShoppingBag,
  Sparkles,
  Printer,
  X,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react'
import useStore from '../store/useStore'
import { buildKotHtml, buildCustomerBillHtml } from '../utils/restaurantReceipt'

export default function POS() {
  const {
    menuItems,
    categories,
    tables,
    posCart,
    setPosOrderType,
    setPosTable,
    updatePosCartMeta,
    addToCart,
    incrementCartItem,
    decrementCartItem,
    removeCartItem,
    clearCart,
    sendKotToKitchen,
    settleAndCheckout,
    settings,
    currentUser,
  } = useStore()

  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [dietaryFilter, setDietaryFilter] = useState('all') // 'all' | 'veg' | 'non-veg'

  // Modifier Modal
  const [selectedDishForModal, setSelectedDishForModal] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [dishCookingNote, setDishCookingNote] = useState('')

  // Receipt Modal (KOT or Customer Bill)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [receiptHtmlContent, setReceiptHtmlContent] = useState('')
  const [receiptTitle, setReceiptTitle] = useState('')
  const printFrameRef = useRef(null)

  // Payment Settlement Modal
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState('')

  // Filtered Menu Items
  const filteredDishes = useMemo(() => {
    return (menuItems || []).filter((dish) => {
      if (activeCategory !== 'All' && dish.category !== activeCategory) {
        return false
      }
      if (dietaryFilter === 'veg' && dish.dietary !== 'veg') return false
      if (dietaryFilter === 'non-veg' && dish.dietary !== 'non-veg') return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = (dish.name || '').toLowerCase().includes(q)
        const matchDesc = (dish.description || '').toLowerCase().includes(q)
        if (!matchName && !matchDesc) return false
      }
      return true
    })
  }, [menuItems, activeCategory, dietaryFilter, searchQuery])

  // Calculation for POS Cart
  const currency = settings.currency || '$'
  const subtotal = useMemo(() => {
    return posCart.items.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 1),
      0
    )
  }, [posCart.items])

  const discountVal = Number(posCart.discount || 0)
  const netSubtotal = Math.max(0, subtotal - discountVal)
  const taxRate = Number(settings.salesTaxPercent || 0) / 100
  const scRate =
    posCart.orderType === 'dine_in'
      ? Number(settings.serviceChargePercent || 0) / 100
      : 0
  const taxVal = netSubtotal * taxRate
  const scVal = netSubtotal * scRate
  const total = netSubtotal + taxVal + scVal + Number(posCart.tip || 0)

  // Handlers for Dish Selection
  const handleDishClick = (dish) => {
    if (!dish.inStock) return
    const hasVariants = Array.isArray(dish.variants) && dish.variants.length > 0
    const hasAddons = Array.isArray(dish.addons) && dish.addons.length > 0

    if (hasVariants || hasAddons) {
      setSelectedDishForModal(dish)
      setSelectedVariant(hasVariants ? dish.variants[0] : null)
      setSelectedAddons([])
      setDishCookingNote('')
    } else {
      addToCart(dish, null, [], '')
    }
  }

  const confirmModalDish = () => {
    if (!selectedDishForModal) return
    addToCart(selectedDishForModal, selectedVariant, selectedAddons, dishCookingNote)
    setSelectedDishForModal(null)
  }

  // Trigger Print from iframe
  const triggerPrint = (html, title) => {
    setReceiptHtmlContent(html)
    setReceiptTitle(title)
    setReceiptModalOpen(true)
  }

  const handlePrintFrame = () => {
    if (printFrameRef.current) {
      printFrameRef.current.contentWindow.focus()
      printFrameRef.current.contentWindow.print()
    }
  }

  // Send KOT Action
  const handleSendKot = () => {
    if (!posCart.items.length) return
    const res = sendKotToKitchen()
    if (res && res.kot) {
      const kotHtml = buildKotHtml({
        kotNumber: res.kot.kotNumber,
        orderType: res.kot.orderType,
        tableName: res.kot.tableName,
        serverName: res.kot.serverName,
        items: res.kot.items,
        notes: res.kot.notes,
      })
      triggerPrint(kotHtml, `Kitchen Ticket #${res.kot.kotNumber}`)
    }
  }

  // Settle Bill Action
  const handleSettleCheckout = () => {
    // If no order in kitchen yet, send KOT first or direct bill
    let targetOrderId = null
    const targetTable = tables.find((t) => t.id === posCart.tableId)
    if (targetTable?.currentOrderId) {
      targetOrderId = targetTable.currentOrderId
    } else {
      const res = sendKotToKitchen()
      if (res) targetOrderId = res.orderId
    }

    if (!targetOrderId) return

    const sale = settleAndCheckout(targetOrderId, paymentMethod)
    setPayModalOpen(false)

    if (sale) {
      const billHtml = buildCustomerBillHtml({
        restaurant: settings,
        orderId: sale.orderNumber,
        orderType: sale.type === 'dine_in' ? 'Dine-In' : sale.type === 'takeaway' ? 'Takeaway' : 'Delivery',
        tableName: sale.tableName,
        serverName: sale.serverName,
        customerName: posCart.customerName,
        customerPhone: posCart.customerPhone,
        items: sale.items,
        subtotal: sale.subtotal,
        discount: sale.discount,
        serviceChargeRate: scRate,
        serviceCharge: sale.serviceCharge,
        taxRate: taxRate,
        tax: sale.tax,
        total: sale.total,
        paymentMethod: paymentMethod,
        currency: currency,
      })
      triggerPrint(billHtml, `Bill #${sale.orderNumber}`)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-4.25rem)] overflow-hidden">
      {/* ─── LEFT: MENU & PRODUCT CATALOG (FLEX-1) ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0d1219] rounded-2xl border border-gray-100 dark:border-white/[0.08] p-3 md:p-4 overflow-hidden">
        {/* Top Controls: Order Type & Floor Table Picker */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/[0.08] shrink-0">
          {/* Order Type Switcher */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-white/[0.06] rounded-xl">
            <button
              onClick={() => setPosOrderType('dine_in')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                posCart.orderType === 'dine_in'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <UtensilsCrossed size={14} />
              <span>Dine-In</span>
            </button>
            <button
              onClick={() => setPosOrderType('takeaway')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                posCart.orderType === 'takeaway'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag size={14} />
              <span>Takeaway</span>
            </button>
            <button
              onClick={() => setPosOrderType('delivery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                posCart.orderType === 'delivery'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Bike size={14} />
              <span>Delivery</span>
            </button>
          </div>

          {/* Dine-In Table Picker & Guest Counter */}
          {posCart.orderType === 'dine_in' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-semibold">
                <Grid3X3 size={15} />
                <span>Table:</span>
                <select
                  value={posCart.tableId}
                  onChange={(e) => setPosTable(e.target.value)}
                  className="bg-transparent font-bold cursor-pointer focus:outline-none dark:text-white"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id} className="dark:bg-slate-900">
                      {t.name} ({t.section}) - {t.status.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest count */}
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-xs font-semibold text-gray-700 dark:text-slate-300">
                <Users size={14} />
                <span>Guests:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={posCart.guestCount || 2}
                  onChange={(e) =>
                    updatePosCartMeta({ guestCount: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-10 text-center bg-transparent font-bold focus:outline-none dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Search Bar & Dietary Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 py-3 shrink-0">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
            />
            <input
              type="text"
              placeholder="Search dishes, burgers, pasta, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] border-none text-sm focus:ring-2 focus:ring-orange-500 dark:text-white placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dietaryFilter === 'all'
                  ? 'bg-gray-800 text-white dark:bg-white dark:text-black'
                  : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietaryFilter('veg')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Veg
            </button>
            <button
              onClick={() => setDietaryFilter('non-veg')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dietaryFilter === 'non-veg'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Non-Veg
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                  : 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dish Grid */}
        <div className="flex-1 overflow-y-auto pr-1 mt-2">
          {filteredDishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UtensilsCrossed size={36} className="text-gray-300 dark:text-slate-600 mb-2" />
              <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
                No culinary dishes found for "{searchQuery || activeCategory}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => handleDishClick(dish)}
                  className={`group relative flex flex-col justify-between rounded-xl p-2.5 bg-gray-50 dark:bg-[#141a22] border border-gray-200/80 dark:border-white/[0.06] hover:border-orange-500/60 dark:hover:border-orange-500/60 transition-all cursor-pointer select-none active:scale-[0.98] ${
                    !dish.inStock ? 'opacity-50 grayscale pointer-events-none' : ''
                  }`}
                >
                  {/* Food Image */}
                  <div className="relative w-full h-28 rounded-lg overflow-hidden bg-gray-200 dark:bg-black/30 mb-2">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Dietary badge */}
                    <span
                      className={`absolute top-2 left-2 w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                        dish.dietary === 'veg'
                          ? 'border-emerald-500 bg-white dark:bg-slate-900'
                          : 'border-rose-500 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          dish.dietary === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                    </span>

                    {/* Prep time */}
                    {dish.prepTime && (
                      <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-medium backdrop-blur-xs">
                        <Clock size={11} />
                        {dish.prepTime}m
                      </span>
                    )}

                    {/* Spicy badge */}
                    {dish.spicyLevel > 0 && (
                      <span className="absolute top-2 right-2 p-1 rounded-md bg-rose-500/90 text-white">
                        <Flame size={12} />
                      </span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-slate-100 line-clamp-1 group-hover:text-orange-500 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {dish.description}
                    </p>
                  </div>

                  {/* Price & Add button */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/60 dark:border-white/[0.05]">
                    <span className="font-extrabold text-sm text-orange-600 dark:text-orange-400">
                      {currency}{Number(dish.price).toFixed(2)}
                    </span>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs"
                      title="Add to order"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT: CART & BILLING PANEL (WIDTH: 360px - 400px) ─── */}
      <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-white dark:bg-[#0d1219] rounded-2xl border border-gray-100 dark:border-white/[0.08] p-3 md:p-4 shrink-0 overflow-hidden">
        {/* Ticket Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.08] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Active Order</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 uppercase">
                {posCart.orderType === 'dine_in' ? posCart.tableName : posCart.orderType}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
              Server: {currentUser?.name || 'Staff'} · {posCart.items.length} items
            </p>
          </div>

          {posCart.items.length > 0 && (
            <button
              onClick={clearCart}
              title="Clear cart"
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Customer Details for Delivery / Takeaway */}
        {posCart.orderType !== 'dine_in' && (
          <div className="py-2.5 px-3 my-2 rounded-xl bg-gray-50 dark:bg-white/[0.04] space-y-1.5 shrink-0 border border-gray-200/60 dark:border-white/[0.06]">
            <input
              type="text"
              placeholder="Guest Name (e.g. John Doe)"
              value={posCart.customerName || ''}
              onChange={(e) => updatePosCartMeta({ customerName: e.target.value })}
              className="w-full bg-transparent text-xs font-semibold dark:text-white focus:outline-none placeholder:text-gray-400"
            />
            <input
              type="tel"
              placeholder="Guest Phone Number"
              value={posCart.customerPhone || ''}
              onChange={(e) => updatePosCartMeta({ customerPhone: e.target.value })}
              className="w-full bg-transparent text-xs dark:text-white focus:outline-none placeholder:text-gray-400 border-t border-gray-200/60 dark:border-white/[0.06] pt-1.5"
            />
            {posCart.orderType === 'delivery' && (
              <textarea
                placeholder="Delivery Address & Instructions"
                rows={2}
                value={posCart.customerAddress || ''}
                onChange={(e) => updatePosCartMeta({ customerAddress: e.target.value })}
                className="w-full bg-transparent text-xs dark:text-white focus:outline-none placeholder:text-gray-400 border-t border-gray-200/60 dark:border-white/[0.06] pt-1.5 resize-none"
              />
            )}
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.06] my-2 pr-1">
          {posCart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 mb-2">
                <UtensilsCrossed size={24} />
              </div>
              <p className="font-semibold text-sm text-gray-800 dark:text-slate-200">
                Cart is Empty
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-[200px] mt-1">
                Select items from the menu catalog on the left to start a ticket.
              </p>
            </div>
          ) : (
            posCart.items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                    {item.name}
                  </p>
                  {item.variant && (
                    <span className="inline-block text-[10px] text-gray-500 dark:text-slate-400">
                      • {item.variant}
                    </span>
                  )}
                  {Array.isArray(item.addons) && item.addons.length > 0 && (
                    <p className="text-[10px] text-orange-600 dark:text-orange-400 leading-tight">
                      + {item.addons.join(', ')}
                    </p>
                  )}
                  {item.note && (
                    <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 italic">
                      Note: "{item.note}"
                    </p>
                  )}
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100 mt-1">
                    {currency}{(Number(item.price) * item.qty).toFixed(2)}
                  </p>
                </div>

                {/* Qty Counter */}
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-lg p-1 shrink-0">
                  <button
                    onClick={() => decrementCartItem(item.id)}
                    className="p-1 rounded text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-5 text-center text-xs font-bold dark:text-white">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => incrementCartItem(item.id)}
                    className="p-1 rounded text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculations / Summary Footer */}
        {posCart.items.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-white/[0.08] space-y-2 shrink-0 text-xs">
            {/* Subtotal */}
            <div className="flex justify-between text-gray-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {currency}{subtotal.toFixed(2)}
              </span>
            </div>

            {/* Discount input */}
            <div className="flex items-center justify-between text-gray-600 dark:text-slate-400">
              <span>Discount ({currency}):</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={posCart.discount || ''}
                onChange={(e) =>
                  updatePosCartMeta({ discount: Math.max(0, Number(e.target.value)) })
                }
                placeholder="0.00"
                className="w-16 text-right px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] font-semibold focus:outline-none dark:text-white"
              />
            </div>

            {/* Service Charge */}
            {scVal > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Service Charge ({(scRate * 100).toFixed(0)}%):</span>
                <span>{currency}{scVal.toFixed(2)}</span>
              </div>
            )}

            {/* Tax */}
            {taxVal > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>VAT / Tax ({(taxRate * 100).toFixed(0)}%):</span>
                <span>{currency}{taxVal.toFixed(2)}</span>
              </div>
            )}

            {/* Grand Total */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/[0.08] text-sm font-extrabold text-gray-900 dark:text-white">
              <span>TOTAL DUE:</span>
              <span className="text-base text-orange-600 dark:text-orange-400 font-black">
                {currency}{total.toFixed(2)}
              </span>
            </div>

            {/* Dual Actions: Send KOT & Settle Bill */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleSendKot}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-xs"
                title="Send ticket to kitchen display & print KOT"
              >
                <ChefHat size={16} />
                <span>Send KOT</span>
              </button>

              <button
                onClick={() => setPayModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-xs"
                title="Collect payment & finalize bill"
              >
                <Receipt size={16} />
                <span>Pay & Bill</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL: DISH VARIANT & MODIFIER CUSTOMIZER ─── */}
      {selectedDishForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="relative h-32 bg-gray-200 dark:bg-black/40">
              <img
                src={selectedDishForModal.imageUrl}
                alt={selectedDishForModal.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDishForModal(null)}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {selectedDishForModal.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {selectedDishForModal.description}
                </p>
              </div>

              {/* Variants */}
              {Array.isArray(selectedDishForModal.variants) &&
                selectedDishForModal.variants.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                      Choose Size / Option:
                    </label>
                    <div className="space-y-1.5">
                      {selectedDishForModal.variants.map((v) => (
                        <label
                          key={v.name}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                            selectedVariant?.name === v.name
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300'
                              : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="dish-variant"
                              checked={selectedVariant?.name === v.name}
                              onChange={() => setSelectedVariant(v)}
                              className="text-orange-500"
                            />
                            <span>{v.name}</span>
                          </div>
                          <span>
                            {v.priceDelta > 0
                              ? `+${currency}${v.priceDelta.toFixed(2)}`
                              : v.priceDelta < 0
                              ? `-${currency}${Math.abs(v.priceDelta).toFixed(2)}`
                              : 'Included'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              {/* Addons */}
              {Array.isArray(selectedDishForModal.addons) &&
                selectedDishForModal.addons.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                      Add Extras / Toppings:
                    </label>
                    <div className="space-y-1.5">
                      {selectedDishForModal.addons.map((a) => {
                        const isChecked = selectedAddons.some((x) => x.name === a.name)
                        return (
                          <label
                            key={a.name}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                              isChecked
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300'
                                : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAddons([...selectedAddons, a])
                                  } else {
                                    setSelectedAddons(
                                      selectedAddons.filter((x) => x.name !== a.name)
                                    )
                                  }
                                }}
                                className="text-orange-500 rounded"
                              />
                              <span>{a.name}</span>
                            </div>
                            <span>+{currency}{Number(a.price).toFixed(2)}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}

              {/* Cooking note */}
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Kitchen Instruction / Note:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra spicy, no onions, gluten free"
                  value={dishCookingNote}
                  onChange={(e) => setDishCookingNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] border-none text-xs dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Add to order action */}
              <div className="pt-2">
                <button
                  onClick={confirmModalDish}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all"
                >
                  Confirm & Add to Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: PAYMENT CHECKOUT ─── */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Receipt className="text-orange-500" size={20} />
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Settle Bill
                </h3>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center py-2 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-white/[0.06]">
              <p className="text-xs text-gray-500 dark:text-slate-400">Total Amount</p>
              <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                {currency}{total.toFixed(2)}
              </p>
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Payment Method:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  <Banknote size={20} className="mb-1" />
                  <span>Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard size={20} className="mb-1" />
                  <span>Card / POS</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('digital')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === 'digital'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  <QrCode size={20} className="mb-1" />
                  <span>Digital / QR</span>
                </button>
              </div>
            </div>

            {/* Change Calculator if Cash */}
            {paymentMethod === 'cash' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                  Cash Given by Guest:
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="e.g. 50, 100"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] border-none text-sm font-bold dark:text-white"
                />
                {Number(cashReceived) >= total && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                    Change to Return: {currency}{(Number(cashReceived) - total).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleSettleCheckout}
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              <span>Complete Payment & Print Invoice</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: PRINT PREVIEW (KOT & GUEST BILL) ─── */}
      {receiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121820] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl p-4 space-y-3 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Printer className="text-orange-500" size={18} />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {receiptTitle || 'Thermal Print Preview'}
                </h3>
              </div>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-gray-300 shadow-inner h-96">
              <iframe
                ref={printFrameRef}
                title="receipt-frame"
                srcDoc={receiptHtmlContent}
                className="w-full h-full border-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/[0.04]"
              >
                Close
              </button>
              <button
                onClick={handlePrintFrame}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
              >
                <Printer size={15} />
                <span>Print Thermal Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
