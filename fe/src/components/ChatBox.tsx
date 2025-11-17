import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Mình tìm thấy 3 khách sạn phù hợp: 1, Furama Resort Đà Nẵng - 4.8⭐, cách biển 200m, giá từ 2.200.000₫/đêm 2, Mandila Beach Hotel - 4.5⭐, view biển, giá 1.750.000đ/đêm 3, Sala Danang Beach Hotel - 4.3⭐, giá 1.550.000đ/đêm',
      isAI: true,
      time: '7:20',
    },
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: inputValue,
          isAI: false,
          time: '7:20',
        },
      ])
      setInputValue('')
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
                    <p className="text-xs md:text-sm break-words">{message.text}</p>
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
            </div>

            {/* Quick Actions */}
            <div className="px-3 md:px-4 pb-2 flex gap-1 md:gap-2 flex-wrap flex-shrink-0">
              {['What is WappGPT? 😊', 'Pricing 💰', 'FAQs 📄'].map(
                (action, index) => (
                  <button
                    key={index}
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
                className="bg-purple-600 text-white p-2 md:p-2.5 rounded-full hover:bg-purple-700 flex-shrink-0"
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
