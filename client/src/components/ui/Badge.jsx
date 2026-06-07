const variants = {
  critical: 'bg-red-50 text-red-700',
  high: 'bg-orange-50 text-orange-700',
  stable: 'bg-primary-50 text-primary-dark',
  verified: 'bg-primary-50 text-primary-dark',
  new: 'bg-blue-50 text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
};

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full
      text-xs font-bold ${variants[variant]} ${className}
    `}>
      {children}
    </span>
  );
}