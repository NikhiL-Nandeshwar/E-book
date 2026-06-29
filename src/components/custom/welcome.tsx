import Image from 'next/image';
import Link from 'next/link';

export function Welcome() {
      return (

    <section className="flex min-h-[60vh] items-center bg-[#f9f6f7]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-10 md:flex-row">
            {/* Left - Logo */}
            <div className="flex justify-center">
                <Image
                    src="/logo.png"
                    alt="KOP Bank Association"
                    width={300}
                    height={300}
                    className="object-contain"
                    priority
                />
            </div>

            {/* Right - Content */}
            <div className="max-w-3xl">
                <p className="mb-2 text-lg font-medium text-[#7A2E92]">
                    📚 ई-पुस्तक विभाग
                </p>

                <h1 className="mb-4 text-3xl font-bold leading-tight text-[#b13c7a]">
                    कोल्हापूर जिल्हा नागरी बँक्स सहकारी असोसिएशन लि.
                </h1>

                <p className="mb-3 text-2xl text-slate-700">
                    बँकिंग, सहकार, लेखापरीक्षण, कायदे व प्रशिक्षणाशी संबंधित पुस्तके व संदर्भ साहित्य
                </p>

                <p className="mb-8 text-lg leading-relaxed text-slate-600">
                    सदस्य सहकारी बँकांमधील अधिकारी, कर्मचारी व विद्यार्थ्यांसाठी
                    उपयुक्त पुस्तके आणि अद्ययावत संदर्भ साहित्य उपलब्ध.
                </p>

                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/books"
                        className="rounded-lg bg-[#7A2E92] px-6 py-3 font-medium text-white transition hover:bg-[#69267d]"
                    >
                        📚 पुस्तके पहा
                    </Link>

                    {/* <Link
                        href="/question-bank"
                        className="rounded-lg border border-[#7A2E92] px-6 py-3 font-medium text-[#7A2E92] transition hover:bg-[#f8f0fc]"
                    >
                        📝 प्रश्नसंच
                    </Link> */}
                </div>
            </div>

        </div>
    </section>
      );
}