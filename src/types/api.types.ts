export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: string[] | Record<string, string[]> | string | null;
  timestamp: string;
};

export type ApiPagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export interface Book {
  bookId: number
  title: string
  slug: string
  authorName: string
  categoryName: string
  coverImageUrl: string
  shortSummary: string | null
  language: string
  price: number
  isFeatured: boolean
  isActive: boolean
  isOwned: boolean
  totalPurchases: number
}

export type LoginResponse = {
  userId: number
  fullName: string
  email: string
  mobile: string
  role: string
  candidateId?: number | null
  isEmailVerified?: boolean
  profilePicUrl?: string | null
  accessToken?: string
  refreshToken?: string | null
  tokenExpiry?: string
  tokenExpiryUnix?: number
  accessTokenExpiryMinutes?: number
  refreshTokenExpiryDays?: number
};
