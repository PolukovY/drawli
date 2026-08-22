# Архітектура Drawli

Застосунок повністю клієнтський: жодного сервера, бази даних чи API.
GitHub Pages віддає статичні файли, усе інше відбувається в браузері планшета.

```mermaid
graph TB
    subgraph device["Планшет дитини"]
        subgraph app["Drawli — React 19 + TypeScript"]
            pages["Сторінки<br/>бібліотека · малювання · гра · галерея"]
            store["Zustand<br/>налаштування, інструмент, колір"]
            i18n["i18next<br/>uk · en"]
            engine["DrawingEngine<br/>Canvas 2D + Pointer Events"]
            loader["ExerciseLoader<br/>SVG + JSON"]
            repos["Репозиторії<br/>Dexie"]
        end
        idb[("IndexedDB<br/>drawings · progress · settings")]
        sw["Service Worker<br/>Workbox"]
    end

    cdn["GitHub Pages<br/>статика: JS, CSS, SVG, JSON"]

    pages --> store
    pages --> i18n
    pages --> engine
    pages --> loader
    pages --> repos
    repos --> idb
    loader -. "fetch" .-> sw
    sw -. "кеш або мережа" .-> cdn

    classDef core fill:#EFEBFF,stroke:#7C5CFF,stroke-width:2px
    classDef data fill:#E6F8EE,stroke:#34C77B,stroke-width:2px
    classDef net fill:#FFF6DC,stroke:#FFC53D,stroke-width:2px
    class pages,store,i18n,engine,loader,repos core
    class idb,repos data
    class sw,cdn net
```

---

## 1. Межа між React і малюванням

Найважливіше архітектурне рішення: **координати вказівника ніколи не потрапляють
у React**. Якби кожен `pointermove` викликав `setState`, планшет губив би кадри
посеред штриха.

```mermaid
sequenceDiagram
    autonumber
    participant Ч as Дитина
    participant C as canvas
    participant E as DrawingEngine
    participant R as React
    participant DB as IndexedDB

    Ч->>C: pointerdown
    C->>E: почати штрих
    loop кожен рух пальця
        Ч->>C: pointermove
        C->>E: точки (з getCoalescedEvents)
        E->>E: фільтр тремтіння, згладжування
        E->>C: requestAnimationFrame → перемалювати
    end
    Note over E,R: React про ці кадри не знає
    Ч->>C: pointerup
    E->>E: закомітити дію в історію
    E-->>R: onActionCommitted(actions)
    E-->>R: onHistoryChange(canUndo, canRedo)
    R->>R: розблокувати «Далі», оновити кнопки
    R->>DB: автозбереження через 400 мс
```

React дізнається лише про **завершені дії** — після `pointerup`. Між натиском і
відпусканням усе живе всередині рушія.

### Що робить рушій

| Тема | Рішення |
|---|---|
| Retina | внутрішній розмір полотна = CSS-розмір × `devicePixelRatio` |
| Ресайз | `ResizeObserver` на полотні, перемальовка з історії |
| Згладжування | квадратичні криві через середини сусідніх точок |
| Швидкі рухи | `getCoalescedEvents()` — жодна проміжна точка не губиться |
| Тремтіння | точки ближче 2 px відкидаються |
| Стилус | `pointerType === 'pen'`, ширина пензлика від `event.pressure` |
| Палмреджект | після дотику пером `touch`-події ігноруються 800 мс |
| Ластик | `globalCompositeOperation = 'destination-out'` — стирає лише шар дитини |
| Продуктивність | «закомічені» дії лежать на офскрин-полотні; живий штрих коштує одну `drawImage` |

### Історія

Один жест = одна дія. Глибина 50.

```mermaid
stateDiagram-v2
    direction LR
    [*] --> Порожньо
    Порожньо --> Намальовано: штрих / заливка
    Намальовано --> Намальовано: новий штрих<br/>(стек повтору очищається)
    Намальовано --> Скасовано: undo
    Скасовано --> Намальовано: redo
    Скасовано --> Порожньо: «Стерти все»<br/>= undo у циклі
    Порожньо --> Намальовано: redo повертає стерте
```

«Стерти все» перекладає всі дії в стек повтору, тому випадкове стирання
повертається кнопкою «вперед», а не втрачається назавжди.

## 2. Шари екрана малювання

