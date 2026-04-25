const pptxgen = require("pptxgenjs");
const path = require("path");
const ShapeType = new pptxgen().ShapeType;

const C = {
  bg: "F8F7F1",
  ink: "17211B",
  muted: "5E665F",
  line: "D9DED6",
  green: "2D7A57",
  greenSoft: "E3F0E8",
  amber: "C58B3A",
  amberSoft: "FFF0D6",
  blue: "2F6D8C",
  blueSoft: "E4EFF5",
  white: "FFFFFF",
  dark: "111B16",
};

function deck(title) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Codex";
  pptx.subject = title;
  pptx.title = title;
  pptx.lang = "ru-RU";
  pptx.theme = { headFontFace: "Arial", bodyFontFace: "Arial", lang: "ru-RU" };
  pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
  pptx.layout = "WIDE";
  return pptx;
}

function slide(pptx, title, label) {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  s.addText(title, { x: 0.55, y: 0.38, w: 9.2, h: 0.35, fontSize: 22, bold: true, color: C.ink, margin: 0, fit: "shrink" });
  if (label) s.addText(label, { x: 9.8, y: 0.43, w: 2.9, h: 0.2, fontSize: 8, bold: true, color: C.green, align: "right", margin: 0 });
  s.addShape(ShapeType.line, { x: 0.55, y: 0.88, w: 12.2, h: 0, line: { color: C.line, width: 1 } });
  return s;
}

function cover(pptx, title, subtitle, label) {
  const s = pptx.addSlide();
  s.background = { color: C.dark };
  s.addText(title, { x: 0.72, y: 1.4, w: 7.2, h: 1.1, fontSize: 34, bold: true, color: C.white, margin: 0, fit: "shrink" });
  s.addText(subtitle, { x: 0.76, y: 2.88, w: 6.8, h: 0.72, fontSize: 14, color: "DCE7DF", margin: 0, fit: "shrink" });
  s.addShape(ShapeType.rect, { x: 0, y: 6.78, w: 13.333, h: 0.72, fill: { color: C.green }, line: { color: C.green } });
  s.addText(label, { x: 0.76, y: 7.02, w: 5, h: 0.16, fontSize: 8.5, bold: true, color: C.white, margin: 0 });
}

function card(s, x, y, w, h, title, items, fill = C.white, color = C.ink) {
  s.addShape(ShapeType.roundRect, { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: C.line, width: 0.8 } });
  s.addText(title, { x: x + 0.22, y: y + 0.2, w: w - 0.44, h: 0.35, fontSize: 13, bold: true, color, margin: 0, fit: "shrink" });
  s.addText(items.map((i) => `• ${i}`).join("\n"), {
    x: x + 0.25,
    y: y + 0.78,
    w: w - 0.5,
    h: h - 0.95,
    fontSize: 10,
    color: C.muted,
    margin: 0,
    fit: "shrink",
    breakLine: false,
    paraSpaceAfterPt: 5,
  });
}

function bigList(s, items, x = 1, y = 1.35, w = 11.4) {
  items.forEach((item, i) => {
    s.addShape(ShapeType.roundRect, { x, y: y + i * 0.72, w, h: 0.48, rectRadius: 0.05, fill: { color: i % 2 ? C.white : C.greenSoft }, line: { color: C.line, width: 0.5 } });
    s.addText(item, { x: x + 0.25, y: y + i * 0.72 + 0.14, w: w - 0.5, h: 0.12, fontSize: 12, bold: true, color: C.ink, margin: 0, fit: "shrink" });
  });
}

function table(s, rows, x, y, w, h, colW, fs = 8.5) {
  s.addTable(rows.map((r, i) => r.map((t) => ({ text: t, options: { bold: i === 0, fill: i === 0 ? C.greenSoft : i % 2 ? C.white : "FBFBF8", color: i === 0 ? C.ink : C.muted, margin: 0.045, fit: "shrink" } }))), {
    x, y, w, h, colW, fontFace: "Arial", fontSize: fs, border: { type: "solid", color: C.line, pt: 0.5 }, valign: "mid",
  });
}

function footer(s, text) {
  s.addText(text, { x: 0.6, y: 7.08, w: 7, h: 0.16, fontSize: 7.5, color: "8A918B", margin: 0 });
}

