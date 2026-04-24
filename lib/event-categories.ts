export const EVENT_CATEGORY_OPTIONS = [
  'Technical',
  'Academic',
  'Cultural',
  'Sports',
  'Workshop',
  'Social',
  'Other',
] as const;

export type EventCategory = (typeof EVENT_CATEGORY_OPTIONS)[number];

const CATEGORY_ALIASES: Record<string, EventCategory> = {
  Tech: 'Technical',
  Technical: 'Technical',
  Academic: 'Academic',
  Cultural: 'Cultural',
  Sports: 'Sports',
  Workshop: 'Workshop',
  Social: 'Social',
  Other: 'Other',
};

export const EVENT_CATEGORY_COLORS: Record<string, string> = {
  Technical: 'bg-blue-100 text-blue-700',
  Academic: 'bg-green-100 text-green-700',
  Cultural: 'bg-purple-100 text-purple-700',
  Sports: 'bg-orange-100 text-orange-700',
  Workshop: 'bg-cyan-100 text-cyan-700',
  Social: 'bg-pink-100 text-pink-700',
  Other: 'bg-slate-100 text-slate-600',
};

export const EVENT_CATEGORY_BACKGROUNDS: Record<string, string> = {
  Technical: 'from-blue-800 to-blue-950',
  Academic: 'from-green-800 to-green-950',
  Cultural: 'from-purple-800 to-purple-950',
  Sports: 'from-orange-800 to-orange-950',
  Workshop: 'from-cyan-800 to-cyan-950',
  Social: 'from-pink-800 to-pink-950',
  Other: 'from-slate-700 to-slate-950',
};

export function normalizeEventCategory(category?: string | null): string | undefined {
  if (!category) {
    return undefined;
  }

  return CATEGORY_ALIASES[category] ?? category;
}
