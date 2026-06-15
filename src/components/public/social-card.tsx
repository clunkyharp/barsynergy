import Image from 'next/image';
import { FramedSpotlightCard } from '@/components/public/framed-spotlight-card';

const variantBackgrounds = {
  telegram: '/images/social/generated/telegram-bg.png',
  whatsapp: '/images/social/generated/whatsapp-bg.png',
  instagram: '/images/social/generated/instagram-bg.png'
} as const;

export type SocialLinkCardProps = {
  actionLabel?: string;
  className?: string;
  href: string;
  title: string;
  typeLabel?: string;
  variant: keyof typeof variantBackgrounds;
};

export function SocialLinkCard({
  actionLabel = 'Подписаться',
  className,
  href,
  title,
  typeLabel,
  variant
}: SocialLinkCardProps) {
  const backgroundSrc = variantBackgrounds[variant];

  return (
    <FramedSpotlightCard
      actionLabel={actionLabel}
      className={className}
      eyebrow={typeLabel}
      external
      href={href}
      mediaClassName="!px-0 !py-0"
      media={
        <div className="relative h-full w-full overflow-hidden rounded-[18px]">
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 32rem, (min-width: 640px) 24rem, 100vw"
            src={backgroundSrc}
          />
        </div>
      }
      title={title}
    />
  );
}
