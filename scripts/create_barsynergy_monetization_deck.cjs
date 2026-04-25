const pptxgen = require("pptxgenjs");
const path = require("path");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Codex";
pptx.company = "BARSYNERGY";
pptx.subject = "Monetization strategy";
pptx.title = "Монетизация BARSYNERGY";
pptx.lang = "ru-RU";
pptx.theme = {
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  lang: "ru-RU",
};
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";
pptx.margin = 0;

const W = 13.333;
const H = 7.5;
const C = {
  bg: "F7F8F4",
  paper: "FFFFFF",
  ink: "17211B",
  muted: "626962",
  line: "DDE2DA",
  green: "2D7A57",
  green2: "E4F1E9",
  amber: "C99042",
  amber2: "FFF1D9",
  blue: "326A8C",
  blue2: "E5F0F5",
  red: "A64A43",
  red2: "F7E4E1",
  dark: "111B16",
};

function baseSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  return slide;
}

function title(slide, text, sub) {
  slide.addText(text, {
    x: 0.55,
    y: 0.35,
    w: 8.9,
    h: 0.35,
    fontFace: "Arial",
    fontSize: 21,
    bold: true,
    color: C.ink,
    margin: 0,
    breakLine: false,
    fit: "shrink",
  });
  if (sub) {
    slide.addText(sub, {
      x: 9.6,
      y: 0.38,
      w: 3.1,
      h: 0.24,
      fontSize: 7.5,
      bold: true,
      color: C.green,
      align: "right",
      margin: 0,
      fit: "shrink",
    });
  }
  slide.addShape(pptx.ShapeType.line, {
    x: 0.55,
    y: 0.86,
    w: 12.2,
    h: 0,
    line: { color: C.line, width: 1 },
  });
}

function footer(slide, n) {
  slide.addText(String(n).padStart(2, "0"), {
    x: 12.35,
    y: 7.1,
    w: 0.4,
    h: 0.18,
    fontSize: 7,
    color: "8B928C",
    align: "right",
    margin: 0,
  });
}

function tag(slide, text, x, y, w, color = C.green, fill = C.green2) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.25,
    rectRadius: 0.04,
    fill: { color: fill },
    line: { color: fill },
  });
  slide.addText(text, {
    x: x + 0.08,
    y: y + 0.06,
    w: w - 0.16,
    h: 0.1,
    fontSize: 6.8,
    bold: true,
    color,
    align: "center",
    margin: 0,
    fit: "shrink",
  });
}

function bulletText(items) {
  return items.map((item) => `• ${item}`).join("\n");
}

function card(slide, x, y, w, h, heading, items, opts = {}) {
  const fill = opts.fill || C.paper;
  const stroke = opts.stroke || C.line;
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: fill },
    line: { color: stroke, width: 0.8 },
  });
  if (opts.badge) tag(slide, opts.badge, x + w - 1.45, y + 0.14, 1.18, opts.badgeColor || C.green, opts.badgeFill || C.green2);
  slide.addText(heading, {
    x: x + 0.22,
    y: y + 0.18,
    w: w - 0.44,
    h: 0.38,
    fontSize: opts.headingSize || 12,
    bold: true,
    color: opts.headingColor || C.ink,
    margin: 0,
    fit: "shrink",
  });
  slide.addText(bulletText(items), {
    x: x + 0.25,
    y: y + 0.66,
    w: w - 0.5,
    h: h - 0.82,
    fontSize: opts.fontSize || 8.2,
    color: opts.color || C.muted,
    breakLine: false,
    valign: "top",
    margin: 0,
    fit: "shrink",
    paraSpaceAfterPt: 3,
  });
}

