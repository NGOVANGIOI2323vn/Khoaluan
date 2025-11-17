import { createContext } from 'react'
import type { Toast, ToastType } from '../components/Toast'

export interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export type { Toast, ToastType }

