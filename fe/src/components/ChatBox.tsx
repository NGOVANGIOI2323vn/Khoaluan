import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { chatService } from '../services/chatService'
import type { Hotel } from '../services/hotelService'

interface Message {
  id: number
  text: string
  isAI: boolean
  time: string
  hotels?: Hotel[]
}

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Xin chào! Tôi là AI tư vấn đặt phòng khách sạn. Tôi có thể giúp bạn tìm khách sạn phù hợp, xem lịch sử đặt phòng, và trả lời các câu hỏi về dịch vụ. Bạn cần tôi giúp gì?',
      isAI: true,
      time: getCurrentTime(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function getCurrentTime(): string {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  }

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        isAI: false,
        time: getCurrentTime(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue('')
      setIsLoading(true)

      try {
        const response = await chatService.sendMessage(inputValue)
        const aiMessage: Message = {
          id: messages.length + 2,
          text: response.message,
          isAI: true,
          time: getCurrentTime(),
          hotels: response.hotels && response.hotels.length > 0 ? response.hotels : undefined,
        }
        setMessages((prev) => [...prev, aiMessage])
      } catch (error: unknown) {
        const errorMessage: Message = {
          id: messages.length + 2,
          text: (error as { response?: { data?: string } })?.response?.data || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
          isAI: true,
          time: getCurrentTime(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleQuickAction = async (action: string) => {
    if (isLoading) return
    
    const userMessage: Message = {
      id: messages.length + 1,
      text: action,
      isAI: false,
      time: getCurrentTime(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

      try {
        const response = await chatService.sendMessage(action)
        const aiMessage: Message = {
          id: messages.length + 2,
          text: response.message,
          isAI: true,
          time: getCurrentTime(),
          hotels: response.hotels && response.hotels.length > 0 ? response.hotels : undefined,
        }
        setMessages((prev) => [...prev, aiMessage])
    } catch (error: unknown) {
      const errorMessage: Message = {
        id: messages.length + 2,
        text: (error as { response?: { data?: string } })?.response?.data || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        isAI: true,
        time: getCurrentTime(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="bg-purple-600 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-purple-700 transition"
          >
            <div className="text-center">
              <div className="text-xl md:text-2xl mb-1">💬</div>
              <div className="text-xs font-semibold hidden sm:block">CHATBOX</div>
            </div>
          </button>
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-96 h-[500px] md:h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-purple-600 text-white p-3 md:p-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">🤖</span>
                <div>
                  <div className="font-bold text-sm md:text-base">AI BOOKING</div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-purple-700 rounded p-1 text-lg md:text-xl"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 md:p-3 ${
                      message.isAI
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-xs md:text-sm break-words whitespace-pre-wrap">{message.text}</p>
                    
                    {/* Hiển thị danh sách khách sạn nếu có */}
                    {message.hotels && message.hotels.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.hotels.map((hotel) => (
                          <Link
                            key={hotel.id}
                            to={`/hotel/${hotel.id}`}
                            onClick={() => setIsOpen(false)}
                            className="block bg-white bg-opacity-20 rounded-lg p-2 hover:bg-opacity-30 transition"
                          >
                            <div className="flex gap-2">
                              {hotel.image && (
                                <img
                                  src={hotel.image}
                                  alt={hotel.name}
                                  className="w-16 h-16 object-cover rounded"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{hotel.name}</h4>
                                <p className="text-xs opacity-90 truncate">{hotel.address}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs">⭐ {hotel.rating}</span>
                                  {hotel.minPrice && (
                                    <span className="text-xs">• {hotel.minPrice.toLocaleString('vi-VN')} VND/đêm</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className="text-xs opacity-70">{message.time}</span>
                      {message.isAI && (
                        <div className="flex gap-1 md:gap-2">
                          <button className="text-xs">📄</button>
                          <button className="text-xs">👍</button>
                          <button className="text-xs">👎</button>
                        </div>
                      )}
                      {!message.isAI && (
                        <span className="text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-purple-600 text-white rounded-lg p-2 md:p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-3 md:px-4 pb-2 flex gap-1 md:gap-2 flex-wrap flex-shrink-0">
              {['Tìm khách sạn gần biển 🏖️', 'Xem lịch sử đặt phòng 📅', 'Giá phòng rẻ nhất 💰'].map(
                (action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 whitespace-nowrap"
                  >
                    {action}
                  </button>
                )
              )}
            </div>

            {/* Input */}
            <div className="p-3 md:p-4 border-t flex items-center gap-2 flex-shrink-0">
              <input
                type="text"
                placeholder="Bạn vui lòng nhập........"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-purple-600 text-sm md:text-base"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="bg-purple-600 text-white p-2 md:p-2.5 rounded-full hover:bg-purple-700 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✈️
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBox
