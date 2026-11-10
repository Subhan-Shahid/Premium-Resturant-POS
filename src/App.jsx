import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import AppHeader from './components/layout/AppHeader'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import ProtectedRoute from './components/common/ProtectedRoute'
import useStore from './store/useStore'
import { ROLES, PERMISSIONS } from './utils/security'

// Pages
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Tables from './pages/Tables'
import Kitchen from './pages/Kitchen'
import MenuCatalog from './pages/MenuCatalog'
import Reservations from './pages/Reservations'
import OrderHistory from './pages/OrderHistory'
import Inventory from './pages/Inventory'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'
import UserManagement from './pages/UserManagement'
import Settings from './pages/Settings'
import Login from './pages/Login'
import CloudSyncManager from './components/common/CloudSyncManager'
import NotificationToastManager from './components/common/NotificationToastManager'

function App() {
  const { ui, currentUser } = useStore()
  const isDark = ui?.darkMode

  // Apply dark mode to document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  // If not logged in, show Login
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#07090e]">
        <CloudSyncManager />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    )
  }

  const role = String(currentUser.role || '').toLowerCase()
  const isChef = role === 'chef'
  const isCashier = role === 'cashier'
  const isWaiter = role === 'waiter'

  // Default redirect path based on role
  const defaultPath = isChef
    ? '/kitchen'
    : isCashier
    ? '/pos'
    : isWaiter
    ? '/tables'
    : '/dashboard'

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 dark:bg-[#07090e] text-gray-900 dark:text-slate-100 font-sans">
      <CloudSyncManager />
      <NotificationToastManager />
      
      {/* Top Header with Lock Screen */}
      <AppHeader />

      {/* Main Workspace: Sidebar + Dynamic Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop / Tablet Sidebar */}
        {!isChef && <Sidebar />}

        {/* Content Viewport with Strict Route Security */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-5 lg:p-6"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <Routes>
            <Route path="/" element={<Navigate to={defaultPath} replace />} />

            {/* Dashboard: Restricted to Admin / Manager */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.VIEW_DASHBOARD} fallbackPath={defaultPath}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* POS: Admin, Manager, Cashier, Waiter */}
            <Route
              path="/pos"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.VIEW_POS}>
                  <POS />
                </ProtectedRoute>
              }
            />

            {/* Tables & Floor: Admin, Manager, Cashier, Waiter */}
            <Route
              path="/tables"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.VIEW_TABLES}>
                  <Tables />
                </ProtectedRoute>
              }
            />

            {/* Kitchen KDS: Admin, Manager, Chef, Cashier, Waiter */}
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.VIEW_KITCHEN}>
                  <Kitchen />
                </ProtectedRoute>
              }
            />

            {/* Menu Catalog: Admin, Manager, Chef */}
            <Route
              path="/menu"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.VIEW_MENU} fallbackPath={defaultPath}>
                  <MenuCatalog />
                </ProtectedRoute>
              }
            />

            {/* Reservations: Admin, Manager, Waiter, Cashier */}
            <Route
              path="/reservations"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.VIEW_RESERVATIONS} fallbackPath={defaultPath}>
                  <Reservations />
                </ProtectedRoute>
              }
            />

            {/* Order History: Admin, Manager, Cashier */}
            <Route
              path="/orders-history"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.VIEW_ORDERS_HISTORY} fallbackPath={defaultPath}>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />

            {/* Food Inventory: Admin, Manager, Chef */}
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.VIEW_INVENTORY} fallbackPath={defaultPath}>
                  <Inventory />
                </ProtectedRoute>
              }
            />

            {/* Expenses: Admin, Manager only */}
            <Route
              path="/expenses"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.VIEW_EXPENSES} fallbackPath={defaultPath}>
                  <Expenses />
                </ProtectedRoute>
              }
            />

            {/* Financial & Sales Reports: Admin, Manager only */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.VIEW_REPORTS} fallbackPath={defaultPath}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* User Management & Security: Admin, Manager only */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.MANAGE_USERS} fallbackPath={defaultPath}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            {/* Settings & Configuration: Admin, Manager only */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={PERMISSIONS.MANAGE_SETTINGS} fallbackPath={defaultPath}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Handheld devices) */}
      {!isChef && <BottomNav />}
    </div>
  )
}

export default App
