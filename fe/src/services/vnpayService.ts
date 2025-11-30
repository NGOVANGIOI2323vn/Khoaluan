import api from './api'

export interface VnpayCreateResponse {
  url: string
}

export const vnpayService = {
  createPayment: async (amount: number, orderInfo: string, orderType: string) => {
    const response = await api.post<VnpayCreateResponse>('/vnpay/create', null, {
      params: {
        amount: amount * 100, // VNPay tính bằng xu
        orderInfo,
        orderType,
      },
    })
    return response.data
  },
}

