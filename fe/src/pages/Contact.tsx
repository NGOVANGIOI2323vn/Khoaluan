import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import GoogleMapComponent from '../components/GoogleMap'
import { useToast } from '../hooks/useToast'
import { infoService } from '../services/infoService'
import type { ContactInfo, FAQ, Office } from '../services/infoService'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [showFAQs, setShowFAQs] = useState<number | null>(null)
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null)
  const [loading, setLoading] = useState(true)
  const { showSuccess, showError } = useToast()
  const [validationErrors, setValidationErrors] = useState<{
    name?: string
    email?: string
    phone?: string
    message?: string
  }>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    if (!phone) return true // Phone is optional
    const phoneRegex = /^[0-9+\-\s()]{9,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [contactRes, faqsRes, officesRes] = await Promise.all([
          infoService.getContactInfo(),
          infoService.getFAQs(),
          infoService.getOffices(),
        ])
        if (contactRes.data) setContactInfo(contactRes.data)
        if (faqsRes.data) setFaqs(faqsRes.data)
        if (officesRes.data) {
          setOffices(officesRes.data)
          if (officesRes.data.length > 0) {
            setSelectedOffice(officesRes.data[0])
          }
        }
      } catch (error) {
        console.error('Failed to load contact data', error)
        showError('Không thể tải dữ liệu liên hệ')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [showError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors: { name?: string; email?: string; phone?: string; message?: string } = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Họ và tên là bắt buộc'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Họ và tên phải có ít nhất 2 ký tự'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Email không hợp lệ'
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ (9-15 số)'
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Tin nhắn là bắt buộc'
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Tin nhắn phải có ít nhất 10 ký tự'
    }
    
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    
    try {
      const response = await infoService.createContactMessage(formData)
      if (response.data) {
        showSuccess('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.')
        setFormData({ name: '', email: '', phone: '', message: '' })
      }
    } catch {
      showError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 md:py-16 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Liên hệ với chúng tôi</h1>
            <p className="text-base sm:text-lg md:text-xl opacity-90">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 md:p-8"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
              Gửi tin nhắn cho chúng tôi
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (validationErrors.name) {
                      setValidationErrors({ ...validationErrors, name: undefined })
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-600 transition ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập họ và tên"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: undefined })
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-600 transition ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập email"
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value })
                    if (validationErrors.phone) {
                      setValidationErrors({ ...validationErrors, phone: undefined })
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-600 transition ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập số điện thoại (tùy chọn)"
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Tin nhắn</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value })
                    if (validationErrors.message) {
                      setValidationErrors({ ...validationErrors, message: undefined })
                    }
                  }}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-600 transition resize-none ${
                    validationErrors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tin nhắn của bạn"
                />
                {validationErrors.message && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.message}</p>
                )}
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Gửi tin nhắn
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
                Thông tin liên hệ
              </h2>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Đang tải thông tin liên hệ...</p>
                  </div>
                ) : contactInfo.length > 0 ? (
                  contactInfo.map((info, index) => (
                    <motion.a
                      key={info.id}
                      href={info.link || '#'}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition group"
                    >
                    <motion.span
                      className="text-3xl"
                      animate={{
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: info.id * 0.3,
                      }}
                    >
                      {info.type === 'email' ? '📧' : info.type === 'phone' ? '📞' : info.type === 'address' ? '📍' : '🕒'}
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-1 break-words">{info.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 break-words">{info.content}</p>
                    </div>
                  </motion.a>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có thông tin liên hệ</p>
                  </div>
                )}
              </div>
            </div>

            {/* Offices */}
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4">Văn phòng</h2>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Đang tải thông tin văn phòng...</p>
                  </div>
                ) : offices.length > 0 ? (
                  offices.map((office, index) => (
                    <motion.button
                      key={office.id}
                      onClick={() => setSelectedOffice(office)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`w-full p-3 sm:p-4 rounded-lg text-left transition ${
                        selectedOffice?.id === office.id
                          ? 'bg-blue-50 border-2 border-blue-600'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-2 break-words">{office.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 break-words">📍 {office.address}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 break-words">📞 {office.phone}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 break-words">📧 {office.email}</p>
                      {office.hours && <p className="text-xs sm:text-sm text-gray-600 break-words">🕒 {office.hours}</p>}
                    </motion.button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có thông tin văn phòng</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Google Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            {selectedOffice ? (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 break-words">
                    Vị trí: {selectedOffice.name}
                  </h2>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedOffice.latitude},${selectedOffice.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs sm:text-sm whitespace-nowrap"
                  >
                    Mở trong Google Maps →
                  </a>
                </div>
                <GoogleMapComponent
                  center={{ lat: selectedOffice.latitude, lng: selectedOffice.longitude }}
                  zoom={15}
                  height="500px"
                  address={selectedOffice.address}
                />
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Đang tải thông tin văn phòng...</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* FAQs Section */}
        <div className="mt-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 md:mb-8"
          >
            Câu hỏi thường gặp
          </motion.h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <p>Đang tải câu hỏi thường gặp...</p>
              </div>
            ) : faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => setShowFAQs(showFAQs === faq.id ? null : faq.id)}
                    className="w-full p-3 sm:p-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-sm sm:text-base text-gray-800 break-words pr-2">{faq.question}</span>
                    <motion.span
                      animate={{ rotate: showFAQs === faq.id ? 180 : 0 }}
                      className="text-blue-600"
                    >
                      ▼
                    </motion.span>
                  </button>
                  {showFAQs === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-3 sm:px-4 pb-3 sm:pb-4 text-sm sm:text-base text-gray-600 break-words"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Chưa có câu hỏi thường gặp</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