function miniTable(slide, rows, x, y, w, h, colW, fontSize = 7.2) {
  const table = rows.map((row, rowIdx) =>
    row.map((text) => ({
      text,
      options: {
        bold: rowIdx === 0,
        color: rowIdx === 0 ? C.ink : C.muted,
        fill: rowIdx === 0 ? C.green2 : rowIdx % 2 ? "FFFFFF" : "FAFBF8",
        margin: rowIdx === 0 ? 0.04 : 0.035,
        valign: "mid",
        fit: "shrink",
      },
    }))
  );
  slide.addTable(table, {
    x,
    y,
    w,
    h,
    colW,
    fontFace: "Arial",
    fontSize,
    border: { type: "solid", color: C.line, pt: 0.5 },
    color: C.muted,
    valign: "mid",
  });
}

function threeColumn(slide, groups) {
  const x0 = 0.55;
  const gap = 0.25;
  const w = (12.25 - gap * 2) / 3;
  groups.forEach((g, i) => {
    card(slide, x0 + i * (w + gap), 1.25, w, 5.55, g.title, g.items, {
      fill: g.fill,
      stroke: g.stroke,
      headingColor: g.color,
      fontSize: 8.3,
      badge: g.badge,
      badgeColor: g.color,
      badgeFill: g.badgeFill,
    });
  });
}

// 1
{
  const slide = pptx.addSlide();
  slide.background = { color: C.dark };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.dark }, line: { color: C.dark } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 6.82, w: W, h: 0.68, fill: { color: C.green }, line: { color: C.green } });
  slide.addText("Монетизация\nBARSYNERGY", {
    x: 0.72,
    y: 1.35,
    w: 7.4,
    h: 1.35,
    fontSize: 34,
    bold: true,
    color: "FFFFFF",
    margin: 0,
    breakLine: false,
    fit: "shrink",
  });
  slide.addText("Пути выручки для отраслевой платформы и образовательного комьюнити барной индустрии СКФО", {
    x: 0.76,
    y: 3.05,
    w: 6.75,
    h: 0.95,
    fontSize: 14,
    color: "DDE7DF",
    margin: 0,
    fit: "shrink",
  });
  slide.addText("Стратегия монетизации", {
    x: 0.78,
    y: 6.98,
    w: 3.2,
    h: 0.18,
    fontSize: 8,
    bold: true,
    color: "FFFFFF",
    margin: 0,
  });
  ["образование", "события", "B2B", "контент", "сервисы"].forEach((t, i) => {
    tag(slide, t, 8.3, 1.2 + i * 0.58, 2.2, "FFFFFF", i % 2 ? C.blue : C.amber);
  });
  footer(slide, 1);
}

// 2
{
  const slide = baseSlide();
  title(slide, "Краткое резюме", "логика монетизации");
  card(slide, 0.65, 1.25, 3.8, 2.25, "Не один источник дохода", [
    "выручка строится из нескольких моделей",
    "образование + события + B2B",
    "размещения и услуги дополняют ядро",
  ], { fill: C.green2, stroke: "C8E2D2", headingColor: C.green });
  card(slide, 4.75, 1.25, 3.8, 2.25, "От простого к сложному", [
    "сначала заявки и ручные продажи",
    "затем платные размещения",
    "после проверки спроса — автоматизация",
  ], { fill: C.paper });
  card(slide, 8.85, 1.25, 3.8, 2.25, "Что не первый этап", [
    "онлайн-оплаты не обязательны в MVP",
    "подписка требует контентного ядра",
    "кабинеты нужны после стабильного спроса",
  ], { fill: C.amber2, stroke: "F0D7A8", headingColor: C.amber });
  miniTable(slide, [
    ["Сильные модели", "Почему"],
    ["Образование", "ядро платформы, понятная ценность"],
    ["События", "быстрый спрос, офлайн-связи"],
    ["B2B-партнерства", "крупнее чеки, доступ к аудитории"],
    ["Размещения", "быстро запустить через заявки"],
    ["Корпоративные услуги", "высокий чек и повторяемость"],
  ], 1.0, 4.0, 11.3, 2.05, [3.1, 8.2], 10);
  footer(slide, 2);
}

