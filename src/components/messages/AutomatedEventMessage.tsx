import type { CSSProperties } from 'react';
import { Shield, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

type AutomatedMessage = {
  id: string;
  body: string;
  event_type: string | null;
  created_at: string;
};

const EVENT_STYLES: Record<string, { icon: typeof Shield; color: string; bg: string }> = {
  escrow_funded:      { icon: DollarSign,   color: '#059669', bg: '#d1fae5' },
  milestone_approved: { icon: CheckCircle,  color: '#2563eb', bg: '#dbeafe' },
  escrow_completed:   { icon: CheckCircle,  color: '#7c3aed', bg: '#ede9fe' },
  escrow_disputed:    { icon: AlertCircle,  color: '#dc2626', bg: '#fee2e2' },
  default:            { icon: Shield,       color: '#6b7280', bg: '#f3f4f6' },
};

export function AutomatedEventMessage({ message }: { message: AutomatedMessage }) {
  const style = EVENT_STYLES[message.event_type ?? 'default'] ?? EVENT_STYLES.default;
  const Icon = style.icon;

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: style.bg,
    borderRadius: '0.75rem',
    border: `1px solid ${style.color}33`,
    margin: '0.25rem 2rem',
  };

  return (
    <div style={containerStyle}>
      <Icon size={16} color={style.color} strokeWidth={2.2} />
      <div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', fontWeight: 500, whiteSpace: 'pre-wrap' }}>
          {message.body}
        </p>
        <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
          {new Date(message.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
