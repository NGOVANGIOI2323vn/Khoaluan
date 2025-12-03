import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react'

export type ConfirmDialogType = 'warning' | 'danger' | 'info' | 'success'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: ConfirmDialogType
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    headerBg: 'from-yellow-50 to-amber-50',
  },
  danger: {
    icon: XCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    headerBg: 'from-red-50 to-rose-50',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    headerBg: 'from-blue-50 to-indigo-50',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    headerBg: 'from-green-50 to-emerald-50',
  },
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isLoading = false,
}: ConfirmDialogProps) => {
  if (!isOpen) return null

  const config = typeConfig[type]
  const Icon = config.icon

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r ${config.headerBg}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.iconBg}`}>
                  <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words pr-2">{title}</h2>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-shrink-0 p-2 rounded-full hover:bg-white/50 transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">{message}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonColor}`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog

