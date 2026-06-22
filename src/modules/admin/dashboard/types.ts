import { ApplicationStatus, ApplicationType, UserRole } from '@prisma/client';

export const adminRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'администратор',
  [UserRole.MODERATOR]: 'модератор',
  [UserRole.BUSINESS]: 'бизнес',
  [UserRole.USER]: 'участник'
};

export type QueueItem = {
  label: string;
  count: number;
  owner: string;
  href: string;
  nextStep: string;
};

export type PublishingRailItem = {
  label: string;
  href: string;
  draft: number;
  published: number;
  extra?: string;
};

export type HealthRow = {
  area: string;
  status: string;
  note: string;
  href?: string;
  variant: 'success' | 'warning' | 'danger' | 'neutral';
};

export type DashboardApplication = {
  id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  subject: string | null;
  name: string | null;
  createdAt: Date;
};
