export interface Book {
  id: string
  title: string
  author: string
  price: number
  image: string
  description: string
  summary: string
  longDescription: string
  genre: string
  rating: number
  pages: number
  format: string
  featured: boolean
  isPurchased?: boolean
}

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    description: 'A luminous novel about second chances, parallel lives, and choosing what matters most.',
    summary:
      'Nora Seed steps into a mysterious library between life and death, where every shelf holds a different version of the life she could have lived.',
    longDescription:
      'Balancing emotional depth with page-turning momentum, this story explores regret, possibility, and hope through a high-concept fantasy setup that feels intimate and deeply human. It is the kind of title that performs beautifully in an ebook storefront because it pairs a compelling visual identity with a clear hook readers instantly understand.',
    genre: 'Fiction',
    rating: 4.7,
    pages: 304,
    format: 'EPUB + PDF',
    featured: true,
  },
  {
    id: '2',
    title: 'Educated',
    author: 'Tara Westover',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=900&q=80',
    description: 'An unforgettable memoir about self-invention, resilience, and the power of learning.',
    summary:
      'Raised in a survivalist family, Tara Westover charts her path from rural isolation to the world of higher education.',
    longDescription:
      'This memoir carries emotional intensity, strong reader reviews, and broad cross-category appeal. In a client demo, it helps show that the platform can support premium nonfiction titles with a polished, bookstore-like presentation that feels curated rather than generic.',
    genre: 'Memoir',
    rating: 4.8,
    pages: 352,
    format: 'EPUB',
    featured: true,
  },
  {
    id: '3',
    title: 'Atomic Habits',
    author: 'James Clear',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1507842217343-583f20270e1b?auto=format&fit=crop&w=900&q=80',
    description: 'A practical, bestselling guide to building better systems and sustainable habits.',
    summary:
      'Learn how tiny improvements compound over time and how environment, identity, and repetition shape lasting change.',
    longDescription:
      'Ideal for demonstrating business-focused and self-improvement content, this title helps communicate that the platform is not limited to fiction. It also fits a mobile-first audience, where quick sampling, appealing cover treatment, and actionable summaries matter.',
    genre: 'Self Growth',
    rating: 4.9,
    pages: 320,
    format: 'PDF',
    featured: true,
    isPurchased: true,
  },
  {
    id: '4',
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=900&q=80',
    description: 'A romantic, lyrical retelling of the Trojan War through the eyes of Patroclus.',
    summary:
      'Ancient myth meets intimate storytelling in a sweeping novel about loyalty, destiny, and love.',
    longDescription:
      'Rich, emotional, and visually evocative, this book is especially useful for presenting premium fiction merchandising. It gives the interface a cinematic feel when paired with immersive imagery and elevated typography.',
    genre: 'Mythology',
    rating: 4.8,
    pages: 416,
    format: 'EPUB',
    featured: false,
  },
  {
    id: '5',
    title: 'Circe',
    author: 'Madeline Miller',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80',
    description: 'A bold feminist myth retold with magic, exile, and transformation at its heart.',
    summary:
      'Banished to a remote island, Circe discovers the depth of her power and her place among gods and mortals.',
    longDescription:
      'This title gives the storefront strong editorial personality. It supports category browsing, high-end detail pages, and aspirational cover-first design inspired by major ebook platforms.',
    genre: 'Fantasy',
    rating: 4.6,
    pages: 400,
    format: 'EPUB + PDF',
    featured: false,
  },
  {
    id: '6',
    title: 'Dune',
    author: 'Frank Herbert',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=900&q=80',
    description: 'An epic science fiction saga of power, prophecy, survival, and empire.',
    summary:
      'Paul Atreides enters the harsh politics of Arrakis, a desert planet whose future will reshape the galaxy.',
    longDescription:
      'Large, immersive narratives like this are perfect for showing how your platform can balance serious content with a premium ecommerce feel. It also works especially well in a library grid and protected-reader flow.',
    genre: 'Sci-Fi',
    rating: 4.9,
    pages: 544,
    format: 'PDF',
    featured: false,
    isPurchased: true,
  },
  {
    id: '7',
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80',
    description: 'A glamorous, emotional Hollywood drama full of secrets, ambition, and reinvention.',
    summary:
      'A reclusive icon finally shares the truth behind her legendary career and complicated loves.',
    longDescription:
      'A highly marketable mainstream title that brings a cinematic editorial energy to the collection. Great for demonstrating featured carousels, recommendation rows, and polished product-style detail views.',
    genre: 'Drama',
    rating: 4.7,
    pages: 400,
    format: 'EPUB',
    featured: false,
  },
  {
    id: '8',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=900&q=80',
    description: 'A smart, suspenseful survival adventure set far beyond Earth.',
    summary:
      'Ryland Grace wakes alone on a ship and must solve an impossible problem to save humanity.',
    longDescription:
      'This is an excellent example of a high-concept title that reads well in modern discovery UI. It highlights how the platform can mix commercial appeal, rich metadata, and mobile-friendly storytelling cues.',
    genre: 'Adventure',
    rating: 4.8,
    pages: 496,
    format: 'EPUB + PDF',
    featured: false,
  },
]

export const getFeaturedBooks = () => mockBooks.filter((book) => book.featured)
export const getAllBooks = () => mockBooks
export const getBookById = (id: string) => mockBooks.find((book) => book.id === id)
export const getPurchasedBooks = () => mockBooks.filter((book) => book.isPurchased)
