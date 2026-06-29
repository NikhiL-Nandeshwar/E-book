export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://kopbnkassobook.runasp.net/restapi/v1.0';

export const API_ENDPOINTS = {
  auth: {
    login: 'Auth/Login',
    register: 'Auth/Register',
    verifyOtp: 'Auth/VerifyOtp',
    resendOtp: 'Auth/ResendOtp',
    forgotPassword: 'Auth/ForgotPassword',
    resetPassword: 'Auth/ResetPassword',
  },
  account: {
    me: 'Account/Me',
    changePassword: 'Account/ChangePassword',
    logout: 'Account/Logout',
  },
  book: {
    create: 'Book/Create',
    update: 'Book/Update',
    getAll: 'Book/GetAll',
    getById: (bookId: number) => `Book/GetById/${bookId}`,
    toggleActive: (bookId: number) => `Book/ToggleActive/${bookId}`,
  },
} as const;
