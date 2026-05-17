import type { CatalogBook } from './book-catalog'

export const localBooks: CatalogBook[] = [
  {
    bookId: 1,
    id: 'legal-banking-acts',
    slug: 'legal-banking-acts',
    title: 'Legal Banking Acts',
    author: 'R. K. Gupta',
    price: 600,
    image: '/images/covers/legal_banking_acts.webp',
    description: 'A foundational legal reference covering banking laws, regulation, and compliance requirements.',
    summary: 'Comprehensive guide covering banking regulations, compliance, and legal frameworks.',
    longDescription:
      'An essential handbook on banking legislation for legal and compliance teams. Covers major banking acts, regulatory frameworks, customer protection laws, recovery procedures, and operational compliance standards followed across Indian banking institutions. Designed for officers, auditors, and banking professionals who require practical understanding of legal responsibilities and risk-sensitive banking operations.',
    genre: 'Banking Law',
    rating: 4.7,
    pages: 20,
    format: 'PDF',
    featured: true,
  },

  {
    bookId: 2,
    id: 'kyc-aml-compliance',
    slug: 'kyc-aml-compliance',
    title: 'KYC & AML Compliance',
    author: 'Mithilesh Patil',
    price: 799,
    image: '/images/covers/kyc.webp',
    description: 'Practical guidance for customer due diligence, onboarding, and anti-money-laundering controls.',
    summary: 'Practical best practices for customer onboarding, identification, and anti-money laundering compliance.',
    longDescription:
      'A compliance playbook for risk teams and frontline staff managing KYC and AML obligations. Explains customer verification processes, suspicious transaction monitoring, risk categorization, regulatory reporting, and fraud prevention practices in modern banking systems. Includes practical workflows and operational checkpoints used in day-to-day banking compliance activities.',
    genre: 'Finance',
    rating: 4.5,
    pages: 260,
    format: 'PDF',
    featured: true,
  },

  {
    bookId: 3,
    id: 'home-loans-mortgage-essentials',
    slug: 'home-loans-mortgage-essentials',
    title: 'Home Loans & Mortgage Essentials',
    author: 'Sandhya Sawant',
    price: 600,
    image: '/images/covers/home_loans.webp',
    description: 'A practical guide for housing finance, underwriting, and mortgage process management.',
    summary: 'Essential lending guidelines for housing finance, underwriting, and borrower evaluation.',
    longDescription:
      'A reference for loan officers and relationship managers working with mortgage products. Covers eligibility assessment, property verification, loan underwriting, repayment structures, documentation, legal verification, and risk evaluation techniques followed in housing finance operations. Helpful for both new banking professionals and experienced lending teams handling retail loan portfolios.',
    genre: 'Home Finance',
    rating: 4.6,
    pages: 280,
    format: 'PDF',
    featured: true,
  },

  {
    bookId: 4,
    id: 'upi-and-online-payment-systems',
    slug: 'upi-and-online-payment-systems',
    title: 'UPI and Online Payment Systems',
    author: 'R.K.Gupta',
    price: 800,
    image: '/images/covers/UPI.webp',
    description: 'An overview of India’s UPI payments ecosystem, transaction flows, and secure digital payments.',
    summary: 'A practical overview of UPI, digital payment flows, and secure transaction design.',
    longDescription:
      'A concise reference on modern digital payment systems for bank operations teams. Explains UPI architecture, payment gateways, merchant integrations, settlement systems, transaction security, fraud detection mechanisms, and customer transaction workflows used across India’s rapidly growing digital banking ecosystem. Ideal for professionals involved in fintech operations, payment support, and digital banking services.',
    genre: 'Digital Banking',
    rating: 4.4,
    pages: 310,
    format: 'PDF',
    featured: true,
  },
]

export const getFeaturedLocalBooks = () => localBooks.filter((book) => book.featured)
export const findLocalBookBySlug = (slug: string) => localBooks.find((book) => book.slug === slug)
