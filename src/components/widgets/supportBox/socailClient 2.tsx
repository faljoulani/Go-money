'use client';

import Facebook from '../../../../public/icons/facebook.svg';
import X from '../../../../public/icons/x.svg';
import Instagram from '../../../../public/icons/instagram.svg';
import LinkedIn from '../../../../public/icons/linkedIn.svg';

export default function SocialCleint({ url }) {
  const name = url?.toString().toLowerCase() || '';
  // alert(name)
  if (name.includes('facebook'))
    return <Facebook className="w-5 h-5 text-primaryAlt object-contain" aria-label={url} />;
  if (name.includes('x'))
    return <X className="w-5 h-5 text-primaryAlt object-contain" aria-label={url} />;
  if (name.includes('instagrem'))
    return <Instagram className="w-5 h-5 text-primaryAlt object-contain" aria-label={url} />;
  if (name.includes('linkedin'))
    return <LinkedIn className="w-5 h-5 text-primaryAlt object-contain" aria-label={url} />;
}

