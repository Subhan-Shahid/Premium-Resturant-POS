import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from '../utils/nanoid'
import { verifyPassword, hashPassword } from '../utils/security'

// Initial Seed Menu Items
const initialMenuItems = [
  {
    id: 'dish-1',
    name: 'Truffle Mushroom Bruschetta',
    category: 'Starters',
    price: 12.50,
    cost: 4.20,
    prepTime: 10,
    dietary: 'veg',
    spicyLevel: 0,
    popular: true,
    inStock: true,
    description: 'Crispy sourdough topped with sautéed wild mushrooms, white truffle oil and fresh herbs.',
    imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=500&q=80',
    variants: [
      { name: 'Standard (3 pcs)', priceDelta: 0 },
      { name: 'Sharing Platter (6 pcs)', priceDelta: 8.00 },
    ],
    addons: [
      { name: 'Extra Truffle Glaze', price: 2.00 },
      { name: 'Shaved Parmesan', price: 1.50 },
    ],
  },
  {
    id: 'dish-2',
    name: 'Crispy Calamari Fritti',
    category: 'Starters',
    price: 14.00,
    cost: 5.50,
    prepTime: 12,
    dietary: 'non-veg',
    spicyLevel: 1,
    popular: true,
    inStock: true,
    description: 'Tender golden squid rings served with garlic aioli and fresh lemon wedges.',
    imageUrl: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=500&q=80',
    variants: [],
    addons: [{ name: 'Extra Garlic Aioli', price: 1.50 }],
  },
  {
    id: 'dish-3',
    name: 'Spicy Buffalo Wings',
    category: 'Starters',
    price: 13.00,
    cost: 4.80,
    prepTime: 15,
    dietary: 'non-veg',
    spicyLevel: 3,
    popular: false,
    inStock: true,
    description: 'Crispy fried chicken wings tossed in fiery house hot sauce with blue cheese dip.',
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=500&q=80',
    variants: [
      { name: '6 Wings', priceDelta: 0 },
      { name: '12 Wings', priceDelta: 9.00 },
    ],
    addons: [{ name: 'Extra Blue Cheese Dip', price: 1.50 }],
  },
  {
    id: 'dish-4',
    name: 'Margherita Burrata Pizza',
    category: 'Pizza & Pasta',
    price: 18.00,
    cost: 5.00,
    prepTime: 15,
    dietary: 'veg',
    spicyLevel: 0,
    popular: true,
    inStock: true,
    description: 'San Marzano tomato base, creamy whole burrata, fresh basil, and extra virgin olive oil.',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
    variants: [
      { name: '10 inch Personal', priceDelta: -3.00 },
      { name: '12 inch Regular', priceDelta: 0 },
      { name: '16 inch Large', priceDelta: 6.00 },
    ],
    addons: [
      { name: 'Extra Mozzarella', price: 2.50 },
      { name: 'Add Prosciutto', price: 4.00 },
      { name: 'Hot Honey Drizzle', price: 1.50 },
    ],
  },
  {
    id: 'dish-5',
    name: 'Spicy Diavola Pepperoni Pizza',
    category: 'Pizza & Pasta',
    price: 19.50,
    cost: 6.20,
    prepTime: 15,
    dietary: 'non-veg',
    spicyLevel: 2,
    popular: true,
    inStock: true,
    description: 'Spicy Italian pepperoni, fior di latte mozzarella, crushed chili flakes, and oregano.',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80',
    variants: [
      { name: '12 inch Regular', priceDelta: 0 },
      { name: '16 inch Large', priceDelta: 6.00 },
    ],
    addons: [{ name: 'Extra Pepperoni', price: 3.00 }, { name: 'Jalapeños', price: 1.50 }],
  },
  {
    id: 'dish-6',
    name: 'Handcrafted Fettuccine Alfredo',
    category: 'Pizza & Pasta',
    price: 17.50,
    cost: 4.90,
    prepTime: 14,
    dietary: 'veg',
    spicyLevel: 0,
    popular: false,
    inStock: true,
    description: 'Fresh egg pasta ribbon tossed in rich butter, heavy cream, and 24-month aged Parmigiano.',
    imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=500&q=80',
    variants: [],
    addons: [
      { name: 'Add Grilled Chicken', price: 4.50 },
      { name: 'Add Tiger Prawns', price: 6.00 },
    ],
  },
  {
    id: 'dish-7',
    name: 'Angus Smash Burger',
    category: 'Burgers & Wraps',
    price: 16.00,
    cost: 5.80,
    prepTime: 12,
    dietary: 'non-veg',
    spicyLevel: 1,
    popular: true,
    inStock: true,
    description: 'Double Angus beef smash patties, melted cheddar, caramelized onions, pickles & secret sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
    variants: [
      { name: 'Double Patty', priceDelta: 0 },
      { name: 'Triple Monster Patty', priceDelta: 4.50 },
    ],
    addons: [
      { name: 'Crispy Bacon', price: 2.50 },
      { name: 'Upgrade to Truffle Fries', price: 3.00 },
    ],
  },
  {
    id: 'dish-8',
    name: 'Grilled Ribeye Steak (300g)',
    category: 'Main Course',
    price: 32.00,
    cost: 13.50,
    prepTime: 22,
    dietary: 'non-veg',
    spicyLevel: 0,
    popular: true,
    inStock: true,
    description: 'Prime grain-fed ribeye steak grilled to order, served with rosemary roasted potatoes and peppercorn jus.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
    variants: [
      { name: 'Medium Rare', priceDelta: 0 },
      { name: 'Medium', priceDelta: 0 },
      { name: 'Medium Well', priceDelta: 0 },
    ],
    addons: [{ name: 'Garlic Butter Prawns topper', price: 7.00 }, { name: 'Mushroom Sauce', price: 2.50 }],
  },
  {
    id: 'dish-9',
    name: 'Pan-Seared Atlantic Salmon',
    category: 'Main Course',
    price: 26.00,
    cost: 9.80,
    prepTime: 18,
    dietary: 'non-veg',
    spicyLevel: 0,
    popular: false,
    inStock: true,
    description: 'Crispy skin salmon fillet over saffron risotto, asparagus spears, and lemon caper butter.',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80',
    variants: [],
    addons: [],
  },
  {
    id: 'dish-10',
    name: 'Traditional Tiramisu',
    category: 'Desserts',
    price: 9.00,
    cost: 2.80,
    prepTime: 5,
    dietary: 'veg',
    spicyLevel: 0,
    popular: true,
    inStock: true,
    description: 'Espresso-soaked savoiardi ladyfingers layered with velvety mascarpone and cocoa powder.',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=80',
    variants: [],
    addons: [{ name: 'Add Vanilla Gelato Scoop', price: 2.50 }],
  },
  {
    id: 'dish-11',
    name: 'Molten Belgian Chocolate Lava Cake',
    category: 'Desserts',
    price: 10.50,
    cost: 3.20,
    prepTime: 12,
    dietary: 'veg',
    spicyLevel: 0,
    popular: true,
    inStock: true,
    description: 'Warm chocolate cake with a molten chocolate center, served with Madagascan vanilla ice cream.',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
    variants: [],
    addons: [{ name: 'Extra Ice Cream Scoop', price: 2.50 }],
  },
  {
    id: 'dish-12',
    name: 'Signature Berry Mojito',
    category: 'Beverages',
    price: 6.50,
    cost: 1.60,
    prepTime: 4,
    dietary: 'veg',
    spicyLevel: 0,
    popular: true,
    inStock: true,
    description: 'Fresh crushed blackberries, mint leaves, fresh lime, raw sugar, and sparkling soda.',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=80',
    variants: [
      { name: 'Mocktail (Non-alcoholic)', priceDelta: 0 },
      { name: 'Cocktail (+ Rum)', priceDelta: 4.50 },
    ],
    addons: [],
  },
  {
    id: 'dish-13',
    name: 'Artisan Iced Caramel Latte',
    category: 'Beverages',
    price: 5.50,
    cost: 1.20,
    prepTime: 4,
    dietary: 'veg',
    spicyLevel: 0,
    popular: false,
    inStock: true,
    description: 'Double espresso pulled fresh over whole milk, salted caramel syrup, and cold foam.',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=500&q=80',
    variants: [
      { name: 'Oat Milk Sub', priceDelta: 0.80 },
      { name: 'Almond Milk Sub', priceDelta: 0.80 },
    ],
    addons: [{ name: 'Extra Espresso Shot', price: 1.50 }],
  },
]

