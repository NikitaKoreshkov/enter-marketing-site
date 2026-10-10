# Enter Marketing (site) — сборка с админкой

Ветка того же агентства, пришедшая на смену [enter-marketing](https://github.com/NikitaKoreshkov/enter-marketing):
к публичной части добавились админ-панель кейсов и загрузка медиа. Дальше проект
переехал в ребрендинг [LUNO](https://github.com/NikitaKoreshkov/luno-agency), поэтому
демо-ссылки у этой сборки свои: основной витринный вариант живёт на
<https://enter-marketing.vercel.app>, ребрендинговый — на `luno-agency-psi.vercel.app`.

## Страницы

| Маршрут | Что внутри |
| --- | --- |
| `/` | Публичная часть агентства |
| `/cases` | Кейсы |
| `/admin`, `/admin/cases/new`, `/admin/cases/[id]` | Редактор кейсов |
| `/admin/login` | Вход в админку |
| `/login`, `/register`, `/forgot-password`, `/profile` | Кабинет клиента с дашбордом |

API: 19 роутов (`app/api/**`), включая `admin` и `media`.

## Стек

- Next.js (App Router), TypeScript, Tailwind CSS
- Анимация: `framer-motion` (GSAP и шейдеры остались только в предыдущей сборке)
- Авторизация: собственные JWT-сессии (`jose` + `bcryptjs`), доступ к админке отдельным
  слоем в `middleware.ts`
- Почта: `nodemailer`; данные: `pg` (пул в `lib/db/pool.ts`)
- Графики: `recharts`

## Запуск

```bash
npm install
npm run dev
```

`.env` в репозиторий не попадает; без `DATABASE_URL` и SMTP-переменных публичные
страницы работают, админка и заявки требуют базы данных.