// 3
{
  const slide = baseSlide();
  title(slide, "Карта всех вариантов монетизации", "18 бизнес-моделей");
  const rows = [
    ["Модель", "Клиент", "Что продаем", "Этап", "Сложн.", "Потенц.", "Комментарий"],
    ["Курсы / интенсивы / мастер-классы", "специалисты", "обучение", "MVP", "средняя", "высокий", "ядро проекта"],
    ["Платные события", "индустрия", "билеты", "MVP", "средняя", "высокий", "лекции, дегустации, форумы"],
    ["Корпоративное обучение", "заведения", "обучение команд", "MVP", "средняя", "высокий", "чек выше B2C"],
    ["Платные вакансии", "работодатели", "размещение", "после первых пользователей", "низкая", "средний", "быстрый B2B-старт"],
    ["Платные поставщики", "поставщики", "карточка", "после первых пользователей", "низкая", "высокий", "каталог + лиды"],
    ["Партнерские пакеты", "бренды", "пакеты доступа", "после проверки спроса", "средняя", "высокий", "крупные чеки"],
    ["Спонсорство событий", "бренды", "интеграции", "после проверки спроса", "средняя", "высокий", "офлайн + контент"],
    ["Premium база знаний", "специалисты", "закрытый контент", "поздняя стадия", "высокая", "средний", "нужен контентный запас"],
    ["Кабинет работодателя", "заведения", "SaaS-доступ", "поздняя стадия", "высокая", "высокий", "после активных вакансий"],
    ["Кабинет поставщика", "поставщики", "SaaS-доступ", "поздняя стадия", "высокая", "высокий", "после работающего каталога"],
    ["Подарочные сертификаты", "частные лица / HR", "сертификат", "после первых пользователей", "низкая", "средний", "простое доп. предложение"],
    ["Экспертные консультации", "заведения", "консалтинг", "после первых пользователей", "средняя", "высокий", "аудит, запуск меню"],
    ["Комиссия с образовательных партнеров", "школы", "лиды / продажи", "после проверки спроса", "средняя", "средний", "сначала фикс"],
    ["Комиссия с мероприятий партнеров", "организаторы", "лиды / продажи", "после проверки спроса", "средняя", "средний", "после аналитики"],
    ["Реклама и нативные материалы", "бренды", "контент", "после первых пользователей", "низкая", "средний", "гайд, интервью, спецпроект"],
    ["Email / Telegram", "бренды / работодатели", "анонсы", "после первых пользователей", "низкая", "средний", "слоты и подборки"],
    ["Marketplace услуг", "индустрия", "услуги", "поздняя стадия", "высокая", "средний", "требует спроса и контроля"],
    ["Региональные представители", "партнеры", "региональные права", "поздняя стадия", "высокая", "средний", "только после модели СКФО"],
  ];
  miniTable(slide, rows, 0.35, 1.08, 12.65, 5.96, [2.22, 1.31, 1.5, 1.45, 0.7, 0.78, 4.69], 5.7);
  footer(slide, 3);
}

// 4
{
  const slide = baseSlide();
  title(slide, "Приоритет монетизации", "что запускать раньше");
  threeColumn(slide, [
    {
      title: "Приоритет 1",
      badge: "MVP",
      color: C.green,
      fill: C.green2,
      stroke: "C8E2D2",
      badgeFill: "D2EBDD",
      items: [
        "платные курсы и интенсивы",
        "корпоративное обучение",
        "платные события",
        "партнерские заявки",
        "заявки на поставщиков и вакансии",
      ],
    },
    {
      title: "Приоритет 2",
      badge: "после спроса",
      color: C.amber,
      fill: C.paper,
      stroke: C.line,
      badgeFill: C.amber2,
      items: [
        "платные вакансии",
        "платные поставщики",
        "партнерские пакеты",
        "спонсорство событий",
        "сертификаты и консультации",
      ],
    },
    {
      title: "Приоритет 3",
      badge: "поздно",
      color: C.blue,
      fill: C.blue2,
      stroke: "CADFEA",
      badgeFill: "D8EAF2",
      items: [
        "онлайн-оплаты",
        "premium-подписка",
        "кабинеты бизнеса",
        "платный доступ поставщиков",
        "комиссии, marketplace, регионы",
      ],
    },
  ]);
  footer(slide, 4);
}

