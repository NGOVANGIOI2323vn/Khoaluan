import { useState, useEffect, useRef } from 'react'

interface FormattedNumberInputProps {
  value: string | number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  min?: number
  max?: number
  disabled?: boolean
  required?: boolean
}

const FormattedNumberInput = ({
  value,
  onChange,
  placeholder = '0',
  className = '',
  min,
  max,
  disabled = false,
  required = false,
}: FormattedNumberInputProps) => {
  const [displayValue, setDisplayValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Format number with thousand separators
  const formatNumber = (num: number | string): string => {
    if (!num && num !== 0) return ''
    const numStr = String(num).replace(/\D/g, '')
    if (!numStr) return ''
    const numValue = parseInt(numStr, 10)
    if (isNaN(numValue)) return ''
    return numValue.toLocaleString('vi-VN')
  }

  // Parse formatted string to number
  const parseNumber = (formatted: string): number => {
    const numStr = formatted.replace(/\D/g, '')
    if (!numStr) return 0
    return parseInt(numStr, 10) || 0
  }

  // Initialize display value
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const numValue = typeof value === 'string' ? parseNumber(value) : value
      setDisplayValue(formatNumber(numValue))
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numValue = parseNumber(inputValue)
    
    // Validate min/max
    if (min !== undefined && numValue < min) {
      return
    }
    if (max !== undefined && numValue > max) {
      return
    }

    setDisplayValue(formatNumber(numValue))
    onChange(numValue)
  }

  const handleBlur = () => {
    // Ensure value is formatted on blur
    const numValue = parseNumber(displayValue)
    setDisplayValue(formatNumber(numValue))
  }

  const handleFocus = () => {
    // Show raw number when focused for easier editing
    const numValue = parseNumber(displayValue)
    if (numValue > 0) {
      setDisplayValue(numValue.toString())
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
    />
  )
}

export default FormattedNumberInput

