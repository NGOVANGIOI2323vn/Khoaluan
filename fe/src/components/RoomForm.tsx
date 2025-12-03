import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import FormattedNumberInput from './FormattedNumberInput'

// Validation schema for a single room
const roomSchema = z.object({
  number: z
    .string()
    .min(1, 'Số phòng là bắt buộc')
    .max(20, 'Số phòng không được quá 20 ký tự')
    .regex(/^[A-Za-z0-9\s-]+$/, 'Số phòng chỉ được chứa chữ cái, số, khoảng trắng và dấu gạch ngang'),
  price: z
    .number({
      message: 'Giá phòng phải là số',
    })
    .min(10000, 'Giá phòng tối thiểu là 10,000 VND')
    .max(100000000, 'Giá phòng không được vượt quá 100 triệu VND'),
  image: z
    .instanceof(File, { message: 'Vui lòng chọn ảnh phòng' })
    .nullable()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: 'Kích thước ảnh không được vượt quá 5MB',
    })
    .refine(
      (file) => !file || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      {
        message: 'Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, WEBP)',
      }
    ),
})

// Validation schema for multiple rooms
const roomsFormSchema = z.object({
  rooms: z
    .array(roomSchema)
    .min(1, 'Phải có ít nhất một phòng')
    .max(50, 'Không được tạo quá 50 phòng cùng lúc'),
})

export type RoomFormData = z.infer<typeof roomsFormSchema>

interface RoomFormProps {
  onSubmit: (data: RoomFormData) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

const RoomForm = ({ onSubmit, onCancel, isSubmitting = false }: RoomFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomsFormSchema),
    defaultValues: {
      rooms: [{ number: '', price: 0, image: null }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rooms',
  })

  const rooms = watch('rooms')

  const onFormSubmit = async (data: RoomFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Danh sách phòng</h3>
        <button
          type="button"
          onClick={() => append({ number: '', price: 0, image: null })}
          disabled={fields.length >= 50}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Thêm phòng
        </button>
      </div>

      {errors.rooms && errors.rooms.root && (
        <p className="text-sm text-red-500 mb-4">{errors.rooms.root.message}</p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Room Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số phòng <span className="text-red-500">*</span>
                </label>
                <input
                  {...control.register(`rooms.${index}.number`)}
                  type="text"
                  className={`w-full px-4 py-2.5 rounded-xl border-2 transition ${
                    errors.rooms?.[index]?.number
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="VD: 101, A101"
                />
                {errors.rooms?.[index]?.number && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.rooms[index]?.number?.message}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá (VND) <span className="text-red-500">*</span>
                </label>
                <Controller
                  name={`rooms.${index}.price`}
                  control={control}
                  render={({ field: priceField }) => (
                    <FormattedNumberInput
                      value={priceField.value || 0}
                      onChange={(value) => {
                        priceField.onChange(value)
                      }}
                      placeholder="Nhập giá phòng"
                      className={`w-full px-4 py-2.5 rounded-xl border-2 transition ${
                        errors.rooms?.[index]?.price
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      min={10000}
                      max={100000000}
                      required
                    />
                  )}
                />
                {errors.rooms?.[index]?.price && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.rooms[index]?.price?.message}
                  </p>
                )}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh phòng <span className="text-red-500">*</span>
                </label>
                <Controller
                  name={`rooms.${index}.image`}
                  control={control}
                  render={({ field: imageField }) => (
                    <>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            imageField.onChange(file)
                          }
                        }}
                        className="w-full text-sm text-gray-600"
                      />
                      {(() => {
                        const image = rooms[index]?.image
                        return image && image instanceof File ? (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(image)}
                              alt="Preview"
                              className="w-full h-20 object-cover rounded-xl"
                            />
                            <p className="text-xs text-green-600 mt-1">
                              Đã chọn: {image.name}
                            </p>
                          </div>
                        ) : null
                      })()}
                    </>
                  )}
                />
                {errors.rooms?.[index]?.image && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.rooms[index]?.image?.message}
                  </p>
                )}
              </div>
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Xóa phòng
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || fields.length === 0}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Lưu'}
        </button>
      </div>
    </form>
  )
}

export default RoomForm

