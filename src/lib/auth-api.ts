/**
 * Typed wrappers for every Auth / Account endpoint in the BookVault API.
 *
 * Routes (from the C# backend):
 *   POST  restapi/v1.0/Auth/Register
 *   POST  restapi/v1.0/Auth/VerifyOtp
 *   POST  restapi/v1.0/Auth/ResendOtp
 *   POST  restapi/v1.0/Auth/Login
 *   POST  restapi/v1.0/Auth/RefreshToken
 *   POST  restapi/v1.0/Auth/ForgotPassword
 *   POST  restapi/v1.0/Auth/ResetPassword
 *   POST  restapi/v1.0/Account/ChangePassword
 *   POST  restapi/v1.0/Account/Logout
 *   GET   restapi/v1.0/Account/Me
 */

import { apiFetch, type ApiResponse } from './api-client'

// ── Response shapes ──────────────────────────────────────────────────────────

export interface LoginResponseData {
  userId: number
  fullName: string
  email: string
  mobile: string
  role: string
  accessToken: string
  refreshToken: string | null
  tokenExpiry: string
}

export interface TokenRefreshData {
  accessToken: string
  refreshToken: string | null
  tokenExpiry: string
}

export interface UserProfileData {
  userId: number
  fullName: string
  roleId: number
  role: string
  email: string
  mobile: string
  profilePicUrl: string | null
  isEmailVerified: boolean
  createdAt: string
}

// ── Request payloads ─────────────────────────────────────────────────────────

export interface RegisterPayload {
  fullName: string
  email: string
  mobile: string
  password: string
  confirmPassword: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface ResendOtpPayload {
  email: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ── API functions ────────────────────────────────────────────────────────────

export const loginApi = (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> =>
  apiFetch<LoginResponseData>('Auth/Login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const registerApi = (payload: RegisterPayload): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Auth/Register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const verifyOtpApi = (payload: VerifyOtpPayload): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Auth/VerifyOtp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const resendOtpApi = (payload: ResendOtpPayload): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Auth/ResendOtp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const refreshTokenApi = (): Promise<ApiResponse<TokenRefreshData>> =>
  apiFetch<TokenRefreshData>('Auth/RefreshToken', { method: 'POST' })

export const forgotPasswordApi = (
  payload: ForgotPasswordPayload,
): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Auth/ForgotPassword', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const resetPasswordApi = (
  payload: ResetPasswordPayload,
): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Auth/ResetPassword', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const changePasswordApi = (
  payload: ChangePasswordPayload,
): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Account/ChangePassword', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const logoutApi = (): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Account/Logout', { method: 'POST' })

export const getMeApi = (): Promise<ApiResponse<UserProfileData>> =>
  apiFetch<UserProfileData>('Account/Me')
