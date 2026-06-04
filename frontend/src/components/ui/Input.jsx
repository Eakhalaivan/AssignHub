import { forwardRef } from 'react';
import clsx from 'clsx';

export const Input = forwardRef(({ 
  label, 
  error, 
  className, 
  type = 'text', 
  helperText,
  ...props 
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={clsx(
          'input-antigravity',
          error && 'border-alert focus:border-alert focus:ring-[#cb6e6e]/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-mono text-alert mt-0.5 uppercase tracking-wider flex items-center gap-1">
          <span>●</span> {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-[10px] text-muted font-mono mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const Select = forwardRef(({ 
  label, 
  error, 
  options = [], 
  className, 
  helperText,
  ...props 
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            'input-antigravity appearance-none pr-10 cursor-pointer',
            error && 'border-alert focus:border-alert focus:ring-[#cb6e6e]/20',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-void text-primary">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-muted">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-[10px] font-mono text-alert mt-0.5 uppercase tracking-wider flex items-center gap-1">
          <span>●</span> {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-[10px] text-muted font-mono mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export const TextArea = forwardRef(({ 
  label, 
  error, 
  className, 
  helperText,
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'input-antigravity resize-none',
          error && 'border-alert focus:border-alert focus:ring-[#cb6e6e]/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-mono text-alert mt-0.5 uppercase tracking-wider flex items-center gap-1">
          <span>●</span> {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-[10px] text-muted font-mono mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange} 
          disabled={disabled}
          className="sr-only" 
        />
        <div className={clsx(
          'w-9 h-5 rounded-full border transition-all duration-300',
          checked ? 'bg-[#c5a880]/20 border-[#c5a880]/50' : 'bg-[#111113] border-border'
        )} />
        <div className={clsx(
          'absolute top-1 left-1 w-3 h-3 rounded-full transition-all duration-300',
          checked ? 'bg-[#c5a880] translate-x-4' : 'bg-muted'
        )} />
      </div>
      {label && <span className="text-[10px] font-mono uppercase tracking-wider text-secondary">{label}</span>}
    </label>
  );
}

export function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <div className={clsx(
        'w-4 h-4 rounded border flex items-center justify-center transition-all duration-200',
        checked ? 'bg-[#c5a880]/20 border-[#c5a880]' : 'bg-[#111113] border-border'
      )}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-[#c5a880] fill-current" viewBox="0 0 20 20">
            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
          </svg>
        )}
      </div>
      {label && <span className="text-xs text-secondary font-dm">{label}</span>}
    </label>
  );
}
