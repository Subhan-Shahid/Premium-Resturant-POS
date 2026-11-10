// Security utilities for DineFlow Restaurant POS
// Implements password hashing with SHA-256 + salt, XSS escaping, and permission validation.

const SALT = 'dineflow_secure_salt_v1_'

/**
 * Hash a password using native Web Crypto API (SHA-256)
 */
export async function hashPassword(plainPassword) {
  if (!plainPassword) return ''
  const msgUint8 = new TextEncoder().encode(SALT + plainPassword)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify a plain password against stored hash or legacy plain string
 */
export async function verifyPassword(plainPassword, storedHashOrPlain) {
  if (!plainPassword || !storedHashOrPlain) return false
  // Support matching if already hashed
  const computedHash = await hashPassword(plainPassword)
  if (computedHash === storedHashOrPlain) return true
  // Support legacy plain text match for initial seed before first migration
  return plainPassword === storedHashOrPlain
}

/**
 * Strict HTML escaping for preventing XSS in reports, receipts, and inputs
 */
export function sanitizeHtml(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Role-Based Access Control (RBAC) Permissions Matrix
 */
export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  WAITER: 'Waiter',
  CHEF: 'Chef',
}

export const PERMISSIONS = {
  // Routes
  VIEW_DASHBOARD: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_POS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  VIEW_TABLES: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER],
  VIEW_KITCHEN: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CHEF, ROLES.CASHIER, ROLES.WAITER],
  VIEW_MENU: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CHEF],
  VIEW_RESERVATIONS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER, ROLES.CASHIER],
  VIEW_ORDERS_HISTORY: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
  VIEW_INVENTORY: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CHEF],
  VIEW_EXPENSES: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_REPORTS: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_USERS: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_SETTINGS: [ROLES.ADMIN, ROLES.MANAGER],

  // Specific Actions
  APPLY_CUSTOM_DISCOUNT: [ROLES.ADMIN, ROLES.MANAGER],
  DELETE_ORDER_OR_EXPENSE: [ROLES.ADMIN, ROLES.MANAGER],
  TRANSFER_TABLE: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER, ROLES.CASHIER],
}

/**
 * Helper to check if a user role has a specific permission
 */
export function hasPermission(userRole, permissionArray) {
  if (!userRole) return false
  const normalizedRole = userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase()
  return (permissionArray || []).some(
    r => r.toLowerCase() === normalizedRole.toLowerCase()
  )
}

