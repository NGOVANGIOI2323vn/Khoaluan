import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

interface GuestRouteProps {
  children: React.ReactNode
}

/**
 * Component để bảo vệ các route chỉ dành cho guest (chưa đăng nhập)
 * Nếu đã đăng nhập, sẽ redirect về trang phù hợp với role
 */
const GuestRoute = ({ children }: GuestRouteProps) => {
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
  }, [])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-600">Đang kiểm tra...</div>
      </div>
    )
  }

  // Nếu đã đăng nhập, redirect về trang phù hợp với role
  if (isAuthenticated) {
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin" replace />
    } else if (userRole === 'OWNER') {
      return <Navigate to="/owner" replace />
    } else {
      return <Navigate to="/hotels" replace />
    }
  }

  // Chưa đăng nhập, cho phép truy cập
  return <>{children}</>
}

export default GuestRoute

