import { useEffect } from 'react'
import useStore from '../../store/useStore'
import { dbLoadAllData } from '../../lib/db'
import { supabase } from '../../lib/supabase'

export default function CloudSyncManager() {
  // On mount: load all data from Supabase and hydrate store
  useEffect(() => {
    let isMounted = true

    const loadFromSupabase = async () => {
      try {
        useStore.getState().setCloudSyncStatus?.('connecting')
        const data = await dbLoadAllData()
        if (!isMounted) return

        const patch = {}
        if (data.settings) patch.settings = { ...useStore.getState().settings, ...data.settings }
        if (data.users?.length) patch.users = data.users
        if (data.tables?.length) patch.tables = data.tables
        if (data.menuItems?.length) patch.menuItems = data.menuItems
        if (data.orders?.length) patch.orders = data.orders
        if (data.kots?.length) patch.kots = data.kots
        if (data.reservations?.length) patch.reservations = data.reservations
        if (data.inventory?.length) patch.inventory = data.inventory
        if (data.sales?.length) patch.sales = data.sales
        if (data.expenses?.length) patch.expenses = data.expenses
        if (data.notifications?.length) patch.notifications = data.notifications

        if (Object.keys(patch).length) {
          useStore.setState(patch)
        }
        useStore.getState().setCloudSyncStatus?.('connected')
      } catch (err) {
        console.warn('[Supabase] Initial load failed or tables not ready, using local data:', err)
        useStore.getState().setCloudSyncStatus?.('error')
      }
    }

    loadFromSupabase()

    return () => {
      isMounted = false
    }
  }, [])

  // Real-time subscriptions
  useEffect(() => {
    // 1. KOTs — kitchen gets new orders, waiters see ready status updates
    const kotChannel = supabase
      .channel('kots-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kots' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload
        const store = useStore.getState()
        if (eventType === 'INSERT') {
          const kot = mapKotRow(newRow)
          if (!store.kots.some((k) => k.id === kot.id)) {
            useStore.setState({ kots: [kot, ...store.kots] })
          }
        } else if (eventType === 'UPDATE') {
          useStore.setState({
            kots: store.kots.map((k) => (k.id === newRow.id ? { ...k, status: newRow.status } : k)),
          })
        } else if (eventType === 'DELETE' && oldRow?.id) {
          useStore.setState({
            kots: store.kots.filter((k) => k.id !== oldRow.id),
          })
        }
      })
      .subscribe()

    // 2. Orders
    const orderChannel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload
        const store = useStore.getState()
        if (eventType === 'INSERT') {
          const order = mapOrderRow(newRow)
          if (!store.orders.some((o) => o.id === order.id)) {
            useStore.setState({ orders: [order, ...store.orders] })
          }
        } else if (eventType === 'UPDATE') {
          const order = mapOrderRow(newRow)
          useStore.setState({
            orders: store.orders.map((o) => (o.id === order.id ? { ...o, ...order } : o)),
          })
        } else if (eventType === 'DELETE' && oldRow?.id) {
          useStore.setState({
            orders: store.orders.filter((o) => o.id !== oldRow.id),
          })
        }
      })
      .subscribe()

    // 3. Tables (occupied, available, bill requested, etc.)
    const tableChannel = supabase
      .channel('tables-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload
        const store = useStore.getState()
        if (eventType === 'UPDATE') {
          useStore.setState({
            tables: store.tables.map((t) =>
              t.id === newRow.id
                ? {
                    ...t,
                    status: newRow.status,
                    currentOrderId: newRow.current_order_id,
                    serverName: newRow.server_name,
                  }
                : t
            ),
          })
        } else if (eventType === 'INSERT') {
          const newTable = {
            id: newRow.id,
            name: newRow.name,
            capacity: newRow.capacity,
            section: newRow.section,
            status: newRow.status || 'available',
            currentOrderId: newRow.current_order_id || null,
            serverName: newRow.server_name || null,
          }
          if (!store.tables.some((t) => t.id === newTable.id)) {
            useStore.setState({ tables: [...store.tables, newTable] })
          }
        } else if (eventType === 'DELETE' && oldRow?.id) {
          useStore.setState({
            tables: store.tables.filter((t) => t.id !== oldRow.id),
          })
        }
      })
      .subscribe()

    // 4. Notifications (Cross-device popup alerts)
    const notiChannel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const { new: newRow } = payload
        if (!newRow) return
        const store = useStore.getState()
        const noti = {
          id: newRow.id,
          title: newRow.title,
          message: newRow.message,
          targetRole: newRow.target_role,
          type: newRow.type,
          data: newRow.data || {},
          read: newRow.read,
          timestamp: newRow.timestamp,
        }
        if (!store.notifications.some((n) => n.id === noti.id)) {
          useStore.setState({ notifications: [noti, ...store.notifications.slice(0, 49)] })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(kotChannel)
      supabase.removeChannel(orderChannel)
      supabase.removeChannel(tableChannel)
      supabase.removeChannel(notiChannel)
    }
  }, [])

  return null
}

// Helper row mappers
function mapKotRow(k) {
  return {
    id: k.id,
    kotNumber: k.kot_number,
    orderId: k.order_id,
    tableId: k.table_id,
    tableName: k.table_name,
    orderType: k.order_type,
    serverName: k.server_name,
    status: k.status,
    items: k.items || [],
    notes: k.notes,
    createdAt: k.created_at,
  }
}

function mapOrderRow(o) {
  return {
    id: o.id,
    orderNumber: o.order_number,
    type: o.type,
    tableId: o.table_id,
    tableName: o.table_name,
    guestCount: o.guest_count,
    serverName: o.server_name,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerAddress: o.customer_address,
    status: o.status,
    items: o.items || [],
    subtotal: o.subtotal,
    discount: o.discount,
    tax: o.tax,
    serviceCharge: o.service_charge,
    tip: o.tip,
    total: o.total,
    paymentMethod: o.payment_method,
    createdAt: o.created_at,
  }
}
