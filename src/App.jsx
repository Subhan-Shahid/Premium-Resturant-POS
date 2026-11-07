import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import AppHeader from './components/layout/AppHeader'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import useStore from './store/useStore'

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

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 dark:bg-[#07090e] text-gray-900 dark:text-slate-100 font-sans">
      <CloudSyncManager />
      
      {/* Top Header */}
      <AppHeader />

      {/* Main Workspace: Sidebar + Dynamic Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop / Tablet Sidebar */}
        {!isChef && <Sidebar />}

        {/* Content Viewport */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-5 lg:p-6"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <Routes>
            {/* Chef defaults to Kitchen KDS */}
            {isChef ? (
              <>
                <Route path="/" element={<Navigate to="/kitchen" replace />} />
                <Route path="/kitchen" element={<Kitchen />} />
                <Route path="*" element={<Navigate to="/kitchen" replace />} />
              </>
            ) : isCashier ? (
              /* Cashier defaults to POS */
              <>
                <Route path="/" element={<Navigate to="/pos" replace />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/tables" element={<Tables />} />
                <Route path="/kitchen" element={<Kitchen />} />
                <Route path="/orders-history" element={<OrderHistory />} />
                <Route path="*" element={<Navigate to="/pos" replace />} />
              </>
            ) : (
              /* Manager / Admin / Waiter full access */
              <>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/tables" element={<Tables />} />
                <Route path="/kitchen" element={<Kitchen />} />
                <Route path="/menu" element={<MenuCatalog />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/orders-history" element={<OrderHistory />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Handheld devices) */}
      {!isChef && <BottomNav />}
    </div>
  )
}

export default App