```mermaid
graph TB
    subgraph card[".canvas-card"]
        guide["GuideLayer — SVG<br/>сірий пунктир поточного кроку<br/>+ фіолетова іскринка<br/>pointer-events: none"]
        color["ColoringLayer — SVG<br/>області з data-region<br/>клікабельні на кроці заливки"]
        canvas["canvas<br/>малюнок дитини<br/>прозорий, найвищий шар"]
    end

    guide --- color --- canvas

    note1["На кроці розфарбовування canvas<br/>отримує pointer-events: none,<br/>і тап досягає областей SVG"]
    canvas -.-> note1

    classDef l fill:#FFFFFF,stroke:#7C5CFF,stroke-width:2px
    classDef n fill:#FFF6DC,stroke:#FFC53D,stroke-dasharray:4 4
    class guide,color,canvas l
    class note1 n
```

Ластик не може стерти гайд просто тому, що гайд живе в іншому шарі.

**Іскринка** — це копія SVG поточного кроку з фіолетовим штрихом. Довжина
кожної фігури вимірюється через `getTotalLength()`, і з неї рахується
`stroke-dasharray`; анімується `stroke-dashoffset`. (Коротший трюк
`pathLength="1"` мовчки не спрацьовує, якщо атрибут з'являється після того, як
браузер уже порахував пунктир, — і комета перетворюється на суцільну лінію.)

## 3. Контент: вправи як дані

Малюнки, літери й числа **не написані в коді**. Джерело — компактна геометрія
в `scripts/exercises/`, з якої генератор робить статичні файли.

```mermaid
graph LR
    subgraph src["scripts/exercises/"]
        cat["motor · shapes · nature<br/>animals · food · home · transport"]
        gly["glyphs.mjs<br/>абетки, цифри, числа"]
        es["es-words.mjs<br/>іспанські назви"]
    end

    gen["generate-exercises.mjs<br/>валідація + генерація"]

    subgraph out["public/exercises/"]
        idx["index.json<br/>каталог"]
        words["words.json<br/>слова uk · en · es"]
        ex["id/exercise.json<br/>кроки вправи"]
        steps["id/step-NN.svg<br/>контур кроку"]
        final["id/final.svg<br/>розмальовка"]
        thumb["id/thumbnail.svg<br/>мініатюра"]
    end

    i18nout["src/i18n/uk.json + en.json<br/>блок exercise"]

    cat --> gen
    gly --> gen
    es --> gen
    gen --> idx
    gen --> words
    gen --> ex
    gen --> steps
    gen --> final
    gen --> thumb
    gen --> i18nout

    classDef s fill:#EFEBFF,stroke:#7C5CFF
    classDef g fill:#FFF6DC,stroke:#FFC53D,stroke-width:2px
    classDef o fill:#E6F8EE,stroke:#34C77B
    class cat,gly,es s
    class gen g
    class idx,words,ex,steps,final,thumb,i18nout o
```

Генератор **валідує**: унікальні id, відома категорія, наявні назви обома
мовами. Назви вправ живуть поруч із геометрією, тому вправа фізично не може
потрапити в застосунок без перекладу.

### Дві SVG-ролі

- **step-NN.svg** — тільки контур: `fill="none"`, `stroke="currentColor"`.
  Колір і пунктир задає CSS, тому один файл працює і як активний гайд, і як
  блідий слід, і як іскринка.
- **final.svg** — заливні області (`data-region`) плюс повний контур поверх них.
  Без верхнього контуру розфарбована фігура втрачає обличчя і читається як пляма.

### Категорії та режими

Кожна категорія має `kind`: `draw` (малюнки) або `write` (літери, цифри, числа).
З цього будуються режими бібліотеки — код не знає імен категорій.

```mermaid
graph LR
    idx["index.json<br/>categories[].kind"] --> draw["Режим «Малюю»<br/>148 малюнків"]
    idx --> write["Режим «Літери й цифри»<br/>96 літер · 10 цифр · 91 число"]
    idx --> play["Режим «Ігри»<br/>вибір мови замість жанрів"]
    words["words.json"] --> play
```

## 4. Дані на пристрої

Dexie над IndexedDB, база `drawli`:

