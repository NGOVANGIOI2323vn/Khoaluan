import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Validation schema
const adminPercentSchema = z.object({
  percent: z
    .number()
    .min(0, 'Tỷ lệ phần trăm không được nhỏ hơn 0%')
    .max(100, 'Tỷ lệ phần trăm không được lớn hơn 100%')
    .refine((val) => val >= 0 && val <= 100, {
      message: 'Tỷ lệ phần trăm phải từ 0% đến 100%',
    }),
})

export type AdminPercentFormData = z.infer<typeof adminPercentSchema>

interface AdminPercentFormProps {
  onSubmit: (data: AdminPercentFormData) => void | Promise<void>
  defaultValue?: number
  isSubmitting?: boolean
}

const AdminPercentForm = ({
  onSubmit,
  defaultValue,
  isSubmitting = false,
}: AdminPercentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminPercentFormData>({
    resolver: zodResolver(adminPercentSchema),
    defaultValues: {
      percent: defaultValue ? defaultValue * 100 : 0,
    },
  })

  const onFormSubmit = async (data: AdminPercentFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tỷ lệ phần trăm Admin (%) <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            {...register('percent', {
              valueAsNumber: true,
            })}
            type="number"
            step="0.1"
            min="0"
            max="100"
            className={`flex-1 px-4 py-2 border rounded-lg transition ${
              errors.percent
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            } focus:outline-none focus:ring-2`}
            placeholder="Nhập tỷ lệ phần trăm (0-100)"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
          >
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        </div>
        {errors.percent && (
          <p className="mt-1 text-sm text-red-500">{errors.percent.message}</p>
        )}
        {defaultValue !== undefined && (
          <p className="text-sm text-gray-600 mt-2">
            Giá trị hiện tại: {(defaultValue * 100).toFixed(1)}%
          </p>
        )}
      </div>
    </form>
  )
}

export default AdminPercentForm

