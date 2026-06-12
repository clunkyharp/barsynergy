'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';

const homepageFaqItems = [
  {
    question: 'Что уже можно сделать на платформе?',
    answer:
      'Можно читать материалы, смотреть образовательные форматы, проверять вакансии, находить поставщиков и оставлять заявки на партнёрские задачи.'
  },
  {
    question: 'Кому подходит BARSYNERGY?',
    answer:
      'Платформа рассчитана на бариста, управляющих, владельцев заведений, поставщиков, бренды и специалистов, которые работают с HoReCa в СКФО.'
  },
  {
    question: 'Можно ли предложить своё событие или материал?',
    answer:
      'Да. Через раздел контактов можно отправить идею события, партнёрского проекта, обучающего формата или публикации.'
  },
  {
    question: 'Есть ли инструменты для заведений?',
    answer:
      'Да. На главной уже есть калькулятор себестоимости, а для заведений доступны заявки по цифровым решениям, вакансиям, поставщикам и консалтингу.'
  },
  {
    question: 'Сколько стоит размещение в каталоге?',
    answer:
      'Размещение в каталоге заведений и поставщиков сейчас бесплатное. Для спонсорских форматов условия обсуждаются отдельно.'
  }
] as const;

export function HomeCtaFaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setActiveIndex((currentIndex) => (currentIndex === index ? null : index));
  };

  return (
    <section
      aria-labelledby="home-cta-title"
      className="background-zone background-zone-ivory render-deferred-section border-b border-[var(--line)] py-10 md:py-14 text-[var(--text)]"
      id="home-platform-help"
    >
      <div className="mx-auto w-full max-w-[1100px] px-5">
        <div className="grid grid-cols-[1.6fr_1fr] items-stretch gap-[30px] max-[900px]:grid-cols-1 max-[900px]:gap-[60px]">
          <div
            className="bars-home-gradient flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-[var(--editorial-dark-border)] px-10 py-20 text-center text-[var(--editorial-dark-text)] max-[640px]:px-6 max-[640px]:py-14"
            style={{ boxShadow: 'var(--shadow-panel)' }}
          >
            <h2
              id="home-cta-title"
              className={`${displayFont.className} mb-[15px] text-[3.35rem] font-semibold leading-[1.04] max-[640px]:text-[2.45rem]`}
            >
              Напишите команде
              <br />
              BARSYNERGY
            </h2>
            <p className="mb-[30px] max-w-[34rem] text-[0.95rem] font-medium leading-7 text-[var(--editorial-dark-muted)]">
              Ответим на вопрос, примем идею события или поможем выбрать нужный раздел.
            </p>
            <Button
              className="w-full rounded-[var(--radius-md)] border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-none hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] md:w-auto"
              href="/contacts#contact-form"
            >
              Связаться с нами
            </Button>
          </div>

          <div className="home-help-faq-list flex flex-col gap-3">
            {homepageFaqItems.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  aria-controls={`home-faq-answer-${index}`}
                  aria-expanded={isActive}
                  className="home-help-faq-item cursor-pointer rounded-[var(--radius-md)] border bg-[var(--surface-card)] px-5 py-[18px] text-left transition-[background-color,border-color,box-shadow,color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--card-border-hover)] hover:bg-[var(--surface-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
                  data-active={isActive ? 'true' : 'false'}
                  key={item.question}
                  onClick={() => toggleFaq(index)}
                  style={{
                    borderColor: isActive ? 'var(--card-border-hover)' : 'var(--card-border)',
                    boxShadow: isActive ? 'var(--shadow-card)' : 'none'
                  }}
                  type="button"
                >
                  <span className="flex items-center justify-between gap-4 text-[0.9rem] font-semibold text-[var(--text)]">
                    <span>{item.question}</span>
                    {isActive ? <ChevronUp aria-hidden="true" size={20} /> : <ChevronDown aria-hidden="true" size={20} />}
                  </span>
                  {isActive ? (
                    <span className="home-help-faq-answer mt-3 block text-[0.9rem] leading-[1.6] text-[var(--muted)]" id={`home-faq-answer-${index}`}>
                      {item.answer}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
