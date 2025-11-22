import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import UploadImage from './UploadImage'

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
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được quá 15 số'),
  description: z.string().max(1000, 'Mô tả không được quá 1000 ký tự').optional(),
})

export type HotelFormData = z.infer<typeof hotelSchema>

interface HotelFormProps {
  onSubmit: (data: HotelFormData, images: File[]) => void | Promise<void>
  defaultValues?: Partial<HotelFormData>
  defaultImages?: File[]
  existingImages?: Array<{ id: number; imageUrl: string }>
  onRemoveExistingImage?: (id: number) => void
  submitLabel?: string
  isSubmitting?: boolean
  onCancel?: () => void
}

const HotelForm = ({
  onSubmit,
  defaultValues,
  defaultImages = [],
  existingImages = [],
  onRemoveExistingImage,
  submitLabel = 'Lưu',
  isSubmitting = false,
  onCancel,
}: HotelFormProps) => {
  const [images, setImages] = useState<File[]>(defaultImages)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: defaultValues || {
      name: '',
      address: '',
      phone: '',
      description: '',
    },
  })

  const onFormSubmit = async (data: HotelFormData) => {
    await onSubmit(data, images)
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
          {...register('phone')}
          type="tel"
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all
            ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
          `}
          placeholder="VD: 0123456789"
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
          disabled={isSubmitting || (images.length === 0 && existingImages.length === 0)}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isSubmitting ? 'Đang xử lý...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default HotelForm

