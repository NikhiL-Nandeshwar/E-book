/**
 * Typed wrappers for Auth / Account endpoints.
 * The frontend treats the backend as the source of truth for session state.
 */

import { apiFetch, type ApiResponse } from './api-client'

export interface LoginResponseData {
  userId: number
  fullName: string
  email: string
  mobile: string
  role: string
  isEmailVerified?: boolean
  profilePicUrl?: string | null
  accessToken?: string
  refreshToken?: string | null
  tokenExpiry?: string
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

export type AuthUser = {
  userId: number
  fullName: string
  name: string
  email: string
  mobile: string
  role: string
  profilePicUrl?: string | null
  isEmailVerified?: boolean
}

export const mapUserProfileToAuthUser = (profile: UserProfileData): AuthUser => ({
  userId: profile.userId,
  fullName: profile.fullName,
  name: profile.fullName,
  email: profile.email,
  mobile: profile.mobile,
  role: profile.role,
  profilePicUrl: profile.profilePicUrl,
  isEmailVerified: profile.isEmailVerified,
})

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

export const loginApi = (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> =>
  apiFetch<LoginResponseData>('Auth/Login', {
    method: 'POST',
    body: payload,
  })

export const registerApi = (payload: RegisterPayload): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Auth/Register', {
    method: 'POST',
    body: payload,
  })

export const verifyOtpApi = (payload: VerifyOtpPayload): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Auth/VerifyOtp', {
    method: 'POST',
    body: payload,
  })

export const resendOtpApi = (payload: ResendOtpPayload): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Auth/ResendOtp', {
    method: 'POST',
    body: payload,
  })

export const forgotPasswordApi = (
  payload: ForgotPasswordPayload,
): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Auth/ForgotPassword', {
    method: 'POST',
    body: payload,
  })

export const resetPasswordApi = (
  payload: ResetPasswordPayload,
): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Auth/ResetPassword', {
    method: 'POST',
    body: payload,
  })

export const changePasswordApi = (
  payload: ChangePasswordPayload,
): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Account/ChangePassword', {
    method: 'POST',
    body: payload,
  })

export const logoutApi = (): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>('Account/Logout', { method: 'POST' })

export const getMeApi = (): Promise<ApiResponse<UserProfileData>> =>
  apiFetch<UserProfileData>('Account/Me')

export const getCurrentUserApi = getMeApi