// 5
{
  const slide = baseSlide();
  title(slide, "Образовательная монетизация", "ядро проекта");
  threeColumn(slide, [
    {
      title: "Платные курсы / интенсивы",
      badge: "MVP",
      color: C.green,
      fill: C.green2,
      stroke: "C8E2D2",
      items: [
        "что продаем: обучение",
        "клиент: частные специалисты",
        "почему подходит: ядро проекта",
        "запуск: заявка, без оплаты на сайте",
        "потенциал: высокий",
        "сложность: низкая / средняя",
      ],
    },
    {
      title: "Корпоративное обучение",
      badge: "высокий чек",
      color: C.amber,
      fill: C.paper,
      stroke: C.line,
      badgeFill: C.amber2,
      items: [
        "что продаем: обучение команд",
        "клиент: бары, рестораны, сети",
        "средний чек выше B2C",
        "запуск: заявка + ручная обработка",
        "потенциал: очень высокий",
        "сложность: средняя",
      ],
    },
    {
      title: "Подарочные сертификаты",
      badge: "доп. доход",
      color: C.blue,
      fill: C.blue2,
      stroke: "CADFEA",
      badgeFill: "D8EAF2",
      items: [
        "что продаем: сертификаты",
        "на курсы и мастер-классы",
        "клиент: частные лица, HR, заведения",
        "просто добавить к заявкам",
        "потенциал: средний",
        "сложность: низкая",
      ],
    },
  ]);
  footer(slide, 5);
}

// 6
{
  const slide = baseSlide();
  title(slide, "События как источник выручки", "билеты + спонсоры");
  threeColumn(slide, [
    {
      title: "Платные события",
      badge: "MVP",
      color: C.green,
      fill: C.green2,
      stroke: "C8E2D2",
      items: [
        "лекции, дегустации, форумы",
        "мастер-классы и networking",
        "клиент: специалисты индустрии",
        "запуск: заявка → подтверждение",
        "позже: онлайн-оплата",
        "потенциал: высокий",
      ],
    },
    {
      title: "Спонсорство событий",
      badge: "B2B",
      color: C.amber,
      fill: C.paper,
      stroke: C.line,
      badgeFill: C.amber2,
      items: [
        "генеральный партнер",
        "партнер зоны / дегустации",
        "партнер конкурса / блока программы",
        "клиент: бренды, поставщики",
        "потенциал: высокий",
        "сложность: средняя",
      ],
    },
    {
      title: "Инфопартнерство",
      badge: "после спроса",
      color: C.blue,
      fill: C.blue2,
      stroke: "CADFEA",
      badgeFill: "D8EAF2",
      items: [
        "продвижение чужих событий",
        "фиксированное размещение",
        "анонс в каналах BARSYNERGY",
        "позже: процент / комиссия",
        "потенциал: средний",
        "сложность: низкая / средняя",
      ],
    },
  ]);
  footer(slide, 6);
}

// 7
{
  const slide = baseSlide();
  title(slide, "B2B-размещения", "быстрые платные заявки");
  threeColumn(slide, [
    {
      title: "Платные вакансии",
      badge: "низкая сложность",
      color: C.green,
      fill: C.green2,
      stroke: "C8E2D2",
      items: [
        "базовая вакансия",
        "выделенная вакансия",
        "пакет вакансий",
        "размещение + анонс",
        "клиент: бары, рестораны, сети",
        "потенциал: средний / высокий",
      ],
    },
    {
      title: "Платные поставщики",
      badge: "высокий потенциал",
      color: C.amber,
      fill: C.paper,
      stroke: C.line,
      badgeFill: C.amber2,
      items: [
        "базовая карточка",
        "расширенная карточка",
        "verified supplier",
        "закрепление в категории",
        "клиент: поставщики и сервисы",
        "сложность: низкая / средняя",
      ],
    },
    {
      title: "Партнеры / мероприятия",
      badge: "каталог",
      color: C.blue,
      fill: C.blue2,
      stroke: "CADFEA",
      badgeFill: "D8EAF2",
      items: [
        "карточка партнера",
        "анонс события",
        "выделение в каталоге",
        "пакет с Telegram / email",
        "потенциал: средний",
        "сложность: низкая",
      ],
    },
  ]);
  footer(slide, 7);
}

