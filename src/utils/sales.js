export const getSaleDate = (sale) => String(sale?.date || '').slice(0, 10)

export function getSaleFinancials(sale, inventoryById = {}, mobilesById = {}) {
  const items = Array.isArray(sale?.items) && sale.items.length
    ? sale.items
    : sale?.mobileId
      ? [{
          id: sale.mobileId,
          price: Number(sale.price || 0),
          qty: 1,
          purchasePrice: sale.profit != null ? Number(sale.price || 0) - Number(sale.profit || 0) : undefined,
        }]
      : []

  const subtotal = items.reduce((total, item) => (
    total + Number(item.price || 0) * Number(item.qty || 0)
  ), 0)
  const cost = items.reduce((total, item) => {
    const inventoryItem = inventoryById[item.id]
    const mobile = mobilesById[item.id]
    const unitCost = item.purchasePrice
      ?? inventoryItem?.purchasePrice
      ?? inventoryItem?.unitCost
      ?? mobile?.purchasePrice
      ?? 0
    return total + Number(unitCost || 0) * Number(item.qty || 0)
  }, 0)
  const discount = Number(sale?.discount || 0)
  const tax = Number(sale?.tax || 0)
  const totalPaid = Number(sale?.total ?? (subtotal - discount + tax)) || 0

  return {
    subtotal,
    discount,
    tax,
    totalPaid,
    cost,
    grossProfit: subtotal - discount - cost,
  }
}
