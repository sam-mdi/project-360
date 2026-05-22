import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface InlineEditProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  inputClassName?: string;
}

export function InlineEdit({ value, onChange, className, placeholder, inputClassName }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value) onChange(draft.trim() || value);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        className={cn(
          'bg-transparent border-b border-amber-400 outline-none font-inherit',
          inputClassName ?? className
        )}
        style={{ fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}
      />
    );
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      className={cn('cursor-text hover:opacity-70 transition-opacity', className)}
      title="Click to edit"
    >
      {value || <span className="opacity-40">{placeholder ?? 'Edit...'}</span>}
    </span>
  );
}
