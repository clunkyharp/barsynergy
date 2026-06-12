import { EditorialCard, DirectoryCard, ActionCard } from '@/components/ui/cards';

export default function CardsDevPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-10">
      <div className="container grid gap-10">
        <h1 className="text-3xl font-semibold">Card Primitives — Dev Preview</h1>

        {/* EditorialCard */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">EditorialCard</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <EditorialCard
              action={{ href: '#', label: 'Подробнее' }}
              eyebrow="Статья"
              media={{ kind: 'image', src: undefined }}
              summary="Короткое описание материала для читателя."
              title="Как настроить помол для эспрессо"
            />
            <EditorialCard
              action={{ href: '#', label: 'Записаться' }}
              isFeatured
              media={{ kind: 'image', src: undefined }}
              summary="Интенсив для бариста с опытом от 3 месяцев."
              title="Интенсив по эспрессо"
            />
            <EditorialCard
              action={{ href: '#', label: 'Читать' }}
              media={{ kind: 'image', src: undefined }}
              summary="Обзор оборудования для кофейни."
              title="Лучшие кофемашины 2024"
              tags={['Обзор', 'Оборудование']}
            />
          </div>
        </section>

        {/* DirectoryCard */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">DirectoryCard</h2>
          <div className="grid gap-4">
            <DirectoryCard
              actions={[
                { href: '#', label: 'Связаться' },
                { href: '#', label: 'Профиль', variant: 'secondary' }
              ]}
              label="Поставщик"
              lead="Кофе, оборудование, обучение"
              media={{ kind: 'logo', initials: 'КЛ' }}
              statusLabel="Проверен"
              subtitle="Кофейня «Локо»"
              title="Локо"
              verified
              websiteUrl="https://example.com"
            />
            <DirectoryCard
              actions={[{ href: '#', label: 'Откликнуться' }]}
              description="Опыт работы от 1 года. Полная занятость."
              label="Вакансия"
              media={{ kind: 'none' }}
              meta={[
                { label: 'Город', value: 'Ставрополь' },
                { label: 'Занятость', value: 'Полная' },
                { label: 'Зарплата', value: 'от 50 000 ₽' }
              ]}
              subtitle="Кофейня «Бункер»"
              title="Бариста"
            />
          </div>
        </section>

        {/* ActionCard */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">ActionCard</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              actions={[{ href: '#', label: 'Связаться с поставщиком' }]}
              description="Напишите поставщику напрямую через форму."
              title="Действия"
            />
            <ActionCard
              actions={[
                { href: '#', label: 'Записаться' },
                { href: '#', label: 'Подробнее', variant: 'secondary' }
              ]}
              description="Интенсив на 6 часов, до 8 человек."
              title="Запись на интенсив"
              variant="accent"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
