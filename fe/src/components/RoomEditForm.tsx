import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const roomTypes = ['STANDARD', 'DELUXE', 'SUITE', 'SUPERIOR', 'EXECUTIVE', 'FAMILY', 'STUDIO']

// Validation schema
const roomEditSchema = z.object({
  type: z
    .string()
    .min(1, 'Vui lòng chọn loại phòng')
    .refine((val) => roomTypes.includes(val), {
      message: 'Loại phòng không hợp lệ',
    }),
  capacity: z
    .number({
      message: 'Sức chứa là bắt buộc và phải là số',
    })
    .int('Sức chứa phải là số nguyên')
    .min(1, 'Sức chứa tối thiểu là 1 người')
    .max(20, 'Sức chứa tối đa là 20 người'),
  discountPercent: z
    .number({
      message: 'Giảm giá là bắt buộc và phải là số',
    })
    .min(0, 'Giảm giá không được nhỏ hơn 0%')
    .max(100, 'Giảm giá không được lớn hơn 100%'),
  image: z
    .instanceof(File, { message: 'Vui lòng chọn ảnh phòng' })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'Kích thước ảnh không được vượt quá 5MB',
    })
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      {
        message: 'Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, WEBP)',
      }
    )
    .optional()
    .nullable(),
}).refine(
  (data) => {
    // If image is provided, it must be valid
    if (data.image !== null && data.image !== undefined) {
      return data.image instanceof File
    }
    return true
  },
  {
    message: 'Ảnh phòng không hợp lệ',
    path: ['image'],
  }
)

export type RoomEditFormData = z.infer<typeof roomEditSchema>

interface RoomEditFormProps {
  onSubmit: (data: RoomEditFormData) => void | Promise<void>
  onCancel?: () => void
  defaultValues?: {
    type?: string
    capacity?: number
    discountPercent?: number
    imageUrl?: string
  }
  isSubmitting?: boolean
}

const RoomEditForm = ({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
}: RoomEditFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RoomEditFormData>({
    resolver: zodResolver(roomEditSchema),
    defaultValues: {
      type: defaultValues?.type || '',
      capacity: defaultValues?.capacity || 1,
      discountPercent: defaultValues?.discountPercent ? defaultValues.discountPercent * 100 : 0,
      image: undefined,
    },
  })

  const image = watch('image')
  const existingImageUrl = defaultValues?.imageUrl

  const onFormSubmit = async (data: RoomEditFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Cập nhật thông tin phòng</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Room Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Loại phòng <span className="text-red-500">*</span>
          </label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition ${
                  errors.type
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">Chọn loại phòng</option>
                {roomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.type && (
            <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>
          )}
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Sức chứa <span className="text-red-500">*</span>
          </label>
          <Controller
            name="capacity"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="1"
                max="20"
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition ${
                  errors.capacity
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            )}
          />
          {errors.capacity && (
            <p className="mt-1 text-xs text-red-500">{errors.capacity.message}</p>
          )}
        </div>

        {/* Discount Percent */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Giảm giá (%) <span className="text-red-500">*</span>
          </label>
          <Controller
            name="discountPercent"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="0"
                max="100"
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition ${
                  errors.discountPercent
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            )}
          />
          {errors.discountPercent && (
            <p className="mt-1 text-xs text-red-500">{errors.discountPercent.message}</p>
          )}
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-semibold mb-2">Ảnh phòng</label>
          <Controller
            name="image"
            control={control}
            render={({ field: { onChange, onBlur, name, ref } }) => (
              <>
                <input
                  ref={ref}
                  name={name}
                  onBlur={onBlur}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    onChange(file || null)
                  }}
                  className="w-full text-sm text-gray-600"
                />
                {existingImageUrl && !image && (
                  <img
                    src={existingImageUrl}
                    alt="Current room"
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                  />
                )}
                {image && image instanceof File && (
                  <>
                    <img
                      src={URL.createObjectURL(image)}
                      alt="New room"
                      className="mt-2 w-full h-32 object-cover rounded-lg"
                    />
                    <p className="text-xs text-green-600 mt-1">Đã chọn: {image.name}</p>
                  </>
                )}
              </>
            )}
          />
          {errors.image && (
            <p className="mt-1 text-xs text-red-500">{errors.image.message}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  )
}

export default RoomEditForm

