'use client';

import Link from "next/link";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-slate-700 bg-slate-500 text-slate-100">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-3">

                {/* Address */}
                <div>
                    <h3 className="mb-4 text-xl font-semibold text-[#fcd62e]">
                        संघटना कार्यालय
                    </h3>

                    <p className="text-md leading-7">
                        कोल्हापूर जिल्हा नागरी सहकारी बँक्स असोसिएशन लि.
                        <br />
                        सी. एस. क्र. १४५८, जी. एन. चेंबर्स,
                        <br />
                        मंगळवार पेठ, कोल्हापूर,
                        <br />
                        महाराष्ट्र - ४१६०१२
                    </p>

                    <a
                        href="tel:02312627307"
                        className="mt-4 inline-block font-medium transition-colors hover:text-[#fcd62e]"
                    >
                        📞 ०२३१-२६२७३०७
                    </a>
                </div>

                <div>

                    {/* Quick Links */}
                    <h4 className="mb-3 text-xl font-semibold text-[#fcd62e]">
                        ई-पुस्तक विभाग
                    </h4>

                    <ul className="space-y-2 text-md">
                        <li>
                            <Link href="/" className="hover:text-[#fcd62e]">
                                मुखपृष्ठ
                            </Link>
                        </li>

                        <li>
                            <Link href="/books" className="hover:text-[#fcd62e]">
                                पुस्तक संग्रह
                            </Link>
                        </li>

                        <li>
                            <a
                                href="https://www.kopbankasso-recruit-book.com"
                                className="font-medium text-[#fcd62e] hover:text-yellow-400"
                            >
                                भरती पोर्टल ↗
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Copyright */}
                <div className="flex flex-col justify-end text-md">
                    <p>
                        © {year} - Kolhapur District Urban Banks Association
                    </p>

                    <p className="mt-2 text-sm text-slate-200">
                        Managed by{' '}
                        <a
                            href="https://www.nexspiretechnologies.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#fcd62e] hover:text-yellow-400"
                        >
                            Nexspire Technologies
                        </a>
                    </p>
                </div>

            </div>
        </footer>
    );
}