export const IDLE_OPTIONS = [
  { label: '1분', value: 1 },
  { label: '5분', value: 5 },
  { label: '10분', value: 10 },
  { label: '30분', value: 30 },
] as const;

export type IdleMinutes = typeof IDLE_OPTIONS[number]['value'];