function makeVariantA() {
  const p = deck("BARSYNERGY monetization: short");
  cover(p, "Монетизация\nBARSYNERGY", "Короткая версия: что запускать и в каком порядке", "Вариант A · короткий");
  let s = slide(p, "Главная логика", "без деталей");
  bigList(s, ["зарабатывать не на одной модели, а на наборе источников", "старт: заявки, ручная продажа, простые пакеты", "онлайн-оплаты и подписки — позже", "первый фокус: обучение, события, B2B-размещения", "автоматизировать только то, что уже продается"]);
  footer(s, "A / 01");
  s = slide(p, "Топ-5 моделей для старта", "приоритет");
  table(s, [
    ["Модель", "Кому", "Запуск", "Потенциал"],
    ["Курсы и интенсивы", "бармены / специалисты", "MVP", "высокий"],
    ["Корпоративное обучение", "заведения / сети", "MVP", "высокий"],
    ["Платные события", "индустрия", "MVP", "высокий"],
    ["Партнерские пакеты", "бренды / поставщики", "после спроса", "высокий"],
    ["Вакансии / поставщики", "B2B", "после первых пользователей", "средний / высокий"],
  ], 0.8, 1.35, 11.7, 4.2, [3.35, 3.05, 2.35, 2.95], 10);
  footer(s, "A / 02");
  s = slide(p, "Что продавать сначала", "MVP");
  card(s, 0.75, 1.35, 3.8, 4.2, "Обучение", ["курсы", "интенсивы", "мастер-классы", "корпоративные программы"], C.greenSoft, C.green);
  card(s, 4.75, 1.35, 3.8, 4.2, "События", ["лекции", "дегустации", "форумы", "networking"], C.white, C.ink);
  card(s, 8.75, 1.35, 3.8, 4.2, "B2B", ["партнеры", "вакансии", "поставщики", "спонсоры"], C.amberSoft, C.amber);
  footer(s, "A / 03");
  s = slide(p, "Что запускать позже", "не в MVP");
  bigList(s, ["онлайн-оплаты", "premium-подписка", "кабинеты работодателей", "кабинеты поставщиков", "marketplace услуг", "региональные представители"]);
  footer(s, "A / 04");
  s = slide(p, "Порядок запуска", "roadmap");
  table(s, [
    ["Этап", "Что делаем"],
    ["0", "контент, каталог, заявки"],
    ["1", "курсы, события, корпоративное обучение"],
    ["2", "платные вакансии, поставщики, партнеры"],
    ["3", "онлайн-оплата и тарифы"],
    ["4", "подписки, кабинеты, marketplace"],
  ], 1.3, 1.3, 10.7, 4.35, [1.6, 9.1], 12);
  footer(s, "A / 05");
  s = slide(p, "Итог", "решение");
  bigList(s, ["стартовая формула: обучение + события + B2B-заявки", "не строить сложную систему до первых продаж", "сначала спрос, потом автоматизация", "лучшие деньги на старте: корпоративное обучение и партнеры"]);
  footer(s, "A / 06");
  return p;
}

