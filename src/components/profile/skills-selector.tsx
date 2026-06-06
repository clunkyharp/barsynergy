'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { CheckboxField } from '@/components/ui/checkbox-field';

type Skill = {
  id: string;
  name: string;
};

type SkillsSelectorProps = {
  allSkills: Skill[];
  selectedSkillIds: Set<string>;
};

export function SkillsSelector({ allSkills, selectedSkillIds }: SkillsSelectorProps) {
  const [query, setQuery] = useState('');
  const [checked, setChecked] = useState(() => new Set(selectedSkillIds));

  const filtered = useMemo(() => {
    if (!query.trim()) return allSkills;
    const q = query.trim().toLowerCase();
    return allSkills.filter((s) => s.name.toLowerCase().includes(q));
  }, [allSkills, query]);

  if (allSkills.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">Навыки пока не добавлены в систему. Обратитесь к администратору.</p>
    );
  }

  return (
    <div>
      <div className="relative mb-3">
        <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={15} strokeWidth={1.8} />
        <input
          className="w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск навыков…"
          type="text"
          value={query}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        {filtered.map((skill) => (
          <CheckboxField
            key={skill.id}
            name="skillIds"
            value={skill.id}
            checked={checked.has(skill.id)}
            onChange={(e) => {
              setChecked((prev) => {
                const next = new Set(prev);
                if (e.target.checked) {
                  next.add(skill.id);
                } else {
                  next.delete(skill.id);
                }
                return next;
              });
            }}
          >
            {skill.name}
          </CheckboxField>
        ))}
        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Ничего не найдено.</p>
        ) : null}
      </div>
    </div>
  );
}