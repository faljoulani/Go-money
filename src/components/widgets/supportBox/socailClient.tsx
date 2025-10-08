'use client';

import Facebook from '../../../../public/icons/facebook.svg';
import X from '../../../../public/icons/x.svg';
import Instagram from '../../../../public/icons/instagram.svg';
import LinkedIn from '../../../../public/icons/linkedIn.svg';

export default function SocialCleint({ title }) {
  const name = title?.toString().toLowerCase() || '';
  if (name.includes('facebook'))
    return <Facebook className="w-5 h-5 text-primaryAlt object-contain" aria-label={title} />;
  if (name.includes('x'))
    return <X className="w-5 h-5 text-primaryAlt object-contain" aria-label={title} />;
  if (name.includes('instagram'))
    return <Instagram className="w-5 h-5 text-primaryAlt object-contain" aria-label={title} />;
  if (name.includes('linkedin'))
    return <LinkedIn className="w-5 h-5 text-primaryAlt object-contain" aria-label={title} />;
}

