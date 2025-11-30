import axios from 'axios'

class CloudinaryService {
  private cloudName: string
  private uploadPreset: string

  constructor() {
    // Load from environment variables
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dp489la7s'
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'hotels'
  }

  async uploadImage(file: File): Promise<CloudinaryResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', this.uploadPreset)
      formData.append('folder', 'hotels')

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        formData
      )

      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } }; status?: number }; message?: string }
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
      const err = error as { response?: { data?: unknown }; message?: string }
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

