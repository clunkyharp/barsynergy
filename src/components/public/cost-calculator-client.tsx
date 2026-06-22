'use client';

import { ChevronDown, Link2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { CalculatorResultRail } from '@/components/public/cost-calculator/result-rail';
import { CalculatorParameters } from '@/components/public/cost-calculator/calculator-parameters';
import { AdditionalCostsEditor } from '@/components/public/cost-calculator/additional-costs-editor';
import { PopularDrinks } from '@/components/public/cost-calculator/popular-drinks';
import { HelpfulTips } from '@/components/public/cost-calculator/helpful-tips';
import { MarkupPricing } from '@/components/public/cost-calculator/markup-pricing';
import { IngredientEditor } from '@/components/public/cost-calculator/ingredient-editor';
import { useCostCalculatorState } from '@/components/public/cost-calculator/use-cost-calculator-state';
import {
  CalculatorFormulaHelp,
  CalculatorMobileResultStrip,
  CalculatorShell,
  ModeSelector,
  ParameterFields,
  SectionDivider,
} from '@/components/public/cost-calculator-sections';

/* ------------------------------------------------------------------ */
/* Toolbar (page‑level actions)                                       */
/* ------------------------------------------------------------------ */
function formatTime(date: Date) {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function CalculatorToolbar({
  hasAnyInput,
  lastSavedAt,
  onClear,
  onFillDemo,
  onShare,
}: {
  hasAnyInput: boolean;
  lastSavedAt: Date | null;
  onClear: () => void;
  onFillDemo: () => void;
  onShare: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          className="min-h-10 rounded-[var(--radius-sm)] px-3 text-sm"
          onClick={onFillDemo}
          size="sm"
          type="button"
          variant="secondary"
        >
          Заполнить примером
        </Button>
        <Button
          className="min-h-10 rounded-[var(--radius-sm)] px-3 text-sm"
          disabled={!hasAnyInput}
          onClick={onClear}
          size="sm"
          type="button"
          variant="ghost"
        >
          <RotateCcw size={15} strokeWidth={1.8} />
          Новый расчёт
        </Button>
        <Button
          className="min-h-10 rounded-[var(--radius-sm)] px-3 text-sm"
          onClick={onShare}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Link2 size={15} strokeWidth={1.8} />
          Поделиться ссылкой
        </Button>
      </div>
      {lastSavedAt ? (
        <span aria-live="polite" className="text-[11px] leading-none text-[var(--muted)]">
          Сохранено локально · {formatTime(lastSavedAt)}
        </span>
      ) : null}
    </div>
  );
}

/* ================================================================== */
/* Main client component                                              */
/* ================================================================== */
export function CostCalculatorClient() {
  const calc = useCostCalculatorState();
  const { showToast } = useToast();

  async function handleShareRecipe() {
    const result = await calc.shareRecipe();

    if (result === 'shared') {
      showToast({
        id: 'calculator-share',
        title: 'Ссылка готова',
        description: 'Рецепт передан через системное окно.',
        tone: 'success',
        duration: 3200
      });
      return;
    }

    if (result === 'copied') {
      showToast({
        id: 'calculator-share',
        title: 'Ссылка скопирована',
        description: 'Откройте её на другом устройстве или отправьте в чат.',
        tone: 'success',
        duration: 3200
      });
      return;
    }

    showToast({
      id: 'calculator-share',
      title: 'Не удалось поделиться',
      description: 'Попробуйте ещё раз.',
      tone: 'error',
      duration: 5000
    });
  }

  return (
    <>
      <CalculatorShell
        resultRail={
          <CalculatorResultRail
            breakdown={calc.breakdown}
            copyState={calc.copyState}
            onCopyResult={calc.copyResult}
            resultMessage={calc.resultMessage}
            resultMessageKind={calc.resultMessageKind}
            summary={calc.summary}
          />
        }
      >
        {/* LEFT PANEL */}
        <div className="calculator-panel cost-sheet min-w-0">

          {/* Toolbar */}
          <CalculatorToolbar
            hasAnyInput={calc.hasAnyInput}
            lastSavedAt={calc.lastSavedAt}
            onClear={calc.clearCalculator}
            onFillDemo={calc.fillDemo}
            onShare={handleShareRecipe}
          />

          {/* Mode selector */}
          <div className="mt-6">
            <h3 className="calculator-input-group-title mb-3">Режим</h3>
            <ModeSelector onChange={calc.setPricingMode} value={calc.pricingMode} />
          </div>

          {/* Basic parameters */}
          <div className="mt-6">
            <h3 className="calculator-input-group-title mb-3">Параметры</h3>
            <ParameterFields
              canShowRecommendedPrice={calc.summary.canShowRecommendedPrice}
              foodCostError={calc.foodCostError}
              foodCostPercent={calc.foodCostPercent}
              isManualMode={calc.isManualMode}
              itemName={calc.itemName}
              onFoodCostChange={calc.setFoodCostPercent}
              onItemNameChange={calc.setItemName}
              onSalePriceChange={calc.setSalePrice}
              recommendedPrice={calc.recommendedPrice}
              salePrice={calc.salePrice}
              salePriceError={calc.salePriceError}
            />
          </div>

          <CalculatorMobileResultStrip summary={calc.summary} />

          <SectionDivider />

          {/* Ingredients */}
          <IngredientEditor
            hasAnyInput={calc.hasAnyInput}
            onAddIngredient={calc.addIngredient}
            onDuplicate={calc.duplicateIngredient}
            onRemove={calc.removeIngredient}
            onUpdate={calc.updateIngredient}
            rowStatusText={calc.rowStatusText}
            rows={calc.rows}
          />

          <details className="group mt-8 rounded-[var(--radius-lg)] border border-[var(--border-default)]">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-[var(--text)] transition-colors hover:text-[var(--accent)] [&::-webkit-details-marker]:hidden">
              Дополнительные параметры
              <ChevronDown className="transition-transform duration-[var(--motion-duration-base)] group-open:rotate-180 motion-reduce:transition-none" size={16} strokeWidth={1.8} />
            </summary>
            <div className="px-5 pb-5">
              <SectionDivider />

              {/* Additional costs */}
              <AdditionalCostsEditor
                costs={calc.additionalCostRows}
                onAdd={calc.addAdditionalCost}
                onRemove={calc.removeAdditionalCost}
                onUpdate={calc.updateAdditionalCost}
                total={calc.additionalCostTotal}
              />

              <SectionDivider />

              {/* Drink parameters */}
              <CalculatorParameters
                params={calc.drinkParams}
                onParamChange={calc.updateDrinkParam}
              />
            </div>
          </details>

          <SectionDivider />

          {/* Markup & pricing */}
          <MarkupPricing
            customMarkupPercent={calc.customMarkupPercent}
            grossProfit={calc.grossProfit}
            markupPercent={calc.markupPercent}
            onMarkupChange={calc.setCustomMarkupPercent}
            onRoundingChange={calc.setRoundingMode}
            roundingMode={calc.roundingMode}
            totalCost={calc.totalCost}
          />

          {/* Formula help (no divider — it's always last) */}
          <CalculatorFormulaHelp />
        </div>
      </CalculatorShell>

      {/* Below calculator: popular drinks + tips */}
      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-10">
        <div className="container">
          <PopularDrinks />
        </div>
      </section>

      <HelpfulTips />
    </>
  );
}