// 8
{
  const slide = baseSlide();
  title(slide, "Партнерские и спонсорские пакеты", "крупный B2B-чек");
  card(slide, 0.65, 1.25, 3.2, 5.4, "Для кого", [
    "алкогольные бренды",
    "дистрибьюторы",
    "поставщики",
    "сервисы для HoReCa",
    "образовательные партнеры",
    "заведения",
  ], { fill: C.green2, stroke: "C8E2D2", headingColor: C.green });
  card(slide, 4.05, 1.25, 4.25, 5.4, "Что продаем", [
    "партнер раздела",
    "партнер события",
    "партнер образовательной программы",
    "брендированный материал",
    "спецпроект",
    "анонс в Telegram / email",
    "баннер, карточка, офлайн-интеграция",
  ], { fill: C.paper, fontSize: 8 });
  card(slide, 8.5, 1.25, 4.15, 5.4, "Почему подходит", [
    "BARSYNERGY дает доступ к профессиональной аудитории",
    "формат хорошо подходит B2B",
    "можно продавать пакетами",
    "одна продажа может закрывать бюджет события",
    "потенциал: высокий",
    "сложность: средняя",
  ], { fill: C.amber2, stroke: "F0D7A8", headingColor: C.amber });
  footer(slide, 8);
}

// 9
{
  const slide = baseSlide();
  title(slide, "Контентная монетизация", "после появления аудитории");
  threeColumn(slide, [
    {
      title: "Premium база знаний",
      badge: "поздняя фаза",
      color: C.blue,
      fill: C.blue2,
      stroke: "CADFEA",
      badgeFill: "D8EAF2",
      items: [
        "рецепты и записи лекций",
        "чек-листы и шаблоны",
        "разборы и закрытые подборки",
        "запускать после сильного контентного ядра",
        "потенциал: средний / высокий",
        "сложность: высокая",
      ],
    },
    {
      title: "Нативные материалы",
      badge: "B2B",
      color: C.green,
      fill: C.paper,
      stroke: C.line,
      items: [
        "партнерская статья",
        "брендированный гайд",
        "интервью",
        "спецпроект",
        "подборка с партнером",
        "потенциал: средний",
      ],
    },
    {
      title: "Telegram / email",
      badge: "быстрый старт",
      color: C.amber,
      fill: C.amber2,
      stroke: "F0D7A8",
      badgeFill: "F6DEB2",
      items: [
        "рекламный слот",
        "анонс вакансии",
        "анонс события",
        "подборка поставщиков",
        "партнерский пост",
        "потенциал: средний",
      ],
    },
  ]);
  footer(slide, 9);
}

// 10
{
  const slide = baseSlide();
  title(slide, "Экспертные и сервисные модели", "услуги вокруг платформы");
  card(slide, 0.65, 1.2, 5.95, 2.45, "Экспертные консультации", [
    "аудит бара, запуск барной карты",
    "обучение команды, подбор поставщиков",
    "модель: фикс + комиссия",
    "потенциал: высокий; сложность: средняя",
  ], { fill: C.green2, stroke: "C8E2D2", headingColor: C.green });
  card(slide, 6.85, 1.2, 5.8, 2.45, "Комиссия с образовательных партнеров", [
    "размещение чужих курсов",
    "комиссия за заявку / продажу",
    "проще начать с фиксированного размещения",
    "потенциал: средний",
  ], { fill: C.paper });
  card(slide, 0.65, 4.05, 5.95, 2.45, "Комиссия с мероприятий партнеров", [
    "фикс за размещение",
    "позже процент с продажи",
    "нужна прозрачная аналитика заявок",
    "потенциал: средний",
  ], { fill: C.amber2, stroke: "F0D7A8", headingColor: C.amber });
  card(slide, 6.85, 4.05, 5.8, 2.45, "Marketplace услуг", [
    "ремонт, консалтинг, SMM, фото / видео",
    "запуск меню и барных карт",
    "позже как отдельное направление",
    "потенциал: средний / высокий; сложность: высокая",
  ], { fill: C.blue2, stroke: "CADFEA", headingColor: C.blue });
  footer(slide, 10);
}

