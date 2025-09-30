'use client';

import * as React from 'react';

export type DropdownOption = { id: string; label: string; value?: string };

type Props = {
  options: DropdownOption[];
  placeholder?: string;
  /** Name for the hidden input so it submits with a <form> */
  name?: string;
  /** Preselected option id (controlled-from-parent optional) */
  valueId?: string | null;
  onChange?: (opt: DropdownOption) => void;

  dir?: 'ltr' | 'rtl' | 'auto';
  disabled?: boolean;

  /** Styling hooks */
  className?: string; // wrapper
  buttonClassName?: string; // the visible trigger button
  listClassName?: string; // the popup list
  optionClassName?: string; // each option
};

export default function CustomDropdown({
  options,
  placeholder = 'Select…',
  name,
  valueId = null,
  onChange,
  dir = 'auto',
  disabled = false,
  className = 'relative',
  buttonClassName = 'h-[48px] w-full rounded-[18px] border border-[#BDBDBD] bg-white px-3 text-left text-14px leading-[18px] text-[#BDBDBD] outline-none focus:ring-2 focus:ring-[#0B2A8E]/20 flex items-center justify-between',
  listClassName = 'absolute top-full left-0 right-0 mt-1 rounded-[12px] bg-white shadow-xl z-50 pointer-events-auto max-h-60 overflow-auto p-2',
  optionClassName = 'w-full mt-2 text-left rtl:text-right p-2 text-14px leading-[18px] text-default hover:bg-[#E6E8FF] rounded-[12px]',
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(valueId);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  const selected = React.useMemo(
    () => options.find((o) => o.id === selectedId) || null,
    [options, selectedId],
  );

  // sync when parent changes valueId
  React.useEffect(() => setSelectedId(valueId ?? null), [valueId]);

  // close on outside click
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // basic keyboard support
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
    <div ref={wrapRef} className={className} dir={dir}>
      {/* Hidden input to integrate with native <form> submission */}
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

