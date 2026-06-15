'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { AdminCmsSection } from '@/components/admin/admin-cms-form';
import { AdminCmsGrid } from '@/components/admin/admin-cms-form';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type EntityTypeFormSectionProps = {
  children?: ReactNode;
  defaultType?: 'INDIVIDUAL' | 'BUSINESS';
  defaultFullName?: string;
  defaultCompanyName?: string;
};

export function EntityTypeFormSection({ children, defaultType, defaultFullName, defaultCompanyName }: EntityTypeFormSectionProps) {
  const [entityType, setEntityType] = useState<'INDIVIDUAL' | 'BUSINESS'>(defaultType ?? 'INDIVIDUAL');
  const isIndividual = entityType === 'INDIVIDUAL';

  return (
    <AdminCmsSection title="Тип профиля" description="Выберите тип мастера: частный специалист или компания.">
      <AdminCmsGrid>
        <FormField htmlFor="master-entityType" label="Тип">
          <Select
            id="master-entityType"
            name="entityType"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as 'INDIVIDUAL' | 'BUSINESS')}
          >
            <option value="INDIVIDUAL">Частный специалист</option>
            <option value="BUSINESS">Компания</option>
          </Select>
        </FormField>

        {isIndividual ? (
          <FormField htmlFor="master-fullName" label="ФИО">
            <Input id="master-fullName" name="fullName" required={isIndividual} maxLength={180} defaultValue={defaultFullName ?? ''} />
          </FormField>
        ) : (
          <FormField htmlFor="master-companyName" label="Компания">
            <Input id="master-companyName" name="companyName" required={!isIndividual} maxLength={180} defaultValue={defaultCompanyName ?? ''} />
          </FormField>
        )}
      </AdminCmsGrid>
      {children}
    </AdminCmsSection>
  );
}
