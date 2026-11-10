import { Navigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import useStore from '../../store/useStore'
import { hasPermission } from '../../utils/security'

export default function ProtectedRoute({ children, allowedRoles, fallbackPath }) {
  const { currentUser } = useStore()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const role = currentUser.role || 'Staff'
  const isAllowed = hasPermission(role, allowedRoles)

  if (!isAllowed) {
    // If fallback is provided, navigate there, or show an Access Restricted banner
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />
    }

    const defaultRedirect =
      role.toLowerCase() === 'chef'
        ? '/kitchen'
        : role.toLowerCase() === 'cashier'
        ? '/pos'
        : role.toLowerCase() === 'waiter'
        ? '/tables'
        : '/dashboard'

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm">
          Your account role (<span className="font-bold capitalize text-rose-500">{role}</span>) does not have permission to view or manage this area.
        </p>
        <Navigate to={defaultRedirect} replace />
      </div>
    )
  }

  return children
}

