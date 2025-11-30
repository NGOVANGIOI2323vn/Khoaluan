import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import { bookingService } from '../services/bookingService'
import { useToast } from '../hooks/useToast'

const VnpayCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showSuccess, showError } = useToast()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...')

  useEffect(() => {
    const processPayment = async () => {
      try {
        const responseCode = searchParams.get('vnp_ResponseCode')
        const orderInfo = searchParams.get('vnp_OrderInfo') || ''
        
        // Kiểm tra response code
        if (responseCode === '00') {
          // Thanh toán thành công
          // Parse bookingId từ orderInfo
          let bookingId: number | null = null
          
          // Thử lấy từ orderInfo
          if (orderInfo.includes('|bookingId:')) {
            const parts = orderInfo.split('|bookingId:')
            if (parts.length > 1) {
              const bookingPart = parts[1].split('|')[0]
              bookingId = parseInt(bookingPart, 10)
            }
          }
          
          // Nếu không có trong orderInfo, lấy từ localStorage
          if (!bookingId) {
            const pendingBookingId = localStorage.getItem('pendingBookingId')
            if (pendingBookingId) {
              bookingId = parseInt(pendingBookingId, 10)
              localStorage.removeItem('pendingBookingId')
            }
          }
          
          if (bookingId) {
            // Kiểm tra booking status
            // Backend đã xử lý payment qua callback, chỉ cần kiểm tra
            setStatus('success')
            setMessage('Thanh toán thành công! Bạn sẽ nhận được email xác nhận trong vài phút.')
            showSuccess('Thanh toán thành công!')
            
            // Xóa bookingInfo nếu có
            localStorage.removeItem('bookingInfo')
            
            // Redirect sau 2 giây
            setTimeout(() => {
              navigate('/booking-history')
            }, 2000)
          } else {
            setStatus('success')
            setMessage('Thanh toán thành công! Vui lòng kiểm tra lịch sử đặt phòng.')
            showSuccess('Thanh toán thành công!')
            setTimeout(() => {
              navigate('/booking-history')
            }, 2000)
          }
        } else {
          // Thanh toán thất bại
          setStatus('failed')
          const errorMessage = searchParams.get('vnp_ResponseCode') || 'Thanh toán thất bại'
          setMessage(`Giao dịch không thành công. Mã lỗi: ${errorMessage}`)
          showError('Thanh toán thất bại')
          
          setTimeout(() => {
            navigate('/booking-history')
          }, 3000)
        }
      } catch (err) {
        console.error('Error processing payment:', err)
        setStatus('failed')
        setMessage('Có lỗi xảy ra khi xử lý thanh toán')
        showError('Có lỗi xảy ra khi xử lý thanh toán')
        
        setTimeout(() => {
          navigate('/booking-history')
        }, 3000)
      }
    }

    processPayment()
  }, [searchParams, navigate, showSuccess, showError])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center"
        >
          {status === 'loading' && (
            <>
              <div className="text-6xl mb-4 animate-spin">⏳</div>
              <h1 className="text-2xl font-bold mb-4">Đang xử lý...</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">Thanh toán thành công!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  Đơn đặt phòng của bạn đã được xác nhận. Bạn sẽ được chuyển đến trang lịch sử đặt phòng trong giây lát.
                </p>
              </div>
              <button
                onClick={() => navigate('/booking-history')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Xem lịch sử đặt phòng
              </button>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Thanh toán thất bại</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/booking-history')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Xem lịch sử đặt phòng
                </button>
                <button
                  onClick={() => navigate('/hotels')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Tìm khách sạn khác
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default VnpayCallback

