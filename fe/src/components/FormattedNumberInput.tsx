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
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onBlur?: () => void
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
  onKeyDown,
  onBlur: onBlurProp,
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
    if (value !== undefined && value !== null && value !== '') {
      const numValue = typeof value === 'string' ? parseNumber(value) : value
      const formatted = formatNumber(numValue)
      if (formatted !== displayValue) {
        setDisplayValue(formatted)
      }
    } else if (displayValue !== '') {
      setDisplayValue('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numValue = parseNumber(inputValue)
    
    // Allow typing during input, only enforce max limit
    // Min validation will be done on blur/submit
    if (max !== undefined && numValue > max) {
      return
    }

    setDisplayValue(formatNumber(numValue))
    onChange(numValue)
  }

  const handleBlur = () => {
    // Ensure value is formatted on blur and validate min
    const numValue = parseNumber(displayValue)
    let finalValue = numValue
    
    // Enforce min value on blur
    if (min !== undefined && numValue < min) {
      finalValue = min
      setDisplayValue(formatNumber(finalValue))
      onChange(finalValue)
    } else {
      setDisplayValue(formatNumber(finalValue))
    }
    
    // Call custom onBlur if provided
    if (onBlurProp) {
      onBlurProp()
    }
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
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
    />
  )
}

export default FormattedNumberInput

