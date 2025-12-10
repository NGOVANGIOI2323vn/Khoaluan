import api from './api'

export interface GeocodeResult {
  lat: number
  lng: number
  formattedAddress: string
  status: string
  error?: string
}

export interface ApiResponse<T> {
  status: number
  message: string
  data: T
  error: string | null
}

export const geocodingService = {
  /**
   * Geocode địa chỉ để lấy latitude và longitude
   * @param address Địa chỉ cần geocode
   * @returns Promise<GeocodeResult>
   */
  geocodeAddress: async (address: string): Promise<GeocodeResult> => {
    try {
      const formData = new FormData()
      formData.append('address', address)
      const response = await api.post<ApiResponse<GeocodeResult>>(
        '/geocoding/geocode-address',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      throw new Error('Invalid response from geocoding service')
    } catch (error: unknown) {
      console.error('Geocoding error:', error)
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      throw new Error(
        err.response?.data?.message || 
        err.message || 
        'Không thể lấy tọa độ từ địa chỉ'
      )
    }
  },
}