```mermaid
erDiagram
    SETTINGS {
        string id "завжди app"
        string childName "лише для звертання"
        string language "uk або en"
        boolean soundEnabled
        number stars
        boolean tutorialHomeDone
        boolean tutorialDrawDone
    }
    DRAWINGS {
        string id PK "uuid"
        string exerciseId "або free"
        string status "IN_PROGRESS або COMPLETED"
        number currentStep
        array stepBaselines "мітки кроків"
        object document "дії малюнка"
        blob thumbnail "WebP 300x225"
        string createdAt
        string updatedAt
    }
    PROGRESS {
        string exerciseId PK
        string status "NOT_STARTED IN_PROGRESS COMPLETED"
        number currentStep
        number timesCompleted
        string completedAt
    }
    ACHIEVEMENTS {
        string id PK
        string type "зарезервовано"
        string earnedAt
    }
    DRAWINGS ||--o| PROGRESS : "одна вправа"
```

### Документ малюнка

```ts
interface DrawingDocument {
  version: 1
  exerciseId: string
  canvasWidth: number
  canvasHeight: number
  actions: DrawingAction[]   // STROKE | FILL
}
```

Координати й ширина штриха **нормалізовані до 0..1**. Малюнок, зроблений на
iPad, коректно перемальовується на Android-планшеті з іншою роздільністю.

### Мітки кроків

`SavedDrawing.stepBaselines[i]` — скільки дій існувало, коли відкрився крок `i`.
Без цього повернення до незавершеного малюнка вимагало б зайвого штриха на
роботі, яку дитина вже зробила, і кнопка «Готово» виглядала б мертвою.

### Автозбереження

```mermaid
flowchart TD
    A["pointerup — дія закомічена"] --> B{"чекати 400 мс"}
    B -->|"новий штрих раніше"| B
    B -->|"тиша"| S["upsertDrawing"]
    C["зміна кроку"] --> S
    D["visibilitychange → hidden"] --> E["скинути таймер"] --> S
    S --> F{"дій нема<br/>і крок перший?"}
    F -->|"так"| G["не зберігати<br/>порожня вправа не малюнок"]
    F -->|"ні"| H[("IndexedDB")]

    classDef save fill:#E6F8EE,stroke:#34C77B
    classDef skip fill:#FDECEA,stroke:#E4443B
    class S,H save
    class G skip
```

## 5. Стан застосунку

`zustand` тримає лише те, що спільне для екранів: налаштування, обраний
інструмент, обраний колір, стан завантаження. Усе інше — локальний стан
сторінок.

```mermaid
flowchart TD
    start(["Запуск застосунку"]) --> init["init(): loadSettings()"]
    init --> q{"є запис settings?"}
    q -->|"так"| ready["i18n(мова з налаштувань)<br/>boot = ready"]
    q -->|"ні"| onb["i18n(мова браузера)<br/>boot = onboarding"]
    onb --> name["Екран знайомства:<br/>ім'я + мова"]
    name --> create["createSettings()"] --> ready
    ready --> lib["Бібліотека"]
    lib --> resume{"є незавершений<br/>малюнок?"}
    resume -->|"так"| card["Картка «Продовжити малювати?»"]
    resume -->|"ні"| grid["Сітка вправ"]

    classDef ok fill:#EFEBFF,stroke:#7C5CFF
    class ready,lib,card,grid ok
```

## 6. Маршрути

Використовується `HashRouter`, бо GitHub Pages не має SPA-fallback: посилання
`/drawli/draw/ladybug` віддало б 404 при перезавантаженні.

```mermaid
graph LR
    home["/<br/>бібліотека"] --> draw["/draw/:exerciseId<br/>вправа по кроках"]
    home --> free["/free<br/>чистий аркуш"]
    home --> spell["/spell?lang=uk · en · es<br/>склади слово"]
    home --> guess["/guess?lang=uk · en · es<br/>знайди малюнок"]
    home --> gallery["/drawings<br/>мої малюнки"]
    home --> progress["/progress<br/>прогрес і зірочки"]
    home --> settings["/settings<br/>налаштування, бекап"]
    draw --> done["Екран завершення<br/>+10 зірочок"]
    done --> home
    gallery --> draw
    gallery --> free

    classDef h fill:#7C5CFF,color:#fff,stroke:#5C3CE0,stroke-width:2px
    class home h
```

## 7. Офлайн

`vite-plugin-pwa` (Workbox), `registerType: 'autoUpdate'`, scope прив'язаний до
базового шляху.

