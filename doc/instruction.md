# Інструкція розробника

Як запустити, змінити й задеплоїти Drawli. Архітектура — в [arch.md](arch.md).

---

## 1. Вимоги

- **Node 22+** (CI використовує 22)
- npm 10+
- Для перевірки малювання — планшет або браузер із симуляцією дотиків

## 2. Запуск

```bash
git clone git@github.com:PolukovY/drawli.git
cd drawli
npm install
npm run dev
```

Vite віддає застосунок за адресою **http://127.0.0.1:5173/drawli/** —
з підшляхом `/drawli/`, бо саме так він живе на GitHub Pages. Без слеша в кінці
буде 404.

### Скрипти

| Команда | Що робить |
|---|---|
| `npm run dev` | dev-сервер із HMR |
| `npm run build` | типізація (`tsc -b`) + збірка в `dist/` + service worker |
| `npm run preview` | подивитись зібрану версію локально |
| `npm run lint` | oxlint |
| `npm run exercises` | перегенерувати вправи з `scripts/exercises/` |

## 3. Як додати новий малюнок

Малюнки — це дані, а не код. Рушій малювання чіпати не треба.

**Крок 1.** Відкрити файл жанру в `scripts/exercises/` (`animals.mjs`,
`food.mjs`, `nature.mjs`, `home.mjs`, `transport.mjs`, `shapes.mjs`,
`motor.mjs`) і додати запис:

```js
{
  id: 'octopus',                                   // назавжди, це ключ прогресу
  title: { uk: 'Восьминіг', en: 'Octopus' },
  difficulty: 'EASY',                              // VERY_EASY | EASY | MEDIUM | ADVANCED
  steps: [
    { id: 'head', shapes: ['<ellipse cx="200" cy="150" rx="90" ry="80"/>'] },
    { id: 'eyes', shapes: ['<circle cx="170" cy="140" r="12"/>', '<circle cx="230" cy="140" r="12"/>'] },
    { id: 'legs', shapes: ['<path d="M130 210 q-20 60 10 100"/>', '<path d="M270 210 q20 60 -10 100"/>'] },
  ],
  regions: [                                       // необов'язково: крок розфарбовування
    { id: 'body', shape: '<ellipse cx="200" cy="150" rx="90" ry="80"/>', color: '#9B5CE0' },
  ],
}
```

**Правила геометрії:**

- полотно `viewBox="0 0 400 400"`, малюнок має вміщатись у нього;
- фігури — це рядки SVG без `fill` і `stroke`: колір і пунктир задає CSS;
- один крок — один осмислений елемент («голова», «крила»), а не одна лінія;
- `regions` малюються знизу вгору, потім поверх них лягає повний контур.

**Крок 2.** Перегенерувати й перевірити:

```bash
npm run exercises
```

Генератор впаде, якщо `id` уже зайнятий, категорія невідома або бракує назви
однією з мов. Він же пропише назви в `src/i18n/uk.json` та `en.json` — **ці
блоки редагувати вручну не треба**, вони перезаписуються.

**Крок 3.** Для гри «Склади слово» додати іспанську назву в
`scripts/exercises/es-words.mjs`:

```js
octopus: 'PULPO',
```

Генератор попередить у консолі, якщо в жанру-предмета немає іспанського слова.

**Крок 4.** Відкрити вправу в браузері й пройти до кінця.

## 4. Як додати літеру або число

`scripts/exercises/glyphs.mjs`:

- `LATIN` — великі латинські літери (їх перевикористовує іспанська й частина
  кирилиці);
- `CYRILLIC` — українські літери;
- `DIGITS` — цифри 0–9;
- `NUMBERS` — числа 10–100 збираються автоматично з `DIGITS`.

Кожен запис — масив кроків, кожен крок — масив фігур **у порядку письма**.
Координатна сітка глифа: `x` 120–280, `y` 80–330, центр 200/205.

## 5. Як додати мову інтерфейсу

1. `src/i18n/<lang>.json` — скопіювати з `en.json` і перекласти (блок
   `exercise` не чіпати, він генерується).
2. Зареєструвати ресурс у `src/i18n/index.ts`.
3. Додати кнопку мови в `OnboardingPage` і `SettingsPage`.
4. Розширити тип `Language` у `src/storage/types.ts`.

Для гри «Склади слово» потрібні ще й слова: додати мову в `wordList`
генератора та алфавіт у `ALPHABETS` у `SpellGamePage.tsx`.

## 6. Перевірка перед комітом

```bash
npm run build     # типізація + збірка
npm run lint
```

Ручний чек-лист для змін, що торкаються малювання:

- штрих малюється пальцем і мишею, без розривів;
- «Далі» вмикається після першого штриха кроку;
- вправу видно після перезавантаження сторінки (відновлення);
- ластик не стирає гайд;
- на кроці розфарбовування тап потрапляє в область.

## 7. Деплой

Автоматичний: пуш у `main` → GitHub Actions → GitHub Pages.

```
.github/workflows/deploy.yml
  npm ci → npm run build (VITE_BASE=/<repo>/) → upload-pages-artifact → deploy-pages
```

Перевірити стан:

```bash
gh run list --limit 1
curl -s -o /dev/null -w "%{http_code}\n" https://polukovy.github.io/drawli/
```

### Якщо зміни не видно на живому сайті

Це майже завжди service worker. У консолі вкладки:

```js
const regs = await navigator.serviceWorker.getRegistrations()
await Promise.all(regs.map(r => r.unregister()))
const keys = await caches.keys()
await Promise.all(keys.filter(k => k.includes('precache')).map(k => caches.delete(k)))
location.reload()
```

Каталог вправ (`index.json`) береться з мережі й оновлюється сам; оболонка
оновлюється при наступному запуску застосунку.

### Свій домен

`base` береться з `VITE_BASE`. Для кореня домену:

```bash
VITE_BASE=/ npm run build
```

І покласти `CNAME` у `public/`.

## 8. Дані під час розробки

Подивитись, що збережено:

```js
const req = indexedDB.open('drawli')
const db = await new Promise(r => { req.onsuccess = () => r(req.result) })
const rows = await new Promise(r => {
  const q = db.transaction('drawings').objectStore('drawings').getAll()
  q.onsuccess = () => r(q.result)
})
console.table(rows.map(d => ({ id: d.id, ex: d.exerciseId, status: d.status, actions: d.document.actions.length })))
```

Почати з чистого аркуша (застосунок покаже знайомство):

```js
indexedDB.deleteDatabase('drawli'); location.reload()
```

## 9. Структура репозиторію

```
public/exercises/     згенерований контент — не редагувати руками
scripts/exercises/    джерело контенту
src/                  застосунок
doc/                  ця документація і скріншоти
.github/workflows/    деплой
SPEC.md               початкова специфікація і фази
```

## 10. Домовленості

- Коміти англійською, у стилі `feat(scope): …`, `fix(scope): …`, з поясненням
  **чому**, а не лише що.
- Дитячі тексти — тільки через i18next, ніякого тексту в компонентах.
- Тач-цілі не менші за 56 px (`--tap-min`), головні — 64–72 px.
- Нова анімація має вимикатись під `prefers-reduced-motion: reduce`.
