import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface UploadImageProps {
  images: File[]
  onImagesChange: (files: File[]) => void
  maxImages?: number
  multiple?: boolean
  label?: string
  existingImages?: Array<{ id: number; imageUrl: string }>
  onRemoveExisting?: (id: number) => void
}

const UploadImage = ({
  images,
  onImagesChange,
  maxImages = 10,
  multiple = true,
  label = 'Upload ảnh',
  existingImages = [],
  onRemoveExisting,
}: UploadImageProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter((file) => file.type.startsWith('image/'))
    const remainingSlots = maxImages - images.length

    if (remainingSlots <= 0) {
      return
    }

    const filesToAdd = imageFiles.slice(0, remainingSlots)
    onImagesChange([...images, ...filesToAdd])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {multiple && (
            <span className="text-gray-500 font-normal ml-2">
              ({images.length}/{maxImages})
            </span>
          )}
        </label>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-2">Ảnh hiện tại:</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.imageUrl}
                  alt="Existing"
                  className="w-full h-20 sm:h-24 object-cover rounded-xl border-2 border-gray-200"
                />
                {onRemoveExisting && (
                  <button
                    onClick={() => onRemoveExisting(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-2xl p-4 sm:p-6 md:p-8 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center gap-3"
        >
          {isDragging ? (
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-500" />
          ) : (
            <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WEBP (tối đa {maxImages} ảnh)
            </p>
          </div>
        </motion.div>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div>
          <p className="text-xs text-green-600 font-medium mb-2">
            Đã chọn {images.length} ảnh:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 sm:h-24 object-cover rounded-xl border-2 border-gray-200"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadImage

