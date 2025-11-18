import api from './api'
import type { Hotel } from './hotelService'

export interface ChatResponse {
  message: string
  hotels: Hotel[]
}

export const chatService = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/chat', { message })
    return response.data
  },
}

