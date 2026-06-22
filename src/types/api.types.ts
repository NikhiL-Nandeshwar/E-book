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
  token: string;
  refreshToken?: string;

  role?: string;
  userId?: number;
  candidateId?: number | null;
  fullName?: string;
  email?: string;
  isEmailVerified?: boolean;

  tokenExpiry?: string;
  tokenExpiryUnix?: number;

  accessTokenExpiryMinutes?: number;
  refreshTokenExpiryDays?: number;
};
