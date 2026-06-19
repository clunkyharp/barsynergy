'use client';

import { useMemo, useState, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Skill = {
  id: string;
  name: string;
};

type SkillsSelectorProps = {
  allSkills: Skill[];
  selectedSkillIds: Set<string>;
};

const MAX_SKILLS = 20;
const MAX_SKILL_LENGTH = 40;

function normalizeSkillName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function namesEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const left = [...a].map((name) => name.toLocaleLowerCase('ru-RU')).sort();
  const right = [...b].map((name) => name.toLocaleLowerCase('ru-RU')).sort();

  return left.every((name, index) => name === right[index]);
}

export function SkillsSelector({ allSkills, selectedSkillIds }: SkillsSelectorProps) {
  const [selectedNames, setSelectedNames] = useState(() =>
    allSkills.filter((skill) => selectedSkillIds.has(skill.id)).map((skill) => skill.name)
  );
  const initialSkills = allSkills
    .filter((skill) => selectedSkillIds.has(skill.id))
    .map((skill) => skill.name);
  const [query, setQuery] = useState('');
  const queryTrimmed = query.trim();
  const queryTooLong = queryTrimmed.length > MAX_SKILL_LENGTH;
  const selectedKeys = useMemo(
    () => new Set(selectedNames.map((name) => name.toLocaleLowerCase('ru-RU'))),
    [selectedNames]
  );
  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');

    if (!normalizedQuery) return [];

    return allSkills
      .filter((skill) => {
        const key = skill.name.toLocaleLowerCase('ru-RU');
        return !selectedKeys.has(key) && key.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [allSkills, query, selectedKeys]);
  const hasChanges = !namesEqual(selectedNames, initialSkills);
  const canAddMore = selectedNames.length < MAX_SKILLS;

  function addSkill(value: string) {
    const name = normalizeSkillName(value);
    const key = name.toLocaleLowerCase('ru-RU');

    if (!name || name.length > MAX_SKILL_LENGTH || selectedKeys.has(key) || !canAddMore) {
      return;
    }

    setSelectedNames((current) => [...current, name]);
    setQuery('');
  }

  function removeSkill(name: string) {
    const key = name.toLocaleLowerCase('ru-RU');
    setSelectedNames((current) => current.filter((item) => item.toLocaleLowerCase('ru-RU') !== key));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' && event.key !== ',') {
      return;
    }

    event.preventDefault();
    addSkill(query);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <Input
          className="pl-9"
          disabled={!canAddMore}
          maxLength={MAX_SKILL_LENGTH}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={canAddMore ? 'Введите навык и нажмите Enter' : 'Достигнут лимит навыков'}
          type="text"
          value={query}
        />
      </div>
      {queryTooLong ? (
        <p className="text-xs text-[var(--danger-text)]" role="alert">Максимальная длина навыка — {MAX_SKILL_LENGTH} символов.</p>
      ) : null}
      <p className="text-xs text-[var(--muted)]">Лимит 20 навыков</p>

      <div aria-live="polite" aria-relevant="additions removals">
        {selectedNames.map((name) => (
          <input key={name} name="skillNames" type="hidden" value={name} />
        ))}
      </div>

      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Подсказки навыков">
          {suggestions.map((skill) => (
            <button
              className="rounded-full border border-[var(--border-default)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] transition-colors hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              key={skill.id}
              onClick={() => addSkill(skill.name)}
              type="button"
            >
              {skill.name}
            </button>
          ))}
        </div>
      ) : null}

      {query.trim() && suggestions.length === 0 && canAddMore ? (
        <p className="text-sm text-[var(--muted)]">
          Нажмите Enter, чтобы добавить «{normalizeSkillName(query)}».
        </p>
      ) : null}

      {selectedNames.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedNames.map((name) => (
            <span
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-medium text-[var(--text)]"
              key={name}
            >
              {name}
              <button
                aria-label={`Удалить навык ${name}`}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                onClick={() => removeSkill(name)}
                type="button"
              >
                <X aria-hidden="true" size={14} strokeWidth={1.8} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">Добавьте до 20 навыков: например, бариста, калькуляция, обучение команды.</p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
        <p className="text-sm text-[var(--muted)]">Выбранные навыки будут видны работодателям.</p>
        <Button disabled={!hasChanges} type="submit">
          Сохранить навыки
        </Button>
      </div>
    </div>
  );
}