```mermaid
flowchart LR
    req["Запит із застосунку"] --> sw{"Service Worker"}

    sw -->|"index.html, JS, CSS, іконки"| pre["Precache<br/>12 записів<br/>віддається миттєво"]
    sw -->|"exercises/index.json"| nf["NetworkFirst<br/>таймаут 4 с<br/>кеш як запасний"]
    sw -->|"exercises/**.svg .json"| swr["StaleWhileRevalidate<br/>з кешу одразу<br/>оновлення у фоні"]
    sw -->|"fonts.googleapis / gstatic"| cf["CacheFirst<br/>рік"]

    nf -.->|"немає мережі"| cache[("Кеш браузера")]
    swr --> cache
    pre --> cache
    cf --> cache

    classDef p fill:#EFEBFF,stroke:#7C5CFF
    classDef n fill:#FFF6DC,stroke:#FFC53D
    class pre,swr,cf p
    class nf n
```

Сотні SVG **не** потрапляють у precache: інакше перше відкриття тягнуло б
мегабайти. Вправа кешується тоді, коли дитина її відкрила. Каталог береться з
мережі, коли вона є, — інакше нові вправи ніколи не дійшли б до планшета, який
уже відкривав застосунок.

## 8. Збірка та деплой

```mermaid
graph LR
    dev["git push у main"] --> ci
    subgraph gha["GitHub Actions"]
        ci["npm ci"] --> build["npm run build<br/>VITE_BASE=/repo/"] --> art["upload-pages-artifact<br/>dist/"]
    end
    art --> pages["deploy-pages"] --> live["polukovy.github.io/drawli/"]

    classDef done fill:#E6F8EE,stroke:#34C77B,stroke-width:2px
    class live done
```

`base` у Vite обов'язковий: без нього всі шляхи вказували б у корінь домену.
Шляхи до вправ будуються через `import.meta.env.BASE_URL`, а не від `/`.

## 9. Структура коду

```
src/
  app/        App.tsx (гейт старту), router.tsx, store.ts
  pages/      HomePage, DrawingPage, FreeDrawPage, SpellGamePage,
              GuessGamePage, MyDrawingsPage, ProgressPage, SettingsPage,
              OnboardingPage
  components/ DrawingCanvas, DrawingToolbar, ColorPalette, GuideLayer,
              ColoringLayer, StepPreview, CoachMarks, CompletionScreen, Icon
  drawing/    DrawingEngine.ts, DrawingDocument.ts, thumbnail.ts,
              history/HistoryManager.ts
  exercise/   Exercise.ts (типи), ExerciseLoader.ts (fetch + кеш у пам'яті)
  storage/    DrawliDatabase.ts, DrawingRepository, ProgressRepository,
              SettingsRepository, types.ts
  backup/     BackupService.ts
  i18n/       uk.json, en.json, index.ts
  styles/     tokens.css, global.css, ui.css
scripts/      generate-exercises.mjs, exercise-data.mjs, exercises/*.mjs
```

Залежності між шарами односторонні:

```mermaid
graph TD
    pages["pages/"] --> components["components/"]
    pages --> app["app/ — store, router"]
    pages --> storage["storage/"]
    pages --> exercise["exercise/"]
    pages --> backup["backup/"]
    components --> drawing["drawing/"]
    components --> exercise
    drawing --> storage_types["storage/types.ts — лише типи"]
    storage --> dexie[("Dexie / IndexedDB")]
    exercise --> assets["public/exercises/"]

    classDef leaf fill:#E6F8EE,stroke:#34C77B
    class dexie,assets leaf
```

Рушій малювання не знає ні про React, ні про Dexie — лише про типи дій.

## 10. Рішення, які варто знати

- **Заливка областей замість flood-fill.** Дитина торкається вуха — фарбується
  вухо. Передбачувано і не залежить від того, наскільки акуратно вона обвела.
- **Мініатюра = кольори + штрихи.** Знімок самого полотна втрачає розфарбування,
  тому мініатюра складається з SVG-заливок і полотна поверх них.
- **Ніяких «неправильно».** Крок відкривається після першої дії, гра повертає
  зайві літери й підказує першу — прогрес ніколи не блокується точністю.
- **Порожня вправа не зберігається.** Інакше відкрита й покинута вправа
  засмічувала б галерею й перехоплювала картку «Продовжити».
