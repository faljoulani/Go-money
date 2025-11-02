import Image from 'next/image';

type CmsImg =
  | string
  | {
      Url?: string;
      MediaUrl?: string;
      ThumbnailUrl?: string;
      Title?: string;
      AlternativeText?: string;
    };

export default function CardImage({
  img,
  alt,
  sizes = '100vw',
  priority = false,
  className = '',
}: {
  img: CmsImg;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const src = typeof img === 'string' ? img : img?.MediaUrl || img?.Url || img?.ThumbnailUrl || '';

  return (
    <Image
      src={src}
      alt={alt ?? 'card image'}
      fill
      className="object-cover select-none"
      quality={90}
      placeholder="empty"
      sizes={sizes}
      priority={priority}
    />
  );
}

