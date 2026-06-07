import type { HTMLAttributes, ReactNode } from 'react';

export type EditorialAction = {
  href: string;
  label: string;
  ariaLabel?: string;
};

export type PrimitiveShellProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
};

export type RouteIndexPanelItem = {
  code: ReactNode;
  title: ReactNode;
  useCase: ReactNode;
  href: string;
  ariaLabel?: string;
  actionLabel?: string;
  status?: ReactNode;
  count?: ReactNode;
};

export type EditorialReadingQueueItem = {
  rubric: ReactNode;
  title: ReactNode;
  description: ReactNode;
  forWhom?: ReactNode;
  willAppear?: ReactNode;
  type?: ReactNode;
  status?: ReactNode;
  action: EditorialAction;
};

export type ProgramFormatMatrixItem = {
  format: ReactNode;
  audience: ReactNode;
  includes: ReactNode;
  result: ReactNode;
  status: ReactNode;
  action: EditorialAction;
};

export type PartnerFormatTableItem = {
  format: ReactNode;
  fit: ReactNode;
  partnerProvides: ReactNode;
  barsynergyProvides: ReactNode;
  nextStep: ReactNode;
  action?: EditorialAction;
};

export type SponsorBenefitSheetItem = {
  benefit: ReactNode;
  brandVisibility: ReactNode;
  result: ReactNode;
};

export type SponsorPackageComparisonItem = {
  packageName: ReactNode;
  scope: ReactNode;
  visibility: ReactNode;
  periodStatus: ReactNode;
  includedPlacements: ReactNode;
  requiredAssets: ReactNode;
  action?: EditorialAction;
  priceStatus?: ReactNode;
  recommended?: boolean;
};

export type ProcessStepInlineItem = {
  title: ReactNode;
  description?: ReactNode;
};
