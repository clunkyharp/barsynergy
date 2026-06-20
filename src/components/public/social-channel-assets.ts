import type { ChannelAccentTone } from '@/components/public/channel-accent';

export type SocialChannelVariant = ChannelAccentTone;

export const channelBackgrounds: Partial<Record<SocialChannelVariant, string>> = {
  telegram: '/images/social/generated/telegram-bg.png',
  whatsapp: '/images/social/generated/whatsapp-bg.png',
  instagram: '/images/social/generated/instagram-bg.png',
  neutral: '/images/social/generated/email-bg.png',
};

export const channelAccentVars: Record<SocialChannelVariant, string> = {
  instagram: 'var(--channel-instagram)',
  neutral: 'var(--channel-neutral)',
  phone: 'var(--channel-phone)',
  telegram: 'var(--channel-telegram)',
  website: 'var(--channel-website)',
  whatsapp: 'var(--channel-whatsapp)',
};
