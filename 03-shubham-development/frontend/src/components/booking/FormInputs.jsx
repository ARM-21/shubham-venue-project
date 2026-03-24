'use client';

/**
 * Professional form input components for the booking flow
 * - FormTextField: Text input field
 * - FormSelectField: Select dropdown
 * - FormTextarea: Textarea field
 * - FormButton: Action buttons
 */

export function FormField({ label, required, children, error }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-600 text-sm font-medium flex items-center gap-1">
          <span className="text-lg">•</span> {error}
        </p>
      )}
    </div>
  );
}

export function FormTextField({ label, required, error, ...props }) {
  return (
    <FormField label={label} required={required} error={error}>
      <input
        {...props}
        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all placeholder:text-slate-400 outline-none hover:border-slate-400 disabled:bg-slate-50 disabled:opacity-60"
      />
    </FormField>
  );
}

export function FormSelectField({ label, required, error, options, ...props }) {
  return (
    <FormField label={label} required={required} error={error}>
      <select
        {...props}
        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all outline-none hover:border-slate-400"
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export function FormTextarea({ label, required, error, ...props }) {
  return (
    <FormField label={label} required={required} error={error}>
      <textarea
        {...props}
        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20 transition-all resize-none placeholder:text-slate-400 outline-none hover:border-slate-400 disabled:bg-slate-50 disabled:opacity-60"
      />
    </FormField>
  );
}

export function PrimaryButton({ children, loading, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="px-6 py-3 bg-[#C0A04C] text-white rounded-lg font-semibold hover:bg-[#b39041] transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

export function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="px-6 py-3 border border-slate-300 text-slate-900 rounded-lg font-semibold hover:bg-slate-50 transition-all"
    >
      {children}
    </button>
  );
}

export function ActionButtonGroup({ children }) {
  return (
    <div className="flex gap-3 pt-8 border-t border-slate-200">
      {children}
    </div>
  );
}
