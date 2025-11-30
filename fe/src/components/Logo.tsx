import { motion } from 'framer-motion'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const Logo = ({ className = '', showText = true, size = 'md' }: LogoProps) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl sm:text-2xl md:text-3xl' },
    lg: { icon: 48, text: 'text-2xl sm:text-3xl md:text-4xl' },
  }

  const { icon: iconSize, text: textSize } = sizeMap[size]

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      <motion.div
        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className="relative flex-shrink-0"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          {/* Building/Hotel Icon */}
          <rect x="4" y="12" width="24" height="18" rx="2" fill="url(#logoGradient)" />
          {/* Windows */}
          <rect x="7" y="15" width="4" height="4" rx="0.5" fill="white" opacity="0.9" />
          <rect x="13" y="15" width="4" height="4" rx="0.5" fill="white" opacity="0.9" />
          <rect x="19" y="15" width="4" height="4" rx="0.5" fill="white" opacity="0.9" />
          <rect x="7" y="21" width="4" height="4" rx="0.5" fill="white" opacity="0.9" />
          <rect x="13" y="21" width="4" height="4" rx="0.5" fill="white" opacity="0.9" />
          <rect x="19" y="21" width="4" height="4" rx="0.5" fill="white" opacity="0.9" />
          {/* Door */}
          <rect x="13" y="24" width="6" height="6" rx="1" fill="white" opacity="0.8" />
          <circle cx="17" cy="27" r="0.8" fill="url(#logoGradient)" />
          {/* Star on top */}
          <path
            d="M16 4 L17.5 8 L22 8.5 L18.5 11.5 L19.5 16 L16 13.5 L12.5 16 L13.5 11.5 L10 8.5 L14.5 8 Z"
            fill="url(#logoGradient)"
            opacity="0.9"
          />
        </svg>
      </motion.div>
      {showText && (
        <span className={`${textSize} font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap`}>
          StayHub
        </span>
      )}
    </div>
  )
}

export default Logo

