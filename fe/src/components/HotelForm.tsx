import { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import UploadImage from './UploadImage'
import FormattedNumberInput from './FormattedNumberInput'
import { Plus, X } from 'lucide-react'

// Validation schema
const hotelSchema = z.object({
  name: z
    .string()
    .min(3, 'Tên khách sạn phải có ít nhất 3 ký tự')
    .max(100, 'Tên khách sạn không được quá 100 ký tự'),
  address: z
    .string()
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
    .max(200, 'Địa chỉ không được quá 200 ký tự'),
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^[0-9]{9,10}$/, 'Số điện thoại phải có 9 hoặc 10 chữ số (chỉ số)')
    .refine((val) => {
      const cleaned = val.replace(/\D/g, '')
      return cleaned.length >= 9 && cleaned.length <= 10
    }, {
      message: 'Số điện thoại phải có 9 hoặc 10 chữ số',
    }),
  description: z.string().max(1000, 'Mô tả không được quá 1000 ký tự').optional(),
})

// Room schema
const roomSchema = z.object({
  number: z
    .string()
    .min(1, 'Số phòng là bắt buộc')
    .max(20, 'Số phòng không được quá 20 ký tự'),
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
    )
    .optional(), // Cho phép null khi có existing image
})

// Extended hotel schema with rooms
const hotelSchemaWithRooms = hotelSchema.extend({
  rooms: z
    .array(roomSchema)
    .min(1, 'Phải có ít nhất một phòng')
    .max(50, 'Không được tạo quá 50 phòng cùng lúc')
    .refine(
      (rooms) => rooms.every((room) => room.image !== null || room.image !== undefined),
      {
        message: 'Mỗi phòng phải có ảnh (mới hoặc hiện tại)',
      }
    ),
})

export type HotelFormData = z.infer<typeof hotelSchema>
export type HotelFormDataWithRooms = z.infer<typeof hotelSchemaWithRooms>

interface HotelFormProps {
  onSubmit: (data: HotelFormData, images: File[], rooms: Array<{ number: string; price: number; image: File | null; existingImageUrl?: string }>) => void | Promise<void>
  defaultValues?: Partial<HotelFormData>
  defaultImages?: File[]
  existingImages?: Array<{ id: number; imageUrl: string }>
  onRemoveExistingImage?: (id: number) => void
  defaultRooms?: Array<{ number: string; price: number; image: File | null; existingImageUrl?: string }>
  submitLabel?: string
  isSubmitting?: boolean
  onCancel?: () => void
  showRooms?: boolean // Cho phép ẩn/hiện phần rooms (mặc định true khi tạo mới)
}

const HotelForm = ({
  onSubmit,
  defaultValues,
  defaultImages = [],
  existingImages = [],
  onRemoveExistingImage,
  defaultRooms = [{ number: '', price: 0, image: null }],
  submitLabel = 'Lưu',
  isSubmitting = false,
  onCancel,
  showRooms = true,
}: HotelFormProps) => {
  const [images, setImages] = useState<File[]>(defaultImages)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<HotelFormDataWithRooms>({
    resolver: zodResolver(hotelSchemaWithRooms),
    defaultValues: {
      ...(defaultValues || {
        name: '',
        address: '',
        phone: '',
        description: '',
      }),
      rooms: defaultRooms,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rooms',
  })

  const watchedRooms = watch('rooms')

  const onFormSubmit = async (data: HotelFormDataWithRooms) => {
    // Làm sạch số điện thoại trước khi gửi
    const cleanedData: HotelFormData = {
      name: data.name.trim(),
      address: data.address.trim(),
      phone: data.phone.replace(/\D/g, ''),
      description: data.description?.trim() || '',
    }
    
    // Extract rooms data with existing image URLs
    const roomsData = data.rooms.map((room, index) => {
      const defaultRoom = defaultRooms[index]
      return {
        number: room.number.trim(),
        price: room.price,
        image: room.image || null,
        existingImageUrl: defaultRoom?.existingImageUrl,
      }
    })
    
    await onSubmit(cleanedData, images, roomsData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tên khách sạn <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          type="text"
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all
            ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
          `}
          placeholder="Nhập tên khách sạn"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Địa chỉ <span className="text-red-500">*</span>
        </label>
        <input
          {...register('address')}
          type="text"
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all
            ${errors.address ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
          `}
          placeholder="Nhập địa chỉ khách sạn"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          placeholder="Nhập số điện thoại (9-10 số)"
          maxLength={10}
          {...register('phone', {
            onChange: (e) => {
              // Chỉ cho phép nhập số
              const value = e.target.value.replace(/\D/g, '')
              e.target.value = value
            },
          })}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all
            ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
          `}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mô tả
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all resize-none
            ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
          `}
          placeholder="Nhập mô tả khách sạn (tùy chọn)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Images */}
      <div>
        <UploadImage
          images={images}
          onImagesChange={setImages}
          maxImages={10}
          multiple={true}
          label="Ảnh khách sạn"
          existingImages={existingImages}
          onRemoveExisting={onRemoveExistingImage}
        />
        {images.length === 0 && existingImages.length === 0 && (
          <p className="mt-1 text-sm text-red-500">
            Vui lòng chọn ít nhất một ảnh
          </p>
        )}
      </div>

      {/* Rooms Section */}
      {showRooms && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">
              Phòng <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => append({ number: '', price: 0, image: null })}
              disabled={fields.length >= 50}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Thêm phòng
            </button>
          </div>

          {errors.rooms && errors.rooms.root && (
            <p className="text-sm text-red-500">{errors.rooms.root.message}</p>
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
                      {...register(`rooms.${index}.number`)}
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
                              const file = e.target.files?.[0] || null
                              imageField.onChange(file)
                            }}
                            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {(() => {
                            const existingImageUrl = defaultRooms[index]?.existingImageUrl
                            const newImage = watchedRooms[index]?.image
                            
                            if (newImage && newImage instanceof File) {
                              return (
                                <div className="mt-2">
                                  <img
                                    src={URL.createObjectURL(newImage)}
                                    alt="Preview"
                                    className="w-full h-20 object-cover rounded-xl"
                                  />
                                  <p className="text-xs text-green-600 mt-1">
                                    Đã chọn: {newImage.name}
                                  </p>
                                </div>
                              )
                            } else if (existingImageUrl) {
                              return (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-600 mb-1">Ảnh hiện tại:</p>
                                  <img
                                    src={existingImageUrl}
                                    alt="Existing room"
                                    className="w-full h-20 object-cover rounded-xl"
                                  />
                                  <p className="text-xs text-blue-600 mt-1">
                                    Chọn ảnh mới để thay thế
                                  </p>
                                </div>
                              )
                            }
                            return null
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
                    className="mt-3 flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <X className="w-4 h-4" />
                    Xóa phòng
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
          disabled={
            isSubmitting || 
            (images.length === 0 && existingImages.length === 0) ||
            (showRooms && fields.length === 0)
          }
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isSubmitting ? 'Đang xử lý...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default HotelForm