// 11
{
  const slide = baseSlide();
  title(slide, "SaaS / кабинетные модели", "поздняя стадия");
  threeColumn(slide, [
    {
      title: "Кабинет работодателя",
      badge: "поздно",
      color: C.green,
      fill: C.green2,
      stroke: "C8E2D2",
      items: [
        "управление вакансиями",
        "отклики",
        "доступ к базе специалистов",
        "тарифы / подписка",
        "потенциал: высокий",
        "сложность: высокая",
      ],
    },
    {
      title: "Кабинет поставщика",
      badge: "поздно",
      color: C.amber,
      fill: C.paper,
      stroke: C.line,
      badgeFill: C.amber2,
      items: [
        "управление карточкой",
        "лиды",
        "акции",
        "статистика",
        "платный тариф",
        "потенциал: высокий",
      ],
    },
    {
      title: "Региональная модель",
      badge: "после модели",
      color: C.blue,
      fill: C.blue2,
      stroke: "CADFEA",
      badgeFill: "D8EAF2",
      items: [
        "локальные партнеры",
        "локальные события",
        "региональные пакеты",
        "представители / франшиза",
        "потенциал: средний / высокий",
        "сложность: высокая",
      ],
    },
  ]);
  footer(slide, 11);
}

// 12
{
  const slide = baseSlide();
  title(slide, "Путь от простого к сложному", "roadmap");
  const stages = [
    ["Этап 0", "без встроенных оплат", ["бесплатный контент", "каталог", "заявки", "ручные продажи", "проверка спроса"]],
    ["Этап 1", "ручная монетизация", ["платные курсы", "корп. обучение", "платные события", "партнерские заявки", "ручные оплаты"]],
    ["Этап 2", "B2B-монетизация", ["платные вакансии", "платные поставщики", "партнерские пакеты", "спонсоры", "размещения"]],
    ["Этап 3", "автоматизация", ["онлайн-оплаты", "тарифы", "статусы оплат", "документы", "фискализация"]],
    ["Этап 4", "регулярная выручка", ["premium", "подписка", "кабинеты бизнеса", "платные сервисы"]],
  ];
  const x0 = 0.55;
  const w = 2.35;
  stages.forEach((s, i) => {
    const x = x0 + i * 2.52;
    const fill = i < 2 ? C.green2 : i < 4 ? C.amber2 : C.blue2;
    const stroke = i < 2 ? "C8E2D2" : i < 4 ? "F0D7A8" : "CADFEA";
    card(slide, x, 1.35, w, 4.9, `${s[0]}\n${s[1]}`, s[2], {
      fill,
      stroke,
      headingSize: 11,
      fontSize: 7.5,
      headingColor: i < 2 ? C.green : i < 4 ? C.amber : C.blue,
    });
    if (i < stages.length - 1) {
      slide.addShape(pptx.ShapeType.triangle, {
        x: x + w + 0.08,
        y: 3.44,
        w: 0.2,
        h: 0.22,
        rotate: 90,
        fill: { color: "AEB7AE" },
        line: { color: "AEB7AE" },
      });
    }
  });
  slide.addText("Ключевой принцип: сначала подтвержденный спрос и ручные продажи, затем автоматизация.", {
    x: 0.85,
    y: 6.62,
    w: 11.65,
    h: 0.28,
    fontSize: 11,
    bold: true,
    color: C.ink,
    align: "center",
    margin: 0,
  });
  footer(slide, 12);
}

