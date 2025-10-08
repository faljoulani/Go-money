'use client';

import * as React from 'react';

export type DropdownOption = { id: string; label: React.ReactNode; value?: string };

type Props = {
  options: DropdownOption[];
  placeholder?: string;
  name?: string;
  valueId?: string | null;
  onChange?: (opt: DropdownOption) => void;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  listClassName?: string;
  optionClassName?: string;
};

export const DROPDOWN_BUTTON_BASE = [
  'group flex h-12 border  items-center justify-between overflow-hidden rounded-2xl px-4',
  'border border-gray-200 bg-white text-14px transition-colors duration-150',
  'hover:border-gray-300 hover:bg-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20',
  'dark:bg-transparent dark:hover:bg-white/5 dark:focus:border-primary',
].join(' ');

export const DROPDOWN_LIST_BASE = [
  'absolute top-full left-0 right-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-2xl p-2 shadow-xl',
  'bg-white border border-gray-200',
  'dark:bg-[#000000] dark:border-white/10',
].join(' ');

export const DROPDOWN_OPTION_BASE = [
  'mt-1 w-full rounded-xl p-2 text-left text-14px leading-[18px]',
  'text-gray-800 hover:bg-gray-100',
  'dark:text-white dark:hover:bg-white/10',
  'rtl:text-right',
].join(' ');

export default function CustomDropdown({
  options,
  placeholder = 'Select…',
  name,
  valueId = null,
  onChange,
  disabled = false,
  className = 'relative',
  buttonClassName = `${DROPDOWN_BUTTON_BASE} w-full`,
  listClassName = DROPDOWN_LIST_BASE,
  optionClassName = DROPDOWN_OPTION_BASE,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(valueId);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  const selected = React.useMemo(
    () => options.find((o) => o.id === selectedId) || null,
    [options, selectedId],
  );

  React.useEffect(() => setSelectedId(valueId ?? null), [valueId]);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((o) => !o);
    }
  };

  const choose = (opt: DropdownOption) => {
    setSelectedId(opt.id);
    setOpen(false);
    onChange?.(opt);
  };

  const submittedValue = selected?.value ?? selected?.id ?? '';

  return (
    <div ref={wrapRef} className={className}>
      {name ? <input type="hidden" name={name} value={submittedValue} /> : null}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={[
          buttonClassName,
          selected ? 'text-default' : 'text-[#BDBDBD]',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <svg
          className={`h-4 w-4 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div role="listbox" className={listClassName}>
          {options.map((opt) => {
            const selected = opt.id === selectedId;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => choose(opt)}
                className={optionClassName}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

