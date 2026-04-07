import { statusStyles, type StatusDomain } from './statusStyles';

interface StatusBadgeProps {
  status: string;
  domain: StatusDomain;
  showDot?: boolean;
  withBorder?: boolean;
}

export default function StatusBadge({ status, domain, showDot = false, withBorder = false }: StatusBadgeProps) {
  const domainStyles = statusStyles[domain];
  const style = domainStyles[status] || Object.values(domainStyles)[0];

  const label = style.label || status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${withBorder && style.border ? `border ${style.border}` : ''}`}
    >
      {showDot && style.dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {label}
    </span>
  );
}