// Seed Tables (all available and clean)
const initialTables = [
  { id: 't-1', name: 'Table 1', section: 'Ground Floor', capacity: 2, status: 'available', currentOrderId: null, serverName: null },
  { id: 't-2', name: 'Table 2', section: 'Ground Floor', capacity: 4, status: 'available', currentOrderId: null, serverName: null },
  { id: 't-3', name: 'Table 3', section: 'Ground Floor', capacity: 4, status: 'available', currentOrderId: null, serverName: null },
  { id: 't-4', name: 'Table 4', section: 'Ground Floor', capacity: 6, status: 'available', currentOrderId: null, serverName: null },
  { id: 't-5', name: 'Table 5', section: 'Ground Floor', capacity: 2, status: 'available', currentOrderId: null, serverName: null },
  { id: 't-6', name: 'Table 6', section: '1st Floor (Terrace)', capacity: 4, status: 'available', currentOrderId: null, serverName: null },
  { id: 't-7', name: 'Table 7', section: '1st Floor (Terrace)', capacity: 4, status: 'available', currentOrderId: null, serverName: null },
  { id: 't-8', name: 'Table 8', section: '1st Floor (Terrace)', capacity: 8, status: 'available', currentOrderId: null, serverName: null },
  { id: 'vip-1', name: 'VIP Suite 1', section: 'VIP Lounge', capacity: 10, status: 'available', currentOrderId: null, serverName: null },
]

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
          orders: [],
          kots: [],
          sales: [],
          reservations: [],
          expenses: [],
          tables: initialTables.map((t) => ({ ...t, status: 'available', currentOrderId: null, serverName: null })),
          posCart: {
            items: [],
            tableId: 't-1',
            tableName: 'Table 1',
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
      name: 'restaurant-management-storage-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useStore
