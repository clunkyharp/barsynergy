import { SocialLinkCard } from './social-card';
import { accentFont, displayFont } from '@/lib/fonts';
import type { HomepageSocialBlock } from '@/lib/public/home';

const channelDetailsByVariant: Record<HomepageSocialBlock['variant'], { platformLabel: string; typeLabel: string }> = {
  telegram: {
    platformLabel: 'Telegram',
    typeLabel: 'Канал'
  },
  whatsapp: {
    platformLabel: 'WhatsApp',
    typeLabel: 'Связь'
  },
  instagram: {
    platformLabel: 'Instagram',
    typeLabel: 'Соцсеть'
  }
};

export function CommunityChannelRows({ channels }: { channels: HomepageSocialBlock[] }) {
  return (
    <div className="home-community-panel scroll-mt-28 border-t border-[var(--line)] pt-6 md:pt-7" id="home-community">
      <div>
        <div className="max-w-2xl">
          <p className={`${accentFont.className} text-xs uppercase tracking-[0.2em] text-[var(--accent)]`}>Сообщество</p>
          <h3 className={`${displayFont.className} mt-3 text-[2rem] font-semibold leading-[1.02] text-[var(--editorial-dark-text)] md:text-[2.8rem]`}>
            Каналы BARSYNERGY
          </h3>
        </div>
      </div>

      <div className="mt-6 grid items-stretch gap-3 md:grid-cols-3">
        {channels.map((channel) => {
          const details = channelDetailsByVariant[channel.variant];

          return (
            <SocialLinkCard
              actionLabel={channel.actionLabel}
              href={channel.href}
              key={channel.id}
              title={channel.title}
              typeLabel={details.typeLabel}
              variant={channel.variant}
            />
          );
        })}
      </div>
    </div>
  );
}
