import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from '../utils/nanoid'
import { verifyPassword, hashPassword } from '../utils/security'

// Initial Seed Menu Items (empty for production)
const initialMenuItems = []

// Initial Tables (empty for production)
const initialTables = []

// Seed Orders & KOTs - empty for production
const initialOrders = []
const initialKots = []
const initialReservations = []
const initialIngredients = []
const initialSales = []

const initialStaff = [
  { id: 'st-1', name: 'Marco Rossi', role: 'Manager' },
  { id: 'st-2', name: 'Sofia Chen', role: 'Head Waiter' },
  { id: 'st-3', name: 'Liam Murphy', role: 'Cashier' },
  { id: 'st-4', name: 'Chef Giovanni', role: 'Executive Chef' },
]

const DEFAULT_SEED_USERS = [
  { id: 'usr-1', username: 'admin', password: 'admin123', role: 'Admin', name: 'Marco Rossi' },
  { id: 'usr-2', username: 'cashier', password: 'cashier123', role: 'Cashier', name: 'Liam Murphy' },
  { id: 'usr-3', username: 'waiter', password: 'waiter123', role: 'Waiter', name: 'Sofia Chen' },
  { id: 'usr-4', username: 'kitchen', password: 'kitchen123', role: 'Chef', name: 'Chef Giovanni' },
]

