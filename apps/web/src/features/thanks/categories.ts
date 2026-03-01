export interface ThanksCategory {
  value: string;
  label: string;
  emoji: string;
  borderColor: string;
  bgColor: string;
  selectedBgColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
}

export const THANKS_CATEGORIES: ThanksCategory[] = [
  {
    value: 'cheer_up',
    label: 'Cheer UP',
    emoji: '🌟',
    borderColor: 'border-amber-300',
    bgColor: 'bg-amber-50',
    selectedBgColor: 'bg-amber-100',
    badgeBgColor: 'bg-amber-100',
    badgeTextColor: 'text-amber-700',
  },
  {
    value: 'calm_relax',
    label: 'Calm & Relax',
    emoji: '🍃',
    borderColor: 'border-emerald-300',
    bgColor: 'bg-emerald-50',
    selectedBgColor: 'bg-emerald-100',
    badgeBgColor: 'bg-emerald-100',
    badgeTextColor: 'text-emerald-700',
  },
  {
    value: 'warm_thanks',
    label: 'Warm Thanks',
    emoji: '❤️',
    borderColor: 'border-rose-300',
    bgColor: 'bg-rose-50',
    selectedBgColor: 'bg-rose-100',
    badgeBgColor: 'bg-rose-100',
    badgeTextColor: 'text-rose-700',
  },
  {
    value: 'focus_clear',
    label: 'Focus & Clear',
    emoji: '💡',
    borderColor: 'border-sky-300',
    bgColor: 'bg-sky-50',
    selectedBgColor: 'bg-sky-100',
    badgeBgColor: 'bg-sky-100',
    badgeTextColor: 'text-sky-700',
  },
];

export function getCategoryByValue(value: string): ThanksCategory | undefined {
  return THANKS_CATEGORIES.find((c) => c.value === value);
}
