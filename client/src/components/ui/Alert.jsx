import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const config = {
  success: { bg: 'bg-primary-50', text: 'text-primary-dark', Icon: CheckCircle2 },
  error: { bg: 'bg-red-50', text: 'text-red-700', Icon: AlertCircle },
  warning: { bg: 'bg-orange-50', text: 'text-orange-700', Icon: AlertTriangle },
  info: { bg: 'bg-blue-50', text: 'text-blue-700', Icon: Info },
};

export default function Alert({ type = 'info', title, message }) {
  const { bg, text, Icon } = config[type];
  return (
    <div className={`flex gap-3 p-4 rounded-xl ${bg}`}>
      <Icon size={20} className={text} />
      <div>
        {title && <p className={`font-bold ${text}`}>{title}</p>}
        {message && <p className={`text-sm ${text} opacity-90`}>{message}</p>}
      </div>
    </div>
  );
}