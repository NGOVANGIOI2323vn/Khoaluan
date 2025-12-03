import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import FormattedNumberInput from './FormattedNumberInput'

// Validation schema
const withdrawSchema = z.object({
  amount: z
    .number({
      message: 'Số tiền phải là số',
    })
    .min(1, 'Số tiền phải lớn hơn 0')
    .refine((val) => val > 0, {
      message: 'Số tiền phải lớn hơn 0',
    }),
  bankName: z
    .string()
    .min(2, 'Tên ngân hàng phải có ít nhất 2 ký tự')
    .max(50, 'Tên ngân hàng không được quá 50 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên ngân hàng chỉ được chứa chữ cái và khoảng trắng'),
  accountNumber: z
    .string()
    .min(8, 'Số tài khoản phải có ít nhất 8 số')
    .max(20, 'Số tài khoản không được quá 20 số')
    .regex(/^[0-9]+$/, 'Số tài khoản chỉ được chứa số'),
  accountHolderName: z
    .string()
    .min(2, 'Tên chủ tài khoản phải có ít nhất 2 ký tự')
    .max(100, 'Tên chủ tài khoản không được quá 100 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chủ tài khoản chỉ được chứa chữ cái và khoảng trắng'),
}).refine(
  (data) => {
    // Additional validation: amount should be reasonable (max 1 billion)
    return data.amount <= 1000000000
  },
  {
    message: 'Số tiền không được vượt quá 1 tỷ VND',
    path: ['amount'],
  }
)

export type WithdrawFormData = z.infer<typeof withdrawSchema>

interface WithdrawFormProps {
  onSubmit: (data: WithdrawFormData) => void | Promise<void>
  onCancel?: () => void
  maxAmount?: number
  isSubmitting?: boolean
}

const WithdrawForm = ({
  onSubmit,
  onCancel,
  maxAmount,
  isSubmitting = false,
}: WithdrawFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
    },
  })

  const onFormSubmit = async (data: WithdrawFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Amount */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Số tiền (VND) <span className="text-red-500">*</span>
        </label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <FormattedNumberInput
              value={field.value || 0}
              onChange={(value) => {
                field.onChange(value)
                setValue('amount', value, { shouldValidate: true })
              }}
              placeholder="Nhập số tiền"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
              min={1}
              max={maxAmount}
              required
            />
          )}
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
        )}
        {maxAmount !== null && maxAmount !== undefined && (
          <p className="text-xs text-gray-500 mt-1">
            Số dư hiện có: {Number(maxAmount).toLocaleString('vi-VN')} VND
          </p>
        )}
      </div>

      {/* Bank Name */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Tên ngân hàng <span className="text-red-500">*</span>
        </label>
        <input
          {...control.register('bankName')}
          type="text"
          className={`w-full px-4 py-2 border rounded-lg transition ${
            errors.bankName
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } focus:outline-none focus:ring-2`}
          placeholder="VD: Vietcombank"
        />
        {errors.bankName && (
          <p className="mt-1 text-sm text-red-500">{errors.bankName.message}</p>
        )}
      </div>

      {/* Account Number */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Số tài khoản <span className="text-red-500">*</span>
        </label>
        <input
          {...control.register('accountNumber')}
          type="text"
          inputMode="numeric"
          className={`w-full px-4 py-2 border rounded-lg transition ${
            errors.accountNumber
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } focus:outline-none focus:ring-2`}
          placeholder="Nhập số tài khoản"
        />
        {errors.accountNumber && (
          <p className="mt-1 text-sm text-red-500">{errors.accountNumber.message}</p>
        )}
      </div>

      {/* Account Holder Name */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Tên chủ tài khoản <span className="text-red-500">*</span>
        </label>
        <input
          {...control.register('accountHolderName')}
          type="text"
          className={`w-full px-4 py-2 border rounded-lg transition ${
            errors.accountHolderName
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } focus:outline-none focus:ring-2`}
          placeholder="Nhập tên chủ tài khoản"
        />
        {errors.accountHolderName && (
          <p className="mt-1 text-sm text-red-500">{errors.accountHolderName.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang xử lý...</span>
            </>
          ) : (
            'Gửi yêu cầu'
          )}
        </button>
      </div>
    </form>
  )
}

export default WithdrawForm

