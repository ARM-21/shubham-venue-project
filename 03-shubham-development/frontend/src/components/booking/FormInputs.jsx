'use client';

export const inputCls =
  'w-full px-4 py-3 bg-[#fbf8f2] border border-[#e8dcc8] rounded-2xl text-[#3a1224] text-sm font-medium transition-colors placeholder:text-[#3a1224]/30 focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15 focus:outline-none hover:border-[#d4c4a8] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#f0ebe2]';

export function FormField({ label, required, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/50">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[#3a1224]/45">{hint}</p>}
      {error && <p className="text-xs font-bold text-red-600">• {error}</p>}
    </div>
  );
}

export function FormTextField({ label, required, error, hint, ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <input {...props} className={inputCls} />
    </FormField>
  );
}

export function FormSelectField({ label, required, error, hint, options, ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <select {...props} className={inputCls}>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export function FormTextarea({ label, required, error, hint, ...props }) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <textarea {...props} className={`${inputCls} resize-none`} />
    </FormField>
  );
}

export function PrimaryButton({ children, loading, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#3a1224] text-[11px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:bg-[#4a172d] disabled:opacity-50"
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}

export function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-[#e8dcc8] bg-white text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:bg-[#f8f4ed]"
    >
      {children}
    </button>
  );
}

export function ActionButtonGroup({ children }) {
  return <div className="flex gap-3 pt-2">{children}</div>;
}
