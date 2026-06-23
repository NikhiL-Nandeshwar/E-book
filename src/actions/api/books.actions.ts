import { API_ENDPOINTS } from "@/src/constants/api.constants";
import { apiRequest } from "./client";
import { ApiPagedResult, Book } from "@/src/types/api.types";

export function getBooks(page = 1, pageSize = 12) {
  return apiRequest<ApiPagedResult<Book>>(
    `${API_ENDPOINTS.book.getAll}?page=${page}&pageSize=${pageSize}`,
    {
      method: 'GET',
    }
  );
}