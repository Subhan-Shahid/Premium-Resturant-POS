/**
 * Supabase Database Service Layer
 * All DB read/write operations go through here.
 * The app always updates local Zustand state first (instant UI),
 * then syncs to Supabase in the background.
 */
import { supabase } from './supabase'

// ─── Helpers ─────────────────────────────────────────────────
const log = (msg, err) => {
  if (err) console.error(`[DB] ${msg}`, err)
}

// ─── SETTINGS ────────────────────────────────────────────────
export const dbGetSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single()
  if (error) { log('getSettings', error); return null }
  return {
    companyName: data.company_name,
    tagline: data.tagline,
    phone: data.phone,
    address: data.address,
    currency: data.currency,
    salesTaxPercent: data.sales_tax_percent,
    serviceChargePercent: data.service_charge_percent,
    logoDataUrl: data.logo_data_url,
    wifiPassword: data.wifi_password,
    gstNumber: data.gst_number,
  }
}

export const dbUpsertSettings = async (s) => {
  const { error } = await supabase.from('settings').upsert({
    id: '00000000-0000-0000-0000-000000000001',
    company_name: s.companyName,
    tagline: s.tagline,
    phone: s.phone,
    address: s.address,
    currency: s.currency,
    sales_tax_percent: s.salesTaxPercent,
    service_charge_percent: s.serviceChargePercent,
    logo_data_url: s.logoDataUrl,
    wifi_password: s.wifiPassword,
    gst_number: s.gstNumber,
    updated_at: new Date().toISOString(),
  })
  if (error) log('upsertSettings', error)
}

// ─── USERS ───────────────────────────────────────────────────
export const dbGetUsers = async () => {
  const { data, error } = await supabase.from('users').select('*')
  if (error) { log('getUsers', error); return null }
  return data.map(u => ({
    id: u.id, username: u.username, password: u.password,
    role: u.role, name: u.name,
  }))
}

export const dbUpsertUser = async (user) => {
  const { error } = await supabase.from('users').upsert({
    id: user.id, username: user.username, password: user.password,
    role: user.role, name: user.name,
  })
  if (error) log('upsertUser', error)
}

export const dbDeleteUser = async (id) => {
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) log('deleteUser', error)
}

// ─── RESTAURANT TABLES ───────────────────────────────────────
export const dbGetTables = async () => {
  const { data, error } = await supabase.from('restaurant_tables').select('*').order('created_at')
  if (error) { log('getTables', error); return null }
  return data.map(t => ({
    id: t.id, name: t.name, section: t.section, capacity: t.capacity,
    status: t.status, currentOrderId: t.current_order_id, serverName: t.server_name,
  }))
}

export const dbUpsertTable = async (table) => {
  const { error } = await supabase.from('restaurant_tables').upsert({
    id: table.id, name: table.name, section: table.section,
    capacity: table.capacity, status: table.status,
    current_order_id: table.currentOrderId || null,
    server_name: table.serverName || null,
  })
  if (error) log('upsertTable', error)
}

export const dbDeleteTable = async (id) => {
  const { error } = await supabase.from('restaurant_tables').delete().eq('id', id)
  if (error) log('deleteTable', error)
}

export const dbUpdateTableStatus = async (id, status, currentOrderId = null, serverName = null) => {
  const { error } = await supabase.from('restaurant_tables').update({
    status,
    current_order_id: currentOrderId,
    server_name: serverName,
  }).eq('id', id)
  if (error) log('updateTableStatus', error)
}

// ─── MENU ITEMS ──────────────────────────────────────────────
export const dbGetMenuItems = async () => {
  const { data, error } = await supabase.from('menu_items').select('*').order('created_at')
  if (error) { log('getMenuItems', error); return null }
  return data.map(m => ({
    id: m.id, name: m.name, category: m.category, price: m.price,
    cost: m.cost, prepTime: m.prep_time, dietary: m.dietary,
    spicyLevel: m.spicy_level, popular: m.popular, inStock: m.in_stock,
    description: m.description, imageUrl: m.image_url,
    variants: m.variants || [], addons: m.addons || [],
  }))
}

export const dbUpsertMenuItem = async (item) => {
  const { error } = await supabase.from('menu_items').upsert({
    id: item.id, name: item.name, category: item.category,
    price: item.price, cost: item.cost || 0, prep_time: item.prepTime || 10,
    dietary: item.dietary || 'veg', spicy_level: item.spicyLevel || 0,
    popular: item.popular || false, in_stock: item.inStock !== false,
    description: item.description || '', image_url: item.imageUrl || '',
    variants: item.variants || [], addons: item.addons || [],
  })
  if (error) log('upsertMenuItem', error)
}

