import { getBooks } from '@/src/actions/api/books.actions';

export async function booksFetcher(
  page: number,
  pageSize = 12
) {
  const response = await getBooks(page, pageSize)

  return response.data
}