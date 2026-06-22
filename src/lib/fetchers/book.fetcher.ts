import { getBooks } from '@/src/actions/api/books.actions';

export async function latestBooksFetcher() {
  const response = await getBooks();
  return response.data.items.slice(0, 4);
}