export const dbDeleteMenuItem = async (id) => {
  const { error } = await supabase.from('menu_items').delete().eq('id', id)
  if (error) log('deleteMenuItem', error)
}

// ─── ORDERS ──────────────────────────────────────────────────
export const dbGetOrders = async () => {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) { log('getOrders', error); return null }
  return data.map(o => ({
    id: o.id, orderNumber: o.order_number, type: o.type,
    tableId: o.table_id, tableName: o.table_name,
    guestCount: o.guest_count, serverName: o.server_name,
    customerName: o.customer_name, customerPhone: o.customer_phone,
    customerAddress: o.customer_address, status: o.status,
    items: o.items || [], subtotal: o.subtotal, discount: o.discount,
    tax: o.tax, serviceCharge: o.service_charge, tip: o.tip,
    total: o.total, paymentMethod: o.payment_method,
    createdAt: o.created_at,
  }))
}

export const dbUpsertOrder = async (order) => {
  const { error } = await supabase.from('orders').upsert({
    id: order.id, order_number: order.orderNumber, type: order.type,
    table_id: order.tableId, table_name: order.tableName,
    guest_count: order.guestCount, server_name: order.serverName,
    customer_name: order.customerName, customer_phone: order.customerPhone,
    customer_address: order.customerAddress, status: order.status,
    items: order.items, subtotal: order.subtotal, discount: order.discount,
    tax: order.tax, service_charge: order.serviceCharge, tip: order.tip || 0,
    total: order.total, payment_method: order.paymentMethod,
    created_at: order.createdAt,
  })
  if (error) log('upsertOrder', error)
}

export const dbDeleteOrder = async (id) => {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) log('deleteOrder', error)
}

// ─── KOTS ────────────────────────────────────────────────────
export const dbGetKots = async () => {
  const { data, error } = await supabase.from('kots').select('*').order('created_at', { ascending: false })
  if (error) { log('getKots', error); return null }
  return data.map(k => ({
    id: k.id, kotNumber: k.kot_number, orderId: k.order_id,
    tableId: k.table_id, tableName: k.table_name,
    orderType: k.order_type, serverName: k.server_name, status: k.status,
    items: k.items || [], notes: k.notes, createdAt: k.created_at,
  }))
}

export const dbUpsertKot = async (kot) => {
  const { error } = await supabase.from('kots').upsert({
    id: kot.id, kot_number: kot.kotNumber, order_id: kot.orderId,
    table_id: kot.tableId, table_name: kot.tableName,
    order_type: kot.orderType, server_name: kot.serverName,
    status: kot.status, items: kot.items, notes: kot.notes || '',
    created_at: kot.createdAt,
  })
  if (error) log('upsertKot', error)
}

export const dbUpdateKotStatus = async (id, status) => {
  const { error } = await supabase.from('kots').update({ status }).eq('id', id)
  if (error) log('updateKotStatus', error)
}

// ─── RESERVATIONS ────────────────────────────────────────────
export const dbGetReservations = async () => {
  const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false })
  if (error) { log('getReservations', error); return null }
  return data.map(r => ({
    id: r.id, guestName: r.guest_name, phone: r.phone,
    partySize: r.party_size, date: r.date, time: r.time,
    tableId: r.table_id, tableName: r.table_name,
    specialRequest: r.special_request, status: r.status,
  }))
}

export const dbUpsertReservation = async (res) => {
  const { error } = await supabase.from('reservations').upsert({
    id: res.id, guest_name: res.guestName, phone: res.phone,
    party_size: res.partySize, date: res.date, time: res.time,
    table_id: res.tableId, table_name: res.tableName,
    special_request: res.specialRequest, status: res.status,
  })
  if (error) log('upsertReservation', error)
}

export const dbDeleteReservation = async (id) => {
  const { error } = await supabase.from('reservations').delete().eq('id', id)
  if (error) log('deleteReservation', error)
}

// ─── INVENTORY ───────────────────────────────────────────────
export const dbGetInventory = async () => {
  const { data, error } = await supabase.from('inventory').select('*').order('created_at')
  if (error) { log('getInventory', error); return null }
  return data.map(i => ({
    id: i.id, name: i.name, category: i.category,
    currentStock: i.current_stock, minStock: i.min_stock,
    unit: i.unit, costPerUnit: i.cost_per_unit, supplier: i.supplier,
  }))
}

