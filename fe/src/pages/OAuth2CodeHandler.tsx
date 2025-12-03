import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

/**
 * Component để xử lý OAuth2 callback từ Spring Security
 * URL: /login/oauth2/code/google?error=...&message=...
 * Redirect về /login với error message
 */
const OAuth2CodeHandler = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Lấy error và message từ URL parameters
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    // Nếu có error, redirect về login với error message
    if (error) {
      const errorMessage = message 
        ? decodeURIComponent(message) 
        : 'Đăng nhập Google thất bại. Vui lòng thử lại.'
      
      navigate(`/login?error=oauth2_failed&message=${encodeURIComponent(errorMessage)}`, { replace: true })
    } else {
      // Nếu không có error, redirect về login
      navigate('/login', { replace: true })
    }
  }, [navigate, searchParams])

  return null
}

export default OAuth2CodeHandler

