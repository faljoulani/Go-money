import React from 'react';

type Props = {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
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

export default function Description({
  children,
  className = '',
  align = 'center',
  maxWidth = 686,
  color = 'text-default',
  html,
  as = 'p',
}: Props) {
  const Tag = as;

  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const combinedClassName = [
    'font-lufga',
    'text-description',
    'tracking-normal',
    color,
    alignClass,
    align === 'center' ? 'mx-auto' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
  };

  if (html) {
    return (
      <div
        className={combinedClassName}
        style={style}
        dangerouslySetInnerHTML={{ __html: cleanSfHtml(html) }}
      />
    );
  }

  return (
    <Tag className={combinedClassName} style={style}>
      {children}
    </Tag>
  );
}

