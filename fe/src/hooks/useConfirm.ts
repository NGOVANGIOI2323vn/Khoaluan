import { useState, useCallback } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  type?: 'warning' | 'danger' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
  onConfirm: (() => void) | null
  onCancel: (() => void) | null
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    onConfirm: null,
    onCancel: null,
  })

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState({
          isOpen: true,
          ...options,
          onConfirm: () => {
            setConfirmState((prev) => ({ ...prev, isOpen: false }))
            resolve(true)
          },
          onCancel: () => {
            setConfirmState((prev) => ({ ...prev, isOpen: false }))
            resolve(false)
          },
        })
      })
    },
    []
  )

  const close = useCallback(() => {
    setConfirmState((prev) => {
      if (prev.onCancel) {
        prev.onCancel()
      }
      return { ...prev, isOpen: false }
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (confirmState.onConfirm) {
      confirmState.onConfirm()
    }
  }, [confirmState])

  return {
    confirm,
    close,
    handleConfirm,
    confirmState,
  }
}