export const dbUpsertIngredient = async (ing) => {
  const { error } = await supabase.from('inventory').upsert({
    id: ing.id, name: ing.name, category: ing.category,
    current_stock: ing.currentStock, min_stock: ing.minStock,
    unit: ing.unit, cost_per_unit: ing.costPerUnit, supplier: ing.supplier,
  })
  if (error) log('upsertIngredient', error)
}

export const dbDeleteIngredient = async (id) => {
  const { error } = await supabase.from('inventory').delete().eq('id', id)
  if (error) log('deleteIngredient', error)
}

// ─── SALES ───────────────────────────────────────────────────
export const dbGetSales = async () => {
  const { data, error } = await supabase.from('sales').select('*').order('date', { ascending: false })
  if (error) { log('getSales', error); return null }
  return data.map(s => ({
    id: s.id, orderId: s.order_id, orderNumber: s.order_number,
    type: s.type, tableName: s.table_name, serverName: s.server_name,
    customerName: s.customer_name, items: s.items || [],
    subtotal: s.subtotal, discount: s.discount, tax: s.tax,
    serviceCharge: s.service_charge, total: s.total,
    paymentMethod: s.payment_method, date: s.date,
  }))
}

export const dbInsertSale = async (sale) => {
  const { error } = await supabase.from('sales').insert({
    id: sale.id, order_id: sale.orderId, order_number: sale.orderNumber,
    type: sale.type, table_name: sale.tableName, server_name: sale.serverName,
    customer_name: sale.customerName, items: sale.items,
    subtotal: sale.subtotal, discount: sale.discount, tax: sale.tax,
    service_charge: sale.serviceCharge, total: sale.total,
    payment_method: sale.paymentMethod, date: sale.date,
  })
  if (error) log('insertSale', error)
}

// ─── EXPENSES ────────────────────────────────────────────────
export const dbGetExpenses = async () => {
  const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false })
  if (error) { log('getExpenses', error); return null }
  return data.map(e => ({
    id: e.id, title: e.title, category: e.category,
    amount: e.amount, date: e.date, paidBy: e.paid_by,
  }))
}

export const dbInsertExpense = async (exp) => {
  const { error } = await supabase.from('expenses').insert({
    id: exp.id, title: exp.title, category: exp.category,
    amount: exp.amount, date: exp.date, paid_by: exp.paidBy,
  })
  if (error) log('insertExpense', error)
}

export const dbDeleteExpense = async (id) => {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) log('deleteExpense', error)
}

// ─── NOTIFICATIONS ───────────────────────────────────────────
export const dbInsertNotification = async (noti) => {
  const { error } = await supabase.from('notifications').insert({
    id: noti.id, title: noti.title, message: noti.message,
    target_role: noti.targetRole, type: noti.type,
    data: noti.data || {}, read: false,
    timestamp: noti.timestamp,
  })
  if (error) log('insertNotification', error)
}

export const dbGetRecentNotifications = async (limit = 20) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)
  if (error) { log('getNotifications', error); return null }
  return data.map(n => ({
    id: n.id, title: n.title, message: n.message,
    targetRole: n.target_role, type: n.type,
    data: n.data || {}, read: n.read, timestamp: n.timestamp,
  }))
}

// ─── FULL INITIAL LOAD ───────────────────────────────────────
/**
 * Load all data from Supabase in one shot on app startup.
 * Returns null for each field that failed so we keep local data.
 */
export const dbLoadAllData = async () => {
  const [settings, users, tables, menuItems, orders, kots, reservations, inventory, sales, expenses, notifications] = await Promise.all([
    dbGetSettings(),
    dbGetUsers(),
    dbGetTables(),
    dbGetMenuItems(),
    dbGetOrders(),
    dbGetKots(),
    dbGetReservations(),
    dbGetInventory(),
    dbGetSales(),
    dbGetExpenses(),
    dbGetRecentNotifications(),
  ])
  return { settings, users, tables, menuItems, orders, kots, reservations, inventory, sales, expenses, notifications }
}

// ─── STAFF ───────────────────────────────────────────────────
export const dbGetStaff = async () => {
  const { data, error } = await supabase.from('staff').select('*')
  if (error) { log('getStaff', error); return null }
  return data.map(s => ({ id: s.id, name: s.name, role: s.role }))
}

export const dbUpsertStaff = async (member) => {
  const { error } = await supabase.from('staff').upsert({
    id: member.id, name: member.name, role: member.role,
  })
  if (error) log('upsertStaff', error)
}

