export type BadgePresentation = {
  label: string;
  bg: string;
  text: string;
};

export const SUPPORT_STATUS_CONFIG: Record<string, BadgePresentation> = {
  open: { label: 'Open', bg: '#FEF3C7', text: '#B45309' },
  closed: { label: 'Closed', bg: '#D1FAE5', text: '#065F46' },
  pending: { label: 'Pending', bg: '#E0E7FF', text: '#3730A3' },
  resolved: { label: 'Resolved', bg: '#D1FAE5', text: '#065F46' },
};

export const SUPPORT_PRIORITY_CONFIG: Record<string, BadgePresentation> = {
  normal: { label: 'Normal', bg: '#F3F4F6', text: '#374151' },
  high: { label: 'High', bg: '#FEE2E2', text: '#991B1B' },
  low: { label: 'Low', bg: '#E0F2FE', text: '#0369A1' },
};

export const DEFAULT_BADGE_PRESENTATION: BadgePresentation = {
  label: 'Unknown',
  bg: '#F3F4F6',
  text: '#374151',
};

export const getSupportStatusPresentation = (status: string): BadgePresentation => (
  SUPPORT_STATUS_CONFIG[status] ?? { ...DEFAULT_BADGE_PRESENTATION, label: status }
);

export const getSupportPriorityPresentation = (priority: string): BadgePresentation => (
  SUPPORT_PRIORITY_CONFIG[priority] ?? { ...DEFAULT_BADGE_PRESENTATION, label: priority }
);
