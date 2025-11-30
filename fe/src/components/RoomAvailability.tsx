import { useState, useEffect } from 'react'
import { bookingService } from '../services/bookingService'
import type { Booking } from '../services/bookingService'

interface RoomAvailabilityProps {
  roomId: number
  checkIn?: string
  checkOut?: string
}

const RoomAvailability = ({ roomId, checkIn, checkOut }: RoomAvailabilityProps) => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await bookingService.getBookingsByRoom(roomId)
        if (response.data) {
          setBookings(response.data)
        }
      } catch (err) {
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [roomId])

  // Kiểm tra xem phòng có bị đặt trong khoảng thời gian này không
  const isBookedInRange = () => {
    if (!checkIn || !checkOut) return false
    
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    return bookings.some((booking) => {
      if (booking.status !== 'PAID' && booking.status !== 'PENDING') return false
      
      const bookingCheckIn = new Date(booking.checkInDate)
      const bookingCheckOut = new Date(booking.checkOutDate)
      
      // Kiểm tra xung đột: booking nằm trong khoảng thời gian đang chọn
      return (
        (bookingCheckIn <= checkInDate && bookingCheckOut > checkInDate) ||
        (bookingCheckIn < checkOutDate && bookingCheckOut >= checkOutDate) ||
        (bookingCheckIn >= checkInDate && bookingCheckOut <= checkOutDate)
      )
    })
  }

  // Lấy danh sách ngày bị đặt trong 30 ngày tới
  const getBookedDates = () => {
    const bookedDates: string[] = []
    const today = new Date()
    const next30Days = new Date(today)
    next30Days.setDate(today.getDate() + 30)

    bookings.forEach((booking) => {
      if (booking.status !== 'PAID' && booking.status !== 'PENDING') return
      
      const checkIn = new Date(booking.checkInDate)
      const checkOut = new Date(booking.checkOutDate)
      
      const currentDate = new Date(checkIn)
      while (currentDate < checkOut && currentDate <= next30Days) {
        bookedDates.push(currentDate.toISOString().split('T')[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    return bookedDates
  }

  const bookedDates = getBookedDates()
  const isBooked = isBookedInRange()

  if (loading) {
    return (
      <div className="text-xs text-gray-500">
        <span className="inline-block w-2 h-2 bg-gray-300 rounded-full animate-pulse mr-1"></span>
        Đang kiểm tra...
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Status Badge */}
      {isBooked && checkIn && checkOut ? (
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-xs text-red-600 font-semibold">
            Đã được đặt trong khoảng thời gian này
          </span>
        </div>
      ) : checkIn && checkOut ? (
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-xs text-green-600 font-semibold">
            Có sẵn trong khoảng thời gian này
          </span>
        </div>
      ) : null}

      {/* Booked Dates Info */}
      {bookedDates.length > 0 && (
        <div className="text-xs text-gray-600">
          <p className="font-semibold mb-1">Lịch đặt phòng (30 ngày tới):</p>
          <div className="flex flex-wrap gap-1">
            {bookedDates.slice(0, 10).map((date) => (
              <span
                key={date}
                className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                title={new Date(date).toLocaleDateString('vi-VN')}
              >
                {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
              </span>
            ))}
            {bookedDates.length > 10 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{bookedDates.length - 10} ngày khác
              </span>
            )}
          </div>
        </div>
      )}

      {bookedDates.length === 0 && (
        <div className="text-xs text-green-600">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
          Phòng trống trong 30 ngày tới
        </div>
      )}
    </div>
  )
}

export default RoomAvailability

