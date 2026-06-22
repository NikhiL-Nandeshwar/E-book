'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Props {
  src?: string;
  alt: string;
}

export function BookCover({ src, alt }: Props) {
  const [imageSrc, setImageSrc] = useState(
    // src
    //   ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${src}`
    //   : '/images/UPI.webp'
    src="ebook_cover.png"
  );

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className="object-cover"
      onError={() => setImageSrc('/images/UPI.webp')}
    />
  );
}