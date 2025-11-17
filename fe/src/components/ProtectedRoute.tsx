import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'OWNER' | 'USER'
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('userRole')
      
      setIsAuthenticated(!!token)
      setUserRole(role)
      setIsChecking(false)
    }

    // Small delay to ensure localStorage is set
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [requiredRole])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-600">Đang kiểm tra...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect based on role
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin" replace />
    } else if (userRole === 'OWNER') {
      return <Navigate to="/owner" replace />
    } else {
      return <Navigate to="/hotels" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute

