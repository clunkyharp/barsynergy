'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type WorkExperience = {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
};

type ExperienceEditorProps = {
  initial: WorkExperience[];
};

export function ExperienceEditor({ initial }: ExperienceEditorProps) {
  const [entries, setEntries] = useState<WorkExperience[]>(initial);
  const newIndex = entries.length;

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <>
      {entries.map((exp, idx) => (
        <div key={exp.id} className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--line)] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{exp.companyName || 'Запись'}</p>
            <button
              className={cn(
                'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-semibold text-[var(--muted)] transition-colors',
                'hover:bg-[var(--danger-bg)] hover:text-[var(--danger-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--danger-text)]'
              )}
              onClick={() => removeEntry(exp.id)}
              type="button"
            >
              <Trash2 size={13} strokeWidth={1.8} />
              Удалить
            </button>
          </div>
          <input name={`experiences.${idx}.id`} type="hidden" value={exp.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField htmlFor={`companyName-${idx}`} label="Компания">
              <Input id={`companyName-${idx}`} name={`experiences.${idx}.companyName`} required maxLength={240} defaultValue={exp.companyName} />
            </FormField>
            <FormField htmlFor={`position-${idx}`} label="Должность">
              <Input id={`position-${idx}`} name={`experiences.${idx}.position`} required maxLength={240} defaultValue={exp.position} />
            </FormField>
            <FormField htmlFor={`startDate-${idx}`} label="Начало">
              <Input id={`startDate-${idx}`} name={`experiences.${idx}.startDate`} type="date" required defaultValue={exp.startDate} />
            </FormField>
            <FormField htmlFor={`endDate-${idx}`} label="Окончание">
              <Input id={`endDate-${idx}`} name={`experiences.${idx}.endDate`} type="date" defaultValue={exp.endDate ?? ''} />
            </FormField>
          </div>
          <FormField htmlFor={`description-${idx}`} label="Описание">
            <Textarea id={`description-${idx}`} name={`experiences.${idx}.description`} maxLength={2000} rows={3} defaultValue={exp.description ?? ''} placeholder="Чем вы занимались на этой позиции" />
          </FormField>
        </div>
      ))}
      <div className="grid gap-4 rounded-[var(--radius-md)] border border-dashed border-[var(--line)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Новая запись</p>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField htmlFor={`companyName-new`} label="Компания">
            <Input id="companyName-new" name={`experiences.${newIndex}.companyName`} maxLength={240} placeholder="Название компании" />
          </FormField>
          <FormField htmlFor={`position-new`} label="Должность">
            <Input id="position-new" name={`experiences.${newIndex}.position`} maxLength={240} placeholder="Должность" />
          </FormField>
          <FormField htmlFor={`startDate-new`} label="Начало">
            <Input id="startDate-new" name={`experiences.${newIndex}.startDate`} type="date" />
          </FormField>
          <FormField htmlFor={`endDate-new`} label="Окончание">
            <Input id="endDate-new" name={`experiences.${newIndex}.endDate`} type="date" />
          </FormField>
        </div>
        <FormField htmlFor={`description-new`} label="Описание">
          <Textarea id="description-new" name={`experiences.${newIndex}.description`} maxLength={2000} rows={3} placeholder="Чем вы занимались на этой позиции" />
        </FormField>
      </div>
    </>
  );
}