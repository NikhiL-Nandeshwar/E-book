import { apiFetch, type ApiResponse } from './api-client'

export interface CreateOrderPayload {
  bookId: number
}

export interface CreateOrderResponseData {
  orderId: number
  razorpayOrderId: string
  amount: number
  amountInPaise: number
  currency: string
  bookTitle: string
  razorpayKeyId: string
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface VerifyPaymentResponseData {
  orderId: number
  bookId: number
  bookTitle: string
  bookSlug: string
  amountPaid: number
}

export const createOrderApi = (
  payload: CreateOrderPayload,
): Promise<ApiResponse<CreateOrderResponseData>> =>
  apiFetch<CreateOrderResponseData>('OrderTransaction/CreateOrder', {
    method: 'POST',
    body: payload,
  })

export const verifyPaymentApi = (
  payload: VerifyPaymentPayload,
): Promise<ApiResponse<VerifyPaymentResponseData>> =>
  apiFetch<VerifyPaymentResponseData>('OrderTransaction/VerifyPayment', {
    method: 'POST',
    body: payload,
  })

