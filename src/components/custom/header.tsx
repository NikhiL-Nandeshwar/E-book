'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'मुखपृष्ठ',
      href: '/',
    },
    {
      label: 'पुस्तक संग्रह',
      href: '/books',
    },
    // {
    //   label: 'नवीन पुस्तके',
    //   href: '/latest-books',
    // },
    // {
    //   label: 'प्रश्नसंच',
    //   href: '/question-bank',
    // },
    {
      label: 'माझे पुस्तकालय',
      href: '/my-library',
    },
  ];

  return (
    <>
      {/* Top Strip */}
      <div className="bg-slate-100 text-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <div className="flex items-center gap-2">
            <span>कार्यालयीन वेळ : सोम - शनि | सकाळी १०:०० - संध्या ५:००</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:02312627307"
              className="font-medium hover:text-[#7A2E92]"
            >
              हेल्पलाईन : ०२३१-२६२७३०७
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-[#7A2E92] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />

            <div>
              <p className="text-lg font-semibold leading-tight">
                कोल्हापूर जिल्हा नागरी बँक्स
              </p>

              <p className="text-[#fbf5da]">
                असोसिएशन लि.
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-7 text-md font-medium lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  pathname === item.href
                    ? 'text-[#fcd62e]'
                    : 'text-white hover:text-[#fcd62e]'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* Back to Recruitment */}
            <a
              href="https://www.kopbankasso-recruit-book.com"
              className="hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20 lg:block"
            >
              ← भरती पोर्टल
            </a>

            {/* Account */}
            <Link
              href="/login"
              className="rounded-md bg-white px-5 py-2 font-medium text-[#7A2E92] transition hover:bg-[#f3e8ff]"
            >
              माझे खाते
            </Link>
          </div>
        </div>

        {/* Category Bar */}
        {/* <div className="border-t border-white/10 bg-[#6d298e]">
          <div className="mx-auto flex max-w-7xl items-center gap-8 overflow-x-auto px-4 py-3 text-sm whitespace-nowrap">

            <Link href="/category/banking" className="hover:text-[#fcd62e]">
              बँकिंग
            </Link>

            <Link href="/category/cooperative" className="hover:text-[#fcd62e]">
              सहकार
            </Link>

            <Link href="/category/audit" className="hover:text-[#fcd62e]">
              लेखापरीक्षण
            </Link>

            <Link href="/category/laws" className="hover:text-[#fcd62e]">
              कायदे
            </Link>

            <Link href="/category/training" className="hover:text-[#fcd62e]">
              प्रशिक्षण
            </Link>

            <Link href="/category/question-bank" className="hover:text-[#fcd62e]">
              प्रश्नसंच
            </Link>

          </div>
        </div> */}
      </header>
    </>
  );
}
