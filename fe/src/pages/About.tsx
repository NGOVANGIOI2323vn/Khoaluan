import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { infoService } from '../services/infoService'
import type { CompanyInfo } from '../services/infoService'

const About = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({})

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await infoService.getCompanyInfo()
        if (response.data) {
          setCompanyInfo(response.data)
        }
      } catch (error) {
        console.error('Failed to load company info', error)
        setCompanyInfo({})
      }
    }
    fetchCompanyInfo()
  }, [])

  // Static data for features and statistics (these don't need to be in DB)
  const features = [
    {
      icon: '🌍',
      title: 'Toàn cầu',
      description: 'Hơn 100.000 khách sạn trên toàn thế giới',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: '💰',
      title: 'Giá tốt nhất',
      description: 'Đảm bảo giá tốt nhất với chính sách giá tốt nhất',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: '⭐',
      title: 'Đánh giá thực',
      description: 'Đánh giá từ khách hàng thực tế đã sử dụng dịch vụ',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: '🔒',
      title: 'An toàn',
      description: 'Thanh toán an toàn và bảo mật thông tin',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: '🎁',
      title: 'Ưu đãi',
      description: 'Nhiều chương trình khuyến mãi và giảm giá',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: '📱',
      title: 'Tiện lợi',
      description: 'Đặt phòng dễ dàng mọi lúc mọi nơi',
      color: 'from-indigo-500 to-purple-500',
    },
  ]

  const statistics = [
    { number: '100K+', label: 'Khách sạn', icon: '🏨' },
    { number: '50M+', label: 'Khách hàng', icon: '👥' },
    { number: '150+', label: 'Quốc gia', icon: '🌍' },
    { number: '24/7', label: 'Hỗ trợ', icon: '🎧' },
  ]

  const teamMembers = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      position: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'Hơn 15 năm kinh nghiệm trong ngành du lịch và khách sạn',
    },
    {
      id: 2,
      name: 'Trần Thị B',
      position: 'CTO',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      bio: 'Chuyên gia công nghệ với nhiều giải thưởng quốc tế',
    },
    {
      id: 3,
      name: 'Lê Văn C',
      position: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      bio: 'Quản lý vận hành với hơn 10 năm kinh nghiệm',
    },
  ]

  const values = companyInfo.values ? (typeof companyInfo.values === 'string' ? JSON.parse(companyInfo.values) : companyInfo.values) : [
    'Khách hàng là trung tâm',
    'Đổi mới và sáng tạo',
    'Minh bạch và trung thực',
    'Chất lượng dịch vụ cao',
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 md:py-24 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Về chúng tôi</h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto">
              {companyInfo.mission || 'Mang đến trải nghiệm đặt phòng khách sạn tốt nhất cho khách hàng'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Sứ mệnh của chúng tôi
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-4">
              {companyInfo.mission || 'Mang đến trải nghiệm đặt phòng khách sạn tốt nhất cho khách hàng với giá cả hợp lý, dịch vụ chất lượng và hỗ trợ 24/7.'}
            </p>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-4 md:mb-6">
              Với hơn {companyInfo.founded ? new Date().getFullYear() - parseInt(companyInfo.founded) : 15} năm kinh nghiệm trong ngành du lịch, chúng tôi đã phục vụ hàng triệu
              khách hàng và nhận được sự tin tưởng từ đối tác trên toàn thế giới.
            </p>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Giá trị cốt lõi</h3>
              <ul className="space-y-2">
                {values.map((value: string, index: number) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <span className="text-blue-600">✓</span>
                    <span>{value}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl"
          >
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800"
              alt="Team"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 md:mb-12"
          >
            Đội ngũ của chúng tôi
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 break-words">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-2 sm:mb-3 text-sm sm:text-base break-words">{member.position}</p>
                  <p className="text-gray-600 text-xs sm:text-sm break-words">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 md:mb-12"
        >
          Tại sao chọn chúng tôi?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition relative overflow-hidden group"
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10`}
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="text-5xl mb-4 relative z-10"
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 relative z-10 break-words">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 relative z-10 break-words">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 md:py-16">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {statistics.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 + index * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.1 }}
                className="text-center text-white"
              >
                <motion.div
                  className="text-3xl sm:text-4xl mb-2"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  {stat.icon}
                </motion.div>
                <motion.div
                  className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-sm sm:text-base md:text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
