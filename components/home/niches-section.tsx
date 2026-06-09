"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import styles from "./niches-section.module.css";
import { ServicesPanelGlass } from "./services-panel-glass";
import { NicheIcon } from "./niche-icons";
import { NichePanelStage } from "./niche-panel-stage";

const ease = [0.22, 1, 0.36, 1] as const;

const NICHES = [
  {
    id: "restaurants",
    label: "Рестораны",
    title: "Рестораны и кафе",
    analysis:
      "Смотрим загрузку зала по дням, брони, конкурентов в радиусе и воронку из соцсетей в заказ.",
    pains: [
      "Пустой зал в будние дни",
      "Нет онлайн-заявок и брони",
      "Слабый Instagram без охватов",
      "Конкуренты перебивают ценой",
    ],
    actions: [
      "Аппетитный фото и видео-контент",
      "Таргет на жителей района",
      "Рилс с процессом приготовления",
      "Акции и спецпредложения в Stories",
    ],
    resultNum: "×6",
    resultLabel: "рост онлайн-бронирований",
    resultSub: "за 90 дней продвижения",
  },
  {
    id: "clinics",
    label: "Клиники",
    title: "Клиники и медицина",
    analysis:
      "Считаем стоимость заявки, доверие к бренду, отзывы и путь пациента от поиска до записи.",
    pains: [
      "Дорогие заявки из Яндекса",
      "Низкое доверие к новой клинике",
      "Пациенты уходят к конкурентам",
      "Нет отзывов и социального доказательства",
    ],
    actions: [
      "Видео-отзывы реальных пациентов",
      "Таргет на тех, кто ищет симптомы",
      "Ретаргетинг сайта в соцсетях",
      "Контент об экспертности врачей",
    ],
    resultNum: "−85%",
    resultLabel: "стоимость заявки (CPL)",
    resultSub: "с 5 200₸ до 780₸",
  },
  {
    id: "fitness",
    label: "Фитнес",
    title: "Фитнес и спорт",
    analysis:
      "Оцениваем заполняемость зала, отток абонементов, контент в TikTok и стоимость лида.",
    pains: [
      "Клуб не заполнен после открытия",
      "Отток клиентов в конце месяца",
      "TikTok не приносит реальных клиентов",
      "Дорогое привлечение через офлайн",
    ],
    actions: [
      "TikTok + Instagram стратегия с нуля",
      "Before/after трансформации клиентов",
      "Акция «Первая тренировка бесплатно»",
      "Ретаргетинг на посетителей сайта",
    ],
    resultNum: "112",
    resultLabel: "заявок за первые 45 дней",
    resultSub: "с нулевого онлайн-присутствия",
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    title: "Интернет-магазины",
    analysis:
      "Разбираем корзины, ROAS, ретаргет и unit-экономику каждого рекламного канала.",
    pains: [
      "Высокая стоимость продажи",
      "Корзины бросают без покупки",
      "Сложно масштабировать рекламу",
      "ROAS ниже точки безубыточности",
    ],
    actions: [
      "Полная воронка: охват → заявка → продажа",
      "Динамический ретаргетинг каталога",
      "Видео-обзоры продуктов для таргета",
      "А/Б тест аудиторий и креативов",
    ],
    resultNum: "3.8×",
    resultLabel: "рост ROAS",
    resultSub: "с 1.2 до 4.6 за 60 дней",
  },
  {
    id: "beauty",
    label: "Красота",
    title: "Салоны красоты",
    analysis:
      "Проверяем загрузку мастеров, повторные визиты, визуал профиля и поток записи онлайн.",
    pains: [
      "Запись заполнена только у «старых» мастеров",
      "Клиентки не возвращаются",
      "Instagram выглядит «как у всех»",
      "Нет потока новых клиентов онлайн",
    ],
    actions: [
      "Уникальный визуальный стиль профиля",
      "Таргет на женщин в нужном радиусе",
      "Контент «до/после» с разрешения клиенток",
      "Сторис с акциями и записью в один клик",
    ],
    resultNum: "×4",
    resultLabel: "записей через Instagram",
    resultSub: "за первый месяц",
  },
] as const;

export function NichesSection() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-12%" });
  const panelInView = useInView(panelRef, { once: true, margin: "-12%" });

  const niche = NICHES[active];

  return (
    <section id="niches" className={styles.section} ref={sectionRef}>
      <div className={styles.inner}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease }}
        >
          <p className={styles.label}>Наши ниши</p>
          <h2 className={styles.heading}>Знаем боль каждого бизнеса</h2>
        </motion.div>

        {/* Mobile tabs */}
        <div className={styles.mobileTabs} role="tablist">
          {NICHES.map((n, i) => (
            <button
              key={n.id}
              role="tab"
              aria-selected={active === i}
              className={`${styles.mobileTab}${active === i ? ` ${styles.mobileTabActive}` : ""}`}
              onClick={() => setActive(i)}
            >
              <NicheIcon id={n.id} size={16} className={styles.mobileTabIcon} />
              {n.label}
            </button>
          ))}
        </div>

        <motion.div
          ref={panelRef}
          className={styles.panelWrap}
          initial={{ opacity: 0, y: 32 }}
          animate={panelInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, ease, delay: 0.1 }}
        >
          <ServicesPanelGlass id="niches-panel">
            <div className={styles.layout}>
          {/* Desktop tabs */}
          <div className={styles.tabs} role="tablist">
            {NICHES.map((n, i) => (
              <button
                key={n.id}
                role="tab"
                aria-selected={active === i}
                aria-label={n.label}
                className={`${styles.tab}${active === i ? ` ${styles.tabActive}` : ""}`}
                onClick={() => setActive(i)}
              >
                <span className={styles.tabInner}>
                  <span className={styles.tabIconWrap}>
                    <NicheIcon id={n.id} size={28} className={styles.tabIcon} />
                  </span>
                  <span className={styles.tabLabel}>{n.label}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div className={styles.panel} role="tabpanel">
            <NichePanelStage niche={niche} inView={panelInView} />
          </div>
            </div>
          </ServicesPanelGlass>
        </motion.div>
      </div>
    </section>
  );
}
