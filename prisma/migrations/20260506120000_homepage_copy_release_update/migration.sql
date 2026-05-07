UPDATE "HomepageHero"
SET
    "description" = 'Здесь собраны обучение, события, вакансии, поставщики и партнёрские предложения для барной индустрии СКФО.',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'homepage-hero-default'
  AND "description" = 'Здесь собраны обучение, события, вакансии, поставщики и партнёрские запросы для барной индустрии СКФО.';

UPDATE "HomepageCalculatorTeaser"
SET
    "description" = 'Рассчитайте себестоимость напитка или позиции меню.',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'homepage-calculator-teaser-default'
  AND "description" = 'Рассчитайте себестоимость напитка или позиции меню без регистрации и сохранения данных.';