function makeVariantB() {
  const p = deck("BARSYNERGY monetization: business options");
  cover(p, "Монетизация\nBARSYNERGY", "Вариант B: все модели коротко, по группам", "Вариант B · карта моделей");
  let s = slide(p, "Все модели по группам", "карта");
  card(s, 0.65, 1.25, 3.05, 4.8, "Образование", ["курсы", "интенсивы", "мастер-классы", "корпоративное обучение", "сертификаты"], C.greenSoft, C.green);
  card(s, 3.9, 1.25, 3.05, 4.8, "События", ["билеты", "спонсоры", "партнеры зон", "продвижение чужих событий"], C.white, C.ink);
  card(s, 7.15, 1.25, 3.05, 4.8, "B2B", ["вакансии", "поставщики", "партнерские пакеты", "кабинеты"], C.amberSoft, C.amber);
  card(s, 10.4, 1.25, 2.25, 4.8, "Позже", ["premium", "реклама", "комиссии", "marketplace", "регионы"], C.blueSoft, C.blue);
  footer(s, "B / 01");
  s = slide(p, "Образование", "лучший старт");
  table(s, [
    ["Модель", "Клиент", "Этап", "Потенциал"],
    ["Курсы / интенсивы", "специалисты", "MVP", "высокий"],
    ["Корпоративное обучение", "заведения", "MVP", "высокий"],
    ["Сертификаты", "частные лица / HR", "после спроса", "средний"],
  ], 1, 1.5, 11.3, 3.3, [3.7, 3.2, 2.2, 2.2], 11);
  footer(s, "B / 02");
  s = slide(p, "События", "быстрая выручка");
  table(s, [
    ["Модель", "Клиент", "Этап", "Потенциал"],
    ["Платные события", "специалисты", "MVP", "высокий"],
    ["Спонсорство", "бренды / поставщики", "после спроса", "высокий"],
    ["Продвижение событий", "организаторы", "после аудитории", "средний"],
  ], 1, 1.5, 11.3, 3.3, [3.7, 3.2, 2.2, 2.2], 11);
  footer(s, "B / 03");
  s = slide(p, "B2B-размещения", "просто продавать");
  table(s, [
    ["Модель", "Клиент", "Этап", "Потенциал"],
    ["Вакансии", "заведения", "после первых пользователей", "средний"],
    ["Карточки поставщиков", "поставщики", "после первых пользователей", "высокий"],
    ["Партнерские пакеты", "бренды / сервисы", "после спроса", "высокий"],
  ], 1, 1.5, 11.3, 3.3, [3.7, 3.2, 2.2, 2.2], 11);
  footer(s, "B / 04");
  s = slide(p, "Поздние модели", "после проверки спроса");
  bigList(s, ["premium-база знаний", "кабинет работодателя", "кабинет поставщика", "комиссии с продаж", "marketplace услуг", "региональная модель"]);
  footer(s, "B / 05");
  s = slide(p, "Рекомендация", "коротко");
  bigList(s, ["1. продавать обучение и события через заявки", "2. добавить платные B2B-размещения", "3. собрать факты спроса и цены", "4. автоматизировать только рабочие модели"]);
  footer(s, "B / 06");
  return p;
}

function makeVariantC() {
  const p = deck("BARSYNERGY monetization: investor concise");
  cover(p, "Монетизация\nBARSYNERGY", "Вариант C: слайд для решения команды", "Вариант C · максимально коротко");
  let s = slide(p, "3 источника выручки", "основа");
  card(s, 0.85, 1.45, 3.7, 3.85, "1. Обучение", ["курсы", "интенсивы", "корпоративные программы"], C.greenSoft, C.green);
  card(s, 4.8, 1.45, 3.7, 3.85, "2. События", ["билеты", "спонсоры", "партнеры"], C.white, C.ink);
  card(s, 8.75, 1.45, 3.7, 3.85, "3. B2B", ["вакансии", "поставщики", "партнерские пакеты"], C.amberSoft, C.amber);
  footer(s, "C / 01");
  s = slide(p, "Первый запуск", "MVP");
  bigList(s, ["заявка на курс", "заявка на корпоративное обучение", "заявка на событие", "заявка для партнера", "заявка на вакансию / поставщика"]);
  footer(s, "C / 02");
  s = slide(p, "Не делать сразу", "анти-приоритет");
  bigList(s, ["подписку", "сложные кабинеты", "marketplace", "LMS", "комиссионную модель", "полную автоматизацию оплат"]);
  footer(s, "C / 03");
  s = slide(p, "План на 4 шага", "roadmap");
  table(s, [
    ["Шаг", "Действие"],
    ["1", "запустить заявки"],
    ["2", "продать обучение и события"],
    ["3", "подключить B2B-размещения"],
    ["4", "автоматизировать то, что продается"],
  ], 1.45, 1.55, 10.4, 3.65, [1.5, 8.9], 13);
  footer(s, "C / 04");
  s = slide(p, "Финальная рекомендация", "вывод");
  bigList(s, ["основной доход: обучение и события", "B2B-доход: партнеры, вакансии, поставщики", "позже: premium, кабинеты, marketplace", "правило: сначала продажи, потом разработка"]);
  footer(s, "C / 05");
  return p;
}

async function main() {
  const outputs = [
    ["BARSYNERGY-monetization-variant-A-short.pptx", makeVariantA()],
    ["BARSYNERGY-monetization-variant-B-model-map.pptx", makeVariantB()],
    ["BARSYNERGY-monetization-variant-C-ultra-short.pptx", makeVariantC()],
  ];
  for (const [file, pptx] of outputs) {
    const out = path.join(process.cwd(), file);
    await pptx.writeFile({ fileName: out });
    console.log(out);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
