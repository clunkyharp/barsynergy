export const channelAccentVars = {
  instagram: 'var(--channel-instagram)',
  neutral: 'var(--channel-neutral)',
  phone: 'var(--channel-phone)',
  telegram: 'var(--channel-telegram)',
  website: 'var(--channel-website)',
  whatsapp: 'var(--channel-whatsapp)'
} as const;

export type ChannelAccentTone = keyof typeof channelAccentVars;

export function getChannelAccentVar(tone: ChannelAccentTone) {
  return channelAccentVars[tone];
}