// 13
{
  const slide = baseSlide();
  title(slide, "Лучшие модели для старта", "top-5 + матрица");
  miniTable(slide, [
    ["Модель", "Почему подходит", "Запуск", "Сложн.", "Потенц."],
    ["Курсы и интенсивы", "ядро проекта", "быстро", "средняя", "высокий"],
    ["Корпоративное обучение", "крупный чек", "быстро", "средняя", "высокий"],
    ["Платные события", "видимый спрос", "быстро", "средняя", "высокий"],
    ["Партнерские пакеты", "B2B-доступ к аудитории", "средне", "средняя", "высокий"],
    ["Вакансии / поставщики", "простые заявки", "быстро", "низкая", "средний / высокий"],
  ], 0.55, 1.15, 7.25, 2.55, [1.65, 2.25, 1.05, 0.9, 1.4], 7.2);

  slide.addText("Матрица потенциал / сложность", {
    x: 8.25,
    y: 1.12,
    w: 4.1,
    h: 0.25,
    fontSize: 12,
    bold: true,
    color: C.ink,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.rect, { x: 8.15, y: 1.55, w: 4.1, h: 4.4, fill: { color: "FFFFFF" }, line: { color: C.line } });
  slide.addShape(pptx.ShapeType.line, { x: 10.2, y: 1.55, w: 0, h: 4.4, line: { color: C.line, width: 0.7 } });
  slide.addShape(pptx.ShapeType.line, { x: 8.15, y: 3.75, w: 4.1, h: 0, line: { color: C.line, width: 0.7 } });
  slide.addText("низкая сложность", { x: 8.2, y: 5.98, w: 1.7, h: 0.18, fontSize: 6.7, color: C.muted, margin: 0 });
  slide.addText("высокая сложность", { x: 10.55, y: 5.98, w: 1.55, h: 0.18, fontSize: 6.7, color: C.muted, margin: 0, align: "right" });
  slide.addText("высокий потенциал", { x: 7.95, y: 1.37, w: 1.55, h: 0.18, rotate: 270, fontSize: 6.7, color: C.muted, margin: 0 });
  const dots = [
    ["курсы", 8.55, 2.0, C.green],
    ["корп. обучение", 9.25, 2.38, C.green],
    ["события", 9.0, 3.0, C.amber],
    ["партнеры", 10.35, 2.62, C.amber],
    ["вакансии / поставщики", 8.65, 4.25, C.blue],
  ];
  dots.forEach(([t, x, y, color]) => {
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 1.35, h: 0.34, rectRadius: 0.04, fill: { color }, line: { color } });
    slide.addText(t, { x: x + 0.07, y: y + 0.1, w: 1.2, h: 0.1, fontSize: 5.9, bold: true, color: "FFFFFF", margin: 0, align: "center", fit: "shrink" });
  });
  card(slide, 0.55, 4.15, 7.25, 1.8, "Вывод для старта", [
    "начинать с моделей, где можно продать через заявку",
    "не ждать технической автоматизации",
    "собирать факты спроса: заявки, оплаты, повторные покупки",
  ], { fill: C.green2, stroke: "C8E2D2", headingColor: C.green, fontSize: 8.5 });
  footer(slide, 13);
}