export const useStore = create(
  persist(
    (set, get) => ({
      // UI & Branding
      ui: {
        darkMode: true,
        sidebarOpen: true,
        activeFloor: 'Ground Floor',
      },
      settings: {
        companyName: 'Bella Vista Bistro',
        tagline: 'Artisanal Italian & Gourmet Grill',
        phone: '+1 (555) 382-9012',
        address: '450 Gourmet Avenue, Suite 10, Downtown',
        currency: '$',
        salesTaxPercent: 8,
        serviceChargePercent: 10,
        logoDataUrl: '',
        wifiPassword: 'bellavistaguest',
        gstNumber: 'GST-US-99214A',
      },

      // Auth & Current User
      currentUser: {
        id: 'usr-1',
        username: 'admin',
        role: 'Admin',
        name: 'Marco Rossi',
      },
      users: DEFAULT_SEED_USERS,
      staff: initialStaff,

      // Restaurant Data
      categories: [
        'All',
        'Starters',
        'Pizza & Pasta',
        'Main Course',
        'Burgers & Wraps',
        'Desserts',
        'Beverages',
      ],
      menuItems: initialMenuItems,
      tables: initialTables,
      orders: initialOrders,
      kots: initialKots,
      reservations: initialReservations,
      inventory: initialIngredients,
      sales: initialSales,
      expenses: [],

      // Active POS Cart
      posCart: {
        items: [],
        tableId: 't-1',
        tableName: 'Table 1',
        orderType: 'dine_in', // 'dine_in' | 'takeaway' | 'delivery'
        guestCount: 2,
        serverName: 'Marco Rossi',
        customerName: 'Walk-in Guest',
        customerPhone: '',
        customerAddress: '',
        discount: 0,
        tip: 0,
        notes: '',
      },

      // Storage & Persistence
      cloudSyncStatus: 'local',
      lastSyncTime: new Date().toISOString(),
      setCloudSyncStatus: (status) => set({ cloudSyncStatus: status }),

      // UI Actions
      toggleDarkMode: () =>
        set((state) => ({ ui: { ...state.ui, darkMode: !state.ui.darkMode } })),
      toggleSidebar: () =>
        set((state) => ({ ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } })),
      setActiveFloor: (floor) =>
        set((state) => ({ ui: { ...state.ui, activeFloor: floor } })),

      // Auth Actions
      login: async (username, plainPassword) => {
        let users = get().users
        if (!Array.isArray(users) || users.length === 0) {
          users = DEFAULT_SEED_USERS
          set({ users: DEFAULT_SEED_USERS })
        }

        const inputUser = String(username || '').trim().toLowerCase()
        const inputPass = String(plainPassword || '')

        // 1. First check against in-state users
        let u = users.find(
          (x) => String(x.username || '').toLowerCase() === inputUser
        )

        // 2. Fallback to default seed credentials if user was missing or reset
        if (!u) {
          u = DEFAULT_SEED_USERS.find(
            (x) => String(x.username || '').toLowerCase() === inputUser
          )
        }

        if (u) {
          const isValid = await verifyPassword(inputPass, u.password)
          if (isValid) {
            set({ currentUser: u })
            return { success: true, user: u }
          }
        }
        return { success: false, message: 'Invalid username or password' }
      },
      logout: () => set({ currentUser: null }),

      // Settings
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      // ==================== POS CART ACTIONS ====================
      setPosOrderType: (orderType) =>
        set((state) => ({
          posCart: { ...state.posCart, orderType },
        })),

      setPosTable: (tableId) => {
        const table = get().tables.find((t) => t.id === tableId)
        if (!table) return
        set((state) => ({
          posCart: {
            ...state.posCart,
            tableId: table.id,
            tableName: table.name,
            guestCount: table.capacity || 2,
          },
        }))
      },

      updatePosCartMeta: (metaUpdates) =>
        set((state) => ({
          posCart: { ...state.posCart, ...metaUpdates },
        })),

      addToCart: (dish, selectedVariant = null, selectedAddons = [], note = '') => {
        set((state) => {
          let itemPrice = Number(dish.price || 0)
          if (selectedVariant) {
            itemPrice += Number(selectedVariant.priceDelta || 0)
          }
          if (Array.isArray(selectedAddons)) {
            selectedAddons.forEach((addon) => {
              itemPrice += Number(addon.price || 0)
            })
          }

          // Check if same item with identical variant and addons already in cart
          const existingIdx = state.posCart.items.findIndex(
            (i) =>
              i.menuItemId === dish.id &&
              i.variant === (selectedVariant?.name || '') &&
              JSON.stringify(i.addons || []) === JSON.stringify(selectedAddons.map((a) => a.name)) &&
              i.note === note
          )

          if (existingIdx > -1) {
            const updatedItems = [...state.posCart.items]
            updatedItems[existingIdx].qty += 1
            return { posCart: { ...state.posCart, items: updatedItems } }
          }

          const newItem = {
            id: nanoid(),
            menuItemId: dish.id,
            name: dish.name,
            price: itemPrice,
            qty: 1,
            variant: selectedVariant?.name || '',
            addons: selectedAddons.map((a) => a.name),
            note: note || '',
          }

          return { posCart: { ...state.posCart, items: [...state.posCart.items, newItem] } }
        })
      },

      incrementCartItem: (cartItemId) =>
        set((state) => ({
          posCart: {
            ...state.posCart,
            items: state.posCart.items.map((i) =>
              i.id === cartItemId ? { ...i, qty: i.qty + 1 } : i
            ),
          },
        })),

      decrementCartItem: (cartItemId) =>
        set((state) => ({
          posCart: {
            ...state.posCart,
            items: state.posCart.items
              .map((i) => (i.id === cartItemId ? { ...i, qty: i.qty - 1 } : i))
              .filter((i) => i.qty > 0),
          },
        })),

      removeCartItem: (cartItemId) =>
        set((state) => ({
          posCart: {
            ...state.posCart,
            items: state.posCart.items.filter((i) => i.id !== cartItemId),
          },
        })),

      clearCart: () =>
        set((state) => ({
          posCart: {
            ...state.posCart,
            items: [],
            discount: 0,
            tip: 0,
            notes: '',
          },
        })),

      // Load an existing occupied table's order into POS cart
      loadTableOrderToCart: (tableId) => {
        const state = get()
        const table = state.tables.find((t) => t.id === tableId)
        if (!table || !table.currentOrderId) return false

        const order = state.orders.find((o) => o.id === table.currentOrderId)
        if (!order) return false

        set({
          posCart: {
            items: order.items || [],
            tableId: table.id,
            tableName: table.name,
            orderType: order.type || 'dine_in',
            guestCount: order.guestCount || 2,
            serverName: order.serverName || state.currentUser?.name || 'Staff',
            customerName: order.customerName || 'Walk-in Guest',
            customerPhone: order.customerPhone || '',
            customerAddress: order.customerAddress || '',
            discount: order.discount || 0,
            tip: order.tip || 0,
            notes: order.notes || '',
          },
        })
        return true
      },

      // ==================== ORDER & KOT DISPATCH ====================
      sendKotToKitchen: () => {
        const state = get()
        const { posCart, tables, orders, kots, settings } = state
        if (!posCart.items.length) return null

        const subtotal = posCart.items.reduce(
          (acc, i) => acc + Number(i.price || 0) * Number(i.qty || 1),
          0
        )
        const taxPercent = Number(settings.salesTaxPercent || 0) / 100
        const scPercent =
          posCart.orderType === 'dine_in'
            ? Number(settings.serviceChargePercent || 0) / 100
            : 0

        const discountVal = Number(posCart.discount || 0)
        const netSubtotal = Math.max(0, subtotal - discountVal)
        const taxVal = netSubtotal * taxPercent
        const scVal = netSubtotal * scPercent
        const total = netSubtotal + taxVal + scVal + Number(posCart.tip || 0)

        const kotNum = `KOT-${Math.floor(100 + Math.random() * 900)}`
        const orderNum = Math.floor(100 + Math.random() * 900).toString()

        // Check if updating existing open table order
        const targetTable = tables.find((t) => t.id === posCart.tableId)
        const existingOrderId = targetTable?.currentOrderId

        let orderId = existingOrderId || nanoid()

        const newKot = {
          id: nanoid(),
          kotNumber: kotNum,
          orderId: orderId,
          tableId: posCart.tableId,
          tableName: posCart.tableName,
          orderType: posCart.orderType === 'dine_in' ? 'Dine-In' : posCart.orderType === 'takeaway' ? 'Takeaway' : 'Delivery',
          serverName: posCart.serverName || state.currentUser?.name || 'Staff',
          status: 'cooking',
          createdAt: new Date().toISOString(),
          items: JSON.parse(JSON.stringify(posCart.items)),
          notes: posCart.notes || '',
        }

        let updatedOrders = [...orders]
        if (existingOrderId) {
          updatedOrders = updatedOrders.map((o) => {
            if (o.id === existingOrderId) {
              return {
                ...o,
                items: [...o.items, ...posCart.items],
                subtotal: o.subtotal + subtotal,
                tax: (o.subtotal + subtotal) * taxPercent,
                serviceCharge: (o.subtotal + subtotal) * scPercent,
                total: o.total + total,
                status: 'preparing',
              }
            }
            return o
          })
        } else {
          const newOrder = {
            id: orderId,
            orderNumber: orderNum,
            type: posCart.orderType,
            tableId: posCart.tableId,
            tableName: posCart.tableName,
            guestCount: posCart.guestCount,
            serverName: posCart.serverName || state.currentUser?.name || 'Staff',
            customerName: posCart.customerName,
            customerPhone: posCart.customerPhone,
            customerAddress: posCart.customerAddress,
            status: 'preparing',
            createdAt: new Date().toISOString(),
            items: JSON.parse(JSON.stringify(posCart.items)),
            subtotal,
            discount: discountVal,
            tax: taxVal,
            serviceCharge: scVal,
            total,
            paymentMethod: null,
          }
          updatedOrders.unshift(newOrder)
        }

        // Update table status to occupied if dine-in
        let updatedTables = [...tables]
        if (posCart.orderType === 'dine_in' && posCart.tableId) {
          updatedTables = updatedTables.map((t) =>
            t.id === posCart.tableId
              ? { ...t, status: 'occupied', currentOrderId: orderId, serverName: posCart.serverName }
              : t
          )
        }

        set({
          orders: updatedOrders,
          kots: [newKot, ...kots],
          tables: updatedTables,
          posCart: {
            ...posCart,
            items: [],
            discount: 0,
            tip: 0,
            notes: '',
          },
        })

        return { orderId, kot: newKot }
      },

      // Complete / Checkout order
      settleAndCheckout: (orderId, paymentMethod = 'cash') => {
        const state = get()
        const order = state.orders.find((o) => o.id === orderId)
        if (!order) return null

        const completedSale = {
          id: nanoid(),
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: order.type,
          tableName: order.tableName,
          serverName: order.serverName,
          customerName: order.customerName,
          items: order.items,
          subtotal: order.subtotal,
          discount: order.discount,
          tax: order.tax,
          serviceCharge: order.serviceCharge,
          total: order.total,
          paymentMethod,
          date: new Date().toISOString(),
        }

        // Free up table if dine in
        const updatedTables = state.tables.map((t) =>
          t.currentOrderId === orderId
            ? { ...t, status: 'available', currentOrderId: null, serverName: null }
            : t
        )

        // Mark order as completed
        const updatedOrders = state.orders.filter((o) => o.id !== orderId)

        set({
          orders: updatedOrders,
          tables: updatedTables,
          sales: [completedSale, ...state.sales],
        })

        return completedSale
      },

      // Update KOT status in Kitchen Display System
      updateKotStatus: (kotId, newStatus) =>
        set((state) => ({
          kots: state.kots.map((k) => (k.id === kotId ? { ...k, status: newStatus } : k)),
        })),

      // Update Table Status
      updateTableStatus: (tableId, status) =>
        set((state) => ({
          tables: state.tables.map((t) => (t.id === tableId ? { ...t, status } : t)),
        })),

      // Change or Transfer Table
      transferTable: (fromTableId, toTableId) => {
        const state = get()
        const fromTable = state.tables.find((t) => t.id === fromTableId)
        const toTable = state.tables.find((t) => t.id === toTableId)
        if (!fromTable || !toTable || !fromTable.currentOrderId) return false

        const orderId = fromTable.currentOrderId

        const updatedOrders = state.orders.map((o) =>
          o.id === orderId ? { ...o, tableId: toTable.id, tableName: toTable.name } : o
        )
        const updatedKots = state.kots.map((k) =>
          k.orderId === orderId ? { ...k, tableId: toTable.id, tableName: toTable.name } : k
        )
        const updatedTables = state.tables.map((t) => {
          if (t.id === fromTableId) return { ...t, status: 'available', currentOrderId: null, serverName: null }
          if (t.id === toTableId) return { ...t, status: 'occupied', currentOrderId: orderId, serverName: fromTable.serverName }
          return t
        })

        set({
          orders: updatedOrders,
          kots: updatedKots,
          tables: updatedTables,
        })
        return true
      },

      // ==================== TABLES ACTIONS ====================
      addTable: (table) =>
        set((state) => ({
          tables: [
            ...state.tables,
            {
              id: nanoid(),
              status: 'available',
              currentOrderId: null,
              serverName: null,
              ...table,
            },
          ],
        })),

      deleteTable: (tableId) =>
        set((state) => ({
          tables: state.tables.filter((t) => t.id !== tableId),
        })),

      // ==================== MENU ITEMS ACTIONS ====================
      addMenuItem: (dish) =>
        set((state) => ({
          menuItems: [{ id: nanoid(), inStock: true, ...dish }, ...state.menuItems],
        })),

      updateMenuItem: (id, updates) =>
        set((state) => ({
          menuItems: state.menuItems.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      deleteMenuItem: (id) =>
        set((state) => ({
          menuItems: state.menuItems.filter((m) => m.id !== id),
        })),

      toggleDishStock: (id) =>
        set((state) => ({
          menuItems: state.menuItems.map((m) =>
            m.id === id ? { ...m, inStock: !m.inStock } : m
          ),
        })),

      // ==================== RESERVATIONS ACTIONS ====================
      addReservation: (res) =>
        set((state) => ({
          reservations: [{ id: nanoid(), status: 'confirmed', ...res }, ...state.reservations],
        })),

      updateReservation: (id, updates) =>
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      cancelReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, status: 'cancelled' } : r
          ),
        })),

      seatReservation: (reservationId) => {
        const state = get()
        const res = state.reservations.find((r) => r.id === reservationId)
        if (!res) return

        let updatedTables = state.tables
        if (res.tableId) {
          updatedTables = state.tables.map((t) =>
            t.id === res.tableId ? { ...t, status: 'occupied' } : t
          )
        }

        set({
          reservations: state.reservations.map((r) =>
            r.id === reservationId ? { ...r, status: 'seated' } : r
          ),
          tables: updatedTables,
        })
      },

      // ==================== INVENTORY / INGREDIENTS ====================
      addIngredient: (ing) =>
        set((state) => ({
          inventory: [{ id: nanoid(), ...ing }, ...state.inventory],
        })),

      updateIngredientStock: (id, newStock) =>
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === id ? { ...item, currentStock: Number(newStock) } : item
          ),
        })),

      logIngredientWastage: (id, wastedQty, reason) => {
        set((state) => {
          const updated = state.inventory.map((item) =>
            item.id === id
              ? { ...item, currentStock: Math.max(0, item.currentStock - Number(wastedQty)) }
              : item
          )
          return {
            inventory: updated,
            expenses: [
              {
                id: nanoid(),
                title: `Food Wastage: ${wastedQty} units (${reason || 'Damaged/Expired'})`,
                category: 'Wastage',
                amount: 15.0,
                date: new Date().toISOString().slice(0, 10),
                paidBy: 'Stock Loss',
              },
              ...state.expenses,
            ],
          }
        })
      },

      // ==================== USERS & STAFF ====================
      addUser: async (user) => {
        const hashedPassword = user.password ? await hashPassword(user.password) : ''
        set((state) => ({
          users: [
            ...state.users,
            { id: nanoid(), name: user.name || user.username, ...user, password: hashedPassword },
          ],
        }))
      },

      updateUser: async (id, updates) => {
        let finalUpdates = { ...updates }
        if (updates.password) {
          finalUpdates.password = await hashPassword(updates.password)
        }
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...finalUpdates } : u)),
        }))
      },

      removeUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),

      // ==================== EXPENSES ====================
      addExpense: (exp) =>
        set((state) => ({
          expenses: [{ id: nanoid(), ...exp }, ...state.expenses],
        })),

      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      // Reset testing data utility
      clearTestData: () =>
        set({
          menuItems: [],
          tables: [],
          orders: [],
          kots: [],
          sales: [],
          reservations: [],
          inventory: [],
          expenses: [],
          posCart: {
            items: [],
            tableId: null,
            tableName: '',
            orderType: 'dine_in',
            guestCount: 2,
            serverName: 'Admin',
            customerName: 'Walk-in Guest',
            customerPhone: '',
            customerAddress: '',
            discount: 0,
            tip: 0,
            notes: '',
          },
        }),
    }),
    {
      name: 'restaurant-management-storage-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useStore
