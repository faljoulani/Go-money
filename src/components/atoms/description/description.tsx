import React from 'react';

type Props = {
  children?: React.ReactNode;
  className?: string;
  maxWidth?: number | string;
  color?: string;
  html?: string;
  as?: 'p' | 'div' | 'span';
};

function cleanSfHtml(input: string) {
  if (!input) return '';
  let str = input;
  str = str.replace(/<\/?(table|tbody|tr|td)[^>]*>/gi, '');
  str = str.replace(/<\/?code[^>]*>/gi, '');
  str = str.replace(/\sdata-[a-z-]+="[^"]*"/gi, '');
  return str.trim();
}

// quick heuristic: does the HTML contain block-level tags?
const hasBlockTags = (s: string) =>
  /<(div|p|h[1-6]|ul|ol|li|section|article|aside|header|footer|nav|figure|blockquote|pre)[\s>]/i.test(
    s,
  );

export default function Description({
  children,
  className = '',
  maxWidth = 686,
  color = 'text-default',
  html,
  as = 'p',
}: Props) {
  const cleaned = html ? cleanSfHtml(html) : undefined;
  console.log('LATEST DESCRIPTION');
  // pick the safest tag:
  // - if html contains block tags and the requested tag is inline or <p>, switch to <div>
  // - otherwise honor the 'as' prop
  let Tag: 'p' | 'div' | 'span' = as;
  if (cleaned && hasBlockTags(cleaned) && (as === 'p' || as === 'span')) {
    Tag = 'div';
  }

  const combinedClassName = ['text-base', 'tracking-normal', color, className]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
  };

  if (cleaned) {
    return (
      <Tag
        className={combinedClassName}
        style={style}
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />
    );
  }

  return (
    <Tag className={combinedClassName} style={style}>
      {children}
    </Tag>
  );
}
