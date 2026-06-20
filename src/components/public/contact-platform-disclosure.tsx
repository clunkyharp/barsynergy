"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { displayFont } from "@/lib/fonts";

type ContactPlatformDisclosureProps = {
  children: ReactNode;
  defaultOpen?: boolean;
};

const promiseList = [
  "Подберём формат — событие, обучение, материал или каталог",
  "Передадим запрос человеку, который отвечает за нужное направление",
  "Пришлём короткое предложение с шагами и сроком",
] as const;

export function ContactPlatformDisclosure({
  children,
  defaultOpen = false,
}: ContactPlatformDisclosureProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const hasAutoFocusedRef = useRef(false);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);

  useEffect(() => {
    function checkHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (
        hash === "platform" ||
        hash === "contact-form" ||
        hash === "applications"
      ) {
        setOpen(true);
      }
    }

    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  useEffect(() => {
    if (!open) {
      hasAutoFocusedRef.current = false;
      return;
    }

    const target = formRef.current ?? sectionRef.current;
    if (!target || hasAutoFocusedRef.current) return;
    hasAutoFocusedRef.current = true;
    const frame = requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      const firstField = sectionRef.current?.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])',
      );
      firstField?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function handleOpen() {
    window.history.pushState(null, "", "#platform");
    setOpen(true);
  }

  return (
    <section
      className="relative scroll-mt-36 border-b border-[var(--line)] bg-[var(--surface-muted)] py-10 md:scroll-mt-44 md:py-14"
      id="applications"
      ref={sectionRef}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_30%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_28%),radial-gradient(circle_at_82%_22%,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_30%)]"
      />
      <div className="container relative">
        <div className="mx-auto max-w-5xl">
          <div
            className="min-w-0 scroll-mt-16 md:scroll-mt-44"
            id="contact-form"
            ref={formRef}
          >
            {open ? (
              <div className="animate-form-section-reveal mx-auto max-w-3xl">
                {children}
              </div>
            ) : (
              <article className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface)] p-6 shadow-[var(--shadow-panel)] md:p-10">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_24%,transparent),transparent_70%)]"
                />
                <div className="relative grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--accent)]/30 bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                      <Sparkles aria-hidden="true" size={12} strokeWidth={2} />
                      Рекомендуемый путь
                    </span>
                    <h2
                      className={`${displayFont.className} mt-4 text-[1.85rem] font-semibold leading-[1.05] text-[var(--text)] md:text-[2.6rem]`}
                    >
                      Опишите задачу — соберём формат под неё
                    </h2>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
                      Опишите, что хотите сделать: событие, обучение, материал,
                      партнёрство или размещение. Мы уточним детали и предложим
                      следующий шаг.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Button
                        className="rounded-[var(--radius-md)] px-5"
                        onClick={handleOpen}
                        size="lg"
                        type="button"
                      >
                        Открыть форму
                        <ArrowUpRight aria-hidden="true" size={16} />
                      </Button>
                      <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
                        <FileText
                          aria-hidden="true"
                          size={14}
                          strokeWidth={1.8}
                        />
                        Занимает 2 минуты
                      </span>
                    </div>
                  </div>

                  <ul className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5 md:self-center">
                    {promiseList.map((promise) => (
                      <li
                        className="flex items-start gap-3 text-sm leading-6 text-[var(--text)]"
                        key={promise}
                      >
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]">
                          <Check
                            aria-hidden="true"
                            size={12}
                            strokeWidth={2.4}
                          />
                        </span>
                        <span>{promise}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
