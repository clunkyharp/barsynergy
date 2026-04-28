import { ApplicationStatus, ApplicationType, type Prisma } from '@prisma/client';
import { applicationTypeLabels } from '@/lib/admin/application-utils';
import { prisma } from '@/lib/db/prisma';
import { notifyOnApplicationCreated } from '@/lib/notifications/application-notifications';

type CreatePublicApplicationInput = {
  type: ApplicationType;
  status?: ApplicationStatus;
  subject?: string | null;
  message?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  telegram?: string | null;
  cityId?: string | null;
  cityName?: string | null;
  vacancyId?: string | null;
  resumeFileId?: string | null;
  payload?: Prisma.InputJsonValue;
  consentText: string;
  utm?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
  };
};

export async function createPublicApplication(input: CreatePublicApplicationInput) {
  const application = await prisma.application.create({
    data: {
      type: input.type,
      status: input.status ?? ApplicationStatus.NEW,
      subject: input.subject ?? null,
      message: input.message ?? null,
      name: input.name ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      telegram: input.telegram ?? null,
      cityId: input.cityId ?? null,
      vacancyId: input.vacancyId ?? null,
      resumeFileId: input.resumeFileId ?? null,
      payload: input.payload,
      consentAcceptedAt: new Date(),
      consentText: input.consentText,
      utmSource: input.utm?.source ?? null,
      utmMedium: input.utm?.medium ?? null,
      utmCampaign: input.utm?.campaign ?? null
    },
    select: {
      id: true,
      type: true,
      subject: true,
      name: true,
      email: true
    }
  });

  await notifyOnApplicationCreated({
    applicationId: application.id,
    applicationTypeLabel: applicationTypeLabels[input.type],
    subject: application.subject ?? applicationTypeLabels[input.type],
    cityName: input.cityName ?? undefined,
    userName: application.name ?? undefined,
    userEmail: application.email ?? undefined
  });

  return application;
}