// 14
{
  const slide = baseSlide();
  title(slide, "Что НЕ нужно делать на старте", "анти-приоритеты");
  const items = [
    "не запускать подписку в MVP",
    "не делать сложный marketplace",
    "не делать сразу B2B-кабинеты",
    "не делать сложную LMS",
    "не делать комиссию за лид без инфраструктуры",
    "не делать онлайн-оплаты до подтверждения спроса",
    "не распыляться сразу на все модели",
  ];
  items.forEach((txt, i) => {
    const x = i < 4 ? 0.85 : 6.9;
    const y = 1.3 + (i % 4) * 0.85;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: i < 4 ? 5.2 : 5.55,
      h: 0.56,
      rectRadius: 0.05,
      fill: { color: C.red2 },
      line: { color: "E9C4BE" },
    });
    slide.addText(`× ${txt}`, {
      x: x + 0.18,
      y: y + 0.16,
      w: (i < 4 ? 4.9 : 5.2),
      h: 0.12,
      fontSize: 10.5,
      bold: true,
      color: C.red,
      margin: 0,
      fit: "shrink",
    });
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.2,
    y: 5.45,
    w: 10.9,
    h: 0.78,
    rectRadius: 0.07,
    fill: { color: C.dark },
    line: { color: C.dark },
  });
  slide.addText("Сначала спрос и ручные продажи, потом автоматизация.", {
    x: 1.5,
    y: 5.72,
    w: 10.3,
    h: 0.16,
    fontSize: 15,
    bold: true,
    color: "FFFFFF",
    align: "center",
    margin: 0,
  });
  footer(slide, 14);
}

// 15
{
  const slide = baseSlide();
  title(slide, "Рекомендованная стартовая монетизация", "первый коммерческий набор");
  card(slide, 0.65, 1.2, 3.7, 3.0, "Основной доход", [
    "курсы",
    "интенсивы",
    "корпоративное обучение",
    "платные события",
  ], { fill: C.green2, stroke: "C8E2D2", headingColor: C.green, fontSize: 10 });
  card(slide, 4.65, 1.2, 3.7, 3.0, "B2B-доход", [
    "партнерские пакеты",
    "платные вакансии",
    "платные карточки поставщиков",
  ], { fill: C.paper, fontSize: 10 });
  card(slide, 8.65, 1.2, 3.7, 3.0, "Дополнительный доход", [
    "подарочные сертификаты",
    "экспертные консультации",
    "партнерские материалы",
  ], { fill: C.amber2, stroke: "F0D7A8", headingColor: C.amber, fontSize: 10 });
  miniTable(slide, [
    ["Логика запуска", "Что делать"],
    ["1", "сначала заявки и ручная продажа"],
    ["2", "потом платные размещения"],
    ["3", "затем автоматизация"],
    ["4", "после этого premium и кабинеты"],
  ], 1.2, 4.75, 10.9, 1.55, [1.15, 9.75], 10);
  footer(slide, 15);
}

// 16
{
  const slide = baseSlide();
  title(slide, "Финальный вывод", "стратегия запуска");
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.25,
    w: 11.75,
    h: 4.9,
    rectRadius: 0.08,
    fill: { color: C.paper },
    line: { color: C.line },
  });
  slide.addText(bulletText([
    "у BARSYNERGY несколько сильных источников выручки",
    "самые перспективные: образование, события, B2B-партнерства и размещения",
    "правильный путь: от простого к сложному",
    "сначала ручные продажи и проверка спроса",
    "затем автоматизация успешных моделей",
    "MVP не нужно перегружать сложной монетизацией",
  ]), {
    x: 1.3,
    y: 1.75,
    w: 10.75,
    h: 3.1,
    fontSize: 17,
    color: C.ink,
    breakLine: false,
    valign: "mid",
    margin: 0,
    fit: "shrink",
    paraSpaceAfterPt: 6,
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.3,
    y: 5.25,
    w: 10.75,
    h: 0.5,
    rectRadius: 0.06,
    fill: { color: C.green },
    line: { color: C.green },
  });
  slide.addText("Стартовая формула: обучение + события + B2B-заявки.", {
    x: 1.55,
    y: 5.43,
    w: 10.25,
    h: 0.12,
    fontSize: 12.5,
    bold: true,
    color: "FFFFFF",
    align: "center",
    margin: 0,
  });
  footer(slide, 16);
}

const out = path.join(process.cwd(), "BARSYNERGY-monetization.pptx");
pptx.writeFile({ fileName: out }).then(() => {
  console.log(out);
});
