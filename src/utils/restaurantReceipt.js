// Utility for generating Thermal KOT (Kitchen Order Ticket) and Guest Bill Receipts

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Builds HTML for Kitchen Order Ticket (KOT) (80mm / 58mm thermal print)
 */
export function buildKotHtml({
  kotNumber = '1',
  orderType = 'Dine-In',
  tableName = 'T-1',
  serverName = 'Staff',
  items = [],
  notes = '',
  timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  reprint = false,
}) {
  const itemsHtml = items.map(item => `
    <tr class="item-row">
      <td class="qty">${Number(item.qty || 1)}x</td>
      <td class="name">
        <div class="dish-title">${escapeHtml(item.name)}</div>
        ${item.variant ? `<div class="addon">• Variant: ${escapeHtml(item.variant)}</div>` : ''}
        ${Array.isArray(item.addons) && item.addons.length ? `<div class="addon">• Add-ons: ${escapeHtml(item.addons.join(', '))}</div>` : ''}
        ${item.note ? `<div class="dish-note">** NOTE: ${escapeHtml(item.note)} **</div>` : ''}
      </td>
    </tr>
  `).join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>KOT #${kotNumber}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; color: #000; font-size: 13px; }
    .wrap { width: 78mm; max-width: 78mm; margin: 0 auto; padding: 8px 6px; }
    .center { text-align: center; }
    .bold { font-weight: 700; }
    .header-box { border: 2px solid #000; padding: 4px; text-align: center; margin-bottom: 6px; }
    .kot-title { font-size: 18px; font-weight: 900; letter-spacing: 1px; }
    .order-type { font-size: 14px; font-weight: 700; margin-top: 2px; }
    .meta-grid { display: flex; justify-content: space-between; border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 6px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    .item-row td { padding: 5px 0; vertical-align: top; border-bottom: 1px dotted #ccc; }
    .qty { width: 32px; font-size: 16px; font-weight: 800; }
    .dish-title { font-size: 14px; font-weight: 700; }
    .addon { font-size: 11px; color: #333; margin-left: 2px; }
    .dish-note { font-size: 12px; font-weight: 800; background: #000; color: #fff; padding: 1px 4px; display: inline-block; margin-top: 2px; border-radius: 2px; }
    .special-inst { margin-top: 8px; border: 1px dashed #000; padding: 6px; font-size: 12px; font-weight: bold; }
    .footer { text-align: center; margin-top: 10px; font-size: 11px; border-top: 1px solid #000; padding-top: 4px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header-box">
      <div class="kot-title">KITCHEN ORDER TICKET ${reprint ? '(REPRINT)' : ''}</div>
      <div class="order-type">${orderType.toUpperCase()} — ${escapeHtml(tableName)}</div>
    </div>
    <div class="meta-grid">
      <div><strong>KOT #:</strong> ${escapeHtml(kotNumber)}</div>
      <div><strong>Server:</strong> ${escapeHtml(serverName)}</div>
    </div>
    <div class="meta-grid">
      <div><strong>Time:</strong> ${escapeHtml(timestamp)}</div>
      <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
    </div>
    <table>
      ${itemsHtml}
    </table>
    ${notes ? `<div class="special-inst">ORDER NOTES: ${escapeHtml(notes)}</div>` : ''}
    <div class="footer">DineFlow KDS · Dispatch to Chef</div>
  </div>
</body>
</html>`
}

/**
 * Builds HTML for Customer Dining Receipt / Tax Invoice
 */
export function buildCustomerBillHtml({
  restaurant = {},
  orderId = '',
  orderType = 'Dine-In',
  tableName = 'T-1',
  serverName = 'Staff',
  cashierName = '',
  customerName = 'Walk-in Guest',
  customerPhone = '',
  dateTime = new Date().toLocaleString(),
  items = [],
  subtotal = 0,
  discount = 0,
  serviceChargeRate = 0,
  serviceCharge = 0,
  taxRate = 0,
  tax = 0,
  total = 0,
  paymentMethod = 'Cash',
  currency = '$',
}) {
  const restName = restaurant.companyName || restaurant.name || 'Restaurant'

  const logoHtml = restaurant.logoDataUrl
    ? `<div style="margin-bottom: 6px;"><img src="${restaurant.logoDataUrl}" style="max-height: 54px; max-width: 140px; object-fit: contain;" alt="Logo" /></div>`
    : ''

  const rows = items.map(item => {
    const itemTotal = (Number(item.price || 0) * Number(item.qty || 1))
    return `
      <tr>
        <td style="width: 55%; padding: 4px 0;">
          <div style="font-weight: 600;">${escapeHtml(item.name)}</div>
          ${item.variant ? `<div style="font-size:10px; color:#555;">${escapeHtml(item.variant)}</div>` : ''}
          ${Array.isArray(item.addons) && item.addons.length ? `<div style="font-size:10px; color:#555;">+ ${escapeHtml(item.addons.join(', '))}</div>` : ''}
        </td>
        <td style="width: 15%; text-align: center; vertical-align: top; padding: 4px 0;">${Number(item.qty || 1)}</td>
        <td style="width: 30%; text-align: right; vertical-align: top; padding: 4px 0; font-weight: 600;">${currency}${itemTotal.toFixed(2)}</td>
      </tr>
    `
  }).join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bill #${orderId}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #000; font-size: 12px; line-height: 1.35; }
    .wrap { width: 78mm; max-width: 78mm; margin: 0 auto; padding: 10px 8px; }
    .center { text-align: center; }
    .rest-name { font-size: 18px; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; }
    .rest-info { font-size: 11px; color: #333; line-height: 1.3; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .double-divider { border-top: 2px solid #000; margin: 8px 0; }
    .meta-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; }
    th { border-bottom: 1px solid #000; font-size: 11px; padding-bottom: 3px; text-align: left; }
    .total-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 12px; }
    .grand-total { font-size: 15px; font-weight: 800; padding: 4px 0; border-top: 1px solid #000; border-bottom: 1px solid #000; margin-top: 4px; }
    .thank-you { text-align: center; margin-top: 10px; font-size: 12px; font-weight: 700; }
    .footer-note { text-align: center; margin-top: 3px; font-size: 10px; color: #555; }
    .dev-credit { text-align: center; margin-top: 12px; padding-top: 6px; border-top: 1px dotted #888; font-size: 9.5px; color: #444; line-height: 1.3; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="center">
      ${logoHtml}
      <div class="rest-name">${escapeHtml(restName)}</div>
      ${restaurant.tagline ? `<div class="rest-info" style="font-style: italic; margin-bottom: 2px;">${escapeHtml(restaurant.tagline)}</div>` : ''}
      ${restaurant.address ? `<div class="rest-info">${escapeHtml(restaurant.address)}</div>` : ''}
      ${restaurant.phone ? `<div class="rest-info">Tel: ${escapeHtml(restaurant.phone)}</div>` : ''}
      ${restaurant.gstNumber ? `<div class="rest-info">GST/Tax ID: ${escapeHtml(restaurant.gstNumber)}</div>` : ''}
    </div>

    <div class="divider"></div>

    <div class="meta-row">
      <span><strong>Bill #:</strong> ${escapeHtml(orderId)}</span>
      <span><strong>Type:</strong> ${escapeHtml(orderType)}</span>
    </div>
    <div class="meta-row">
      <span><strong>Table:</strong> ${escapeHtml(tableName)}</span>
      <span><strong>Server / Biller:</strong> ${escapeHtml(cashierName || serverName)}</span>
    </div>
    <div class="meta-row">
      <span><strong>Date:</strong> ${escapeHtml(dateTime)}</span>
    </div>
    ${customerName && customerName !== 'Walk-in Guest' ? `
      <div class="meta-row">
        <span><strong>Guest:</strong> ${escapeHtml(customerName)}</span>
        ${customerPhone ? `<span>${escapeHtml(customerPhone)}</span>` : ''}
      </div>
    ` : ''}

    <div class="divider"></div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="divider"></div>

    <div class="total-row">
      <span>Subtotal:</span>
      <span>${currency}${Number(subtotal).toFixed(2)}</span>
    </div>
    ${Number(discount) > 0 ? `
      <div class="total-row" style="color: #c00;">
        <span>Discount:</span>
        <span>-${currency}${Number(discount).toFixed(2)}</span>
      </div>
    ` : ''}
    ${Number(serviceCharge) > 0 ? `
      <div class="total-row">
        <span>Service Charge (${(serviceChargeRate * 100).toFixed(0)}%):</span>
        <span>${currency}${Number(serviceCharge).toFixed(2)}</span>
      </div>
    ` : ''}
    ${Number(tax) > 0 ? `
      <div class="total-row">
        <span>Tax/VAT (${(taxRate * 100).toFixed(0)}%):</span>
        <span>${currency}${Number(tax).toFixed(2)}</span>
      </div>
    ` : ''}

    <div class="total-row grand-total">
      <span>TOTAL DUE:</span>
      <span>${currency}${Number(total).toFixed(2)}</span>
    </div>

    <div class="total-row" style="margin-top: 4px; font-weight: 600;">
      <span>Paid via:</span>
      <span>${escapeHtml(paymentMethod.toUpperCase())}</span>
    </div>

    <div class="double-divider"></div>

    <div class="thank-you">Thank you for dining with us!</div>
    <div class="footer-note">Please visit again soon.</div>
    ${restaurant.wifiPassword ? `<div class="footer-note">Guest Wi-Fi: <strong>${escapeHtml(restaurant.wifiPassword)}</strong></div>` : ''}

    <div class="dev-credit">
      Software developed by <strong>stackoraoftworks.agency</strong><br />
      Contact: <strong>03216405272</strong>
    </div>
  </div>
</body>
</html>`
}
