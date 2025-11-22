import axios from 'axios'

class CloudinaryService {
  private cloudName: string
  private uploadPreset: string
  private apiKey: string
  private apiSecret: string

  constructor() {
    // Load from environment variables
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dp489la7s'
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'hotels'
    this.apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || '268894864221893'
    this.apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET || 'BCqxYjSQMTze0JAfptBmOfGl1-s'
  }

  async uploadImage(file: File): Promise<CloudinaryResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', this.uploadPreset)
      formData.append('folder', 'hotels')

      console.log('Uploading to Cloudinary with preset:', this.uploadPreset)
      console.log('Cloud name:', this.cloudName)
      console.log('Folder:', 'hotels')
      console.log('File size:', file.size, 'bytes')
      console.log('File type:', file.type)

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        formData
      )

      console.log('Cloudinary response:', response.data)
      return response.data
    } catch (error: unknown) {
      console.error('Error uploading to Cloudinary:', error)
      const err = error as { response?: { data?: { error?: { message?: string } }; status?: number }; message?: string }
      if (err.response) {
        console.error('Response data:', err.response.data)
        console.error('Response status:', err.response.status)
        if (err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data) {
          const errorData = err.response.data.error as { message?: string }
          console.error('Detailed error:', errorData.message)
        }
      }
      throw new Error(
        `Failed to upload image to Cloudinary: ${err.message || 'Unknown error'}`
      )
    }
  }

  async uploadBase64Image(base64String: string): Promise<CloudinaryResponse> {
    try {
      const formData = new FormData()
      formData.append('file', base64String)
      formData.append('upload_preset', this.uploadPreset)
      formData.append('folder', 'hotels')

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        formData
      )

      return response.data
    } catch (error: unknown) {
      console.error('Error uploading base64 to Cloudinary:', error)
      const err = error as { response?: { data?: unknown }; message?: string }
      if (err.response) {
        console.error('Response data:', err.response.data)
        console.error('Response status:', err.response.status)
      }
      throw new Error(
        `Failed to upload base64 image to Cloudinary: ${err.message || 'Unknown error'}`
      )
    }
  }
}

export interface CloudinaryResponse {
  secure_url: string
  public_id: string
  asset_id?: string
  url?: string
  format?: string
  width?: number
  height?: number
  resource_type?: string
}

export default new CloudinaryService()

