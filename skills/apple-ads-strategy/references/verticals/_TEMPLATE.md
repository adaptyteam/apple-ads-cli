---
title: <Category> — launch and scale Apple Search Ads
intent: user wants to launch or fix Apple Search Ads for a <category> app
kind: vertical
risk: read-only            # planning only; execution steps link to procedural playbooks
requires:
  cli: ">=0.4.0"           # only for the execution section
  subscription: false      # planning works with no Adapty account
uses: []                   # a vertical guide calls no commands itself — it links to playbooks
benchmarks: <app-store-category>   # key into subscription-benchmarks, if that skill is installed
updated: YYYY-MM-DD
---

<!--
HOW TO USE THIS TEMPLATE

Every section below is mandatory. A section you cannot fill is a section you mark
`> TODO(owner): <what is missing>` — never one you delete. Missing sections are
what make a guide library feel unreliable.

Every number is either (a) sourced and linked, (b) marked as a range to calibrate,
or (c) marked TODO. Never write a confident number you cannot source: a made-up
CPT benchmark is worse than no benchmark, because the agent will act on it.

Slots to fill are marked `«...»`.
-->

# «Category» — Apple Search Ads playbook

**One-line thesis.** «Что делает эту вертикаль непохожей на остальные — в одном предложении. Если не получается — вертикаль выделена неправильно.»

---

## 0. When this playbook does not apply

«Границы. Например: не подходит приложениям без подписки; не подходит при бюджете ниже X; не подходит, если приложение ещё не прошло ревью.»

Читатель должен узнать себя или уйти в первые тридцать секунд.

---

## 1. Demand profile

| Свойство | Значение | Следствие для рекламы |
|---|---|---|
| Тип намерения | «импульсный / решение задачи / исследование» | «влияет на длину триала и на то, работает ли Today-tab» |
| Сезонность | «пики и провалы, с привязкой к событиям» | «когда поднимать бюджет, когда резать» |
| Глубина поиска | «пользователь ищет 1 слово или фразу» | «важность broad vs exact» |
| Доля переустановок | «низкая / высокая» | «redownloads искажают CPI, считать по new downloads» |
| Гео-концентрация | «Tier-1 / глобально» | «где стартовать» |

---

## 2. Unit economics: what must add up

Формула, по которой вертикаль вообще может быть прибыльной:

```
«CPI_допустимый = ARPU_на_день_N × конверсия_install→paid × запас_на_риск»
```

| Вход | Откуда берётся | Значение |
|---|---|---|
| ARPU на день 30/90/180 | когорты Adapty | «диапазон или TODO» |
| install → trial | своя аналитика | «...» |
| trial → paid | бенчмарки категории | «ссылка на subscription-benchmarks или TODO» |
| допустимый CPT | считается из строк выше | «...» |

> **Калибровка.** Все значения выше — стартовая гипотеза. После 7 дней открута пересчитай их
> на своих данных: `references/playbooks/cohort-roas.md`.

---

## 3. Keyword taxonomy

Шесть корзин, у каждой — своя роль, свой потолок ставки и свой критерий успеха.

| Корзина | Роль | Примеры seed | Ожидание |
|---|---|---|---|
| Brand (свой) | защита | «...» | высокий CR, низкий CPT |
| Competitor | перехват | «...» | средний CR, высокий CPT |
| Generic / category | объём | «...» | низкий CR, дорого |
| Feature / job-to-be-done | намерение | «...» | лучший ROAS |
| Long tail / misspelling | дешёвый объём | «...» | мало трафика, дёшево |
| Brand третьих лиц (не конкуренты) | «зависит от вертикали» | «...» | ⚠️ см. блок рисков |

---

## 4. Account structure

Какие из четырёх типов кампаний Apple использовать и почему именно так для этой вертикали:

| Кампания | Тип | Ad groups | Ключи | Стартовый бюджет |
|---|---|---|---|---|
| «Brand» | Search Results | «...» | brand exact | «доля от общего» |
| «Competitor» | Search Results | «...» | competitor exact | «...» |
| «Discovery» | Search Results | broad + search match | — | «...» |
| «Exact / scaling» | Search Results | по темам | harvested exact | «...» |
| «Today tab» *(если применимо)* | Today Tab | — | — | «...» |

Разбиение на ad groups для этой вертикали: «по чему делим — по устройству, по бренду, по задаче».

---

## 5. Starting bids and budget

> Это диапазоны для старта, а не бенчмарки. Реальные значения зависят от гео,
> сезона и конкуренции в конкретную неделю.

| Корзина | Стартовая ставка | Потолок | Правило пересмотра |
|---|---|---|---|
| «...» | «диапазон или TODO» | «...» | «через сколько дней и по какому признаку» |

Минимальный бюджет, ниже которого обучение не наберёт статистику: «...»

---

## 6. Creative and Custom Product Pages

- Какие CPP имеют смысл для этой вертикали и под какие корзины ключей: «...»
- Что должно быть на первых двух скриншотах: «...»
- ⚠️ CPP создаются в App Store Connect; через API их можно только выбрать по `productPageId`.

---

## 7. Starter negative keywords

Список, который экономит деньги с первого дня. Каждый негатив — с причиной.

| Негатив | Почему |
|---|---|
| «free» | «если монетизация — платная подписка без бесплатного тира» |
| «...» | «...» |

---

## 8. Launch sequence

Пошагово, со ссылками на процедурные плейбуки. Сами команды живут там, а не здесь —
это единственный способ не дублировать синтаксис CLI по двадцати гайдам.

1. Проверить подключение и доступ → `playbooks/preflight.md`
2. Создать структуру кампаний → `playbooks/campaign-launch.md`
3. Залить стартовые ключи и негативы → `playbooks/keyword-load.md`
4. Настроить правила → `playbooks/automation-rules.md`
5. Первый разбор через 7 дней → `playbooks/weekly-review.md`

---

## 9. Success criteria

| Горизонт | Что смотрим | Порог «идём дальше» | Порог «режем» |
|---|---|---|---|
| День 7 | «...» | «...» | «...» |
| День 30 | когортный ROAS | «...» | «...» |
| День 90 | «...» | «...» | «...» |

---

## 10. Failure modes of this vertical

Типовые способы слить бюджет именно здесь. Каждый — с признаком и с действием.

| Провал | Как выглядит в цифрах | Что делать |
|---|---|---|
| «...» | «...» | «...» |

---

## 11. Legal and policy risks

«Только если вертикаль их несёт. Если нет — написать "нет специфических рисков",
а не удалять раздел.»

---

## 12. What to measure in Adapty

Что именно из когортных метрик отвечает на вопрос «работает ли реклама» в этой вертикали
и почему обычных метрик Apple здесь недостаточно: «...»

---

<!-- Checklist перед мержем:
[ ] frontmatter заполнен, `uses` пуст или все команды существуют в cli-reference.md
[ ] нет ни одного числа без источника, диапазона или TODO
[ ] есть раздел 0 (когда не подходит)
[ ] шаги запуска ссылаются на плейбуки, а не дублируют команды
[ ] указана дата updated
-->
