import api from './api'

export interface CompanyInfo {
  name?: string
  mission?: string
  vision?: string
  founded?: string
  values?: string[]
}

export interface FAQ {
  id: number
  question: string
  answer: string
  displayOrder?: number
}

export interface ContactInfo {
  id: number
  type: string
  title: string
  content: string
  link?: string
  displayOrder?: number
}

export interface Office {
  id: number
  name: string
  address: string
  phone: string
  email: string
  hours?: string
  latitude: number
  longitude: number
  displayOrder?: number
}

export interface ContactMessage {
  name: string
  email: string
  phone?: string
  message: string
}

export interface ApiResponse<T> {
  message: string
  data: T
  status: string
}

export const infoService = {
  getCompanyInfo: async () => {
    const response = await api.get<ApiResponse<Record<string, string>>>('/info/company')
    return response.data
  },

  getFAQs: async () => {
    const response = await api.get<ApiResponse<FAQ[]>>('/info/faqs')
    return response.data
  },

  getContactInfo: async () => {
    const response = await api.get<ApiResponse<ContactInfo[]>>('/info/contact')
    return response.data
  },

  getOffices: async () => {
    const response = await api.get<ApiResponse<Office[]>>('/info/offices')
    return response.data
  },

  createContactMessage: async (data: ContactMessage) => {
    const response = await api.post<ApiResponse<ContactMessage>>('/info/contact/message', data)
    return response.data
  },
}

