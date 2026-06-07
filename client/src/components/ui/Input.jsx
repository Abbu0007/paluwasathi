export default function Input({
  label,
  error,
  hint,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-ink mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-ink placeholder:text-gray-400 transition-all duration-200 outline-none ${
          error ? 'border-danger' : 'border-gray-200 focus:border-primary'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-sm mt-1.5">{error}</p>}
      {hint && !error && <p className="text-gray-400 text-sm mt-1.5">{hint}</p>}
    </div>
  );
}