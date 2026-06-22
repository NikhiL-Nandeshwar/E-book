import { API_ENDPOINTS } from "@/src/constants/api.constants";
import { apiRequest } from "./client";
import { ApiPagedResult, Book } from "@/src/types/api.types";

export function getBooks() {
  return apiRequest<ApiPagedResult<Book>>(API_ENDPOINTS.book.getAll, {
    method: 'GET',
  });
}