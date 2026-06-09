"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import styles from "./reviews-section.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

const REVIEWS = [
  {
    name: "Айдана Б.",
    role: "Владелица кафе «Алатау»",
    tag: "Ресторан",
    initial: "А",
    stars: 5,
    text: "До Enter я вообще не верила в соцсети как в канал продаж. За 3 месяца Instagram реально приносит бронирования каждый день.",
  },
  {
    name: "Алексей М.",
    role: "Директор Dent-Pro",
    tag: "Медицина",
    initial: "А",
    stars: 5,
    text: "Снизили стоимость заявки с 5 200₸ до 780₸ за два месяца. Прозрачная аналитика, понятные отчёты, никакой воды.",
  },
  {
    name: "Жанна К.",
    role: "Управляющая PrimeFit",
    tag: "Фитнес",
    initial: "Ж",
    stars: 5,
    text: "Пришли с нулём в онлайне. За 45 дней 112 заявок. Группы заполнены на 3 месяца вперёд.",
  },
  {
    name: "Марат Д.",
    role: "Владелец KazMall",
    tag: "E-commerce",
    initial: "М",
    stars: 5,
    text: "ROAS вырос с 1.2 до 4.6. Ребята думают про всю воронку — от первого касания до повторной покупки.",
  },
  {
    name: "Сабина Р.",
    role: "Владелица студии Brow Lab",
    tag: "Красота",
    initial: "С",
    stars: 5,
    text: "Профиль, который реально отличается от сотен других бьюти-аккаунтов. Запись заполнена на 3 недели.",
  },
  {
    name: "Ернур А.",
    role: "Ресторатор, сеть Nomad Diner",
    tag: "Ресторан",
    initial: "Е",
    stars: 5,
    text: "Охваты, узнаваемость, трафик в зал — плюс нормальная система аналитики. Знаю, сколько стоит гость из Instagram.",
  },
  {
    name: "Динара С.",
    role: "Основатель Lumière Home",
    tag: "E-commerce",
    initial: "Д",
    stars: 5,
    text: "Запустили Reels и таргет — продажи выросли в 2.4 раза за первый квартал. Команда на связи каждый день.",
  },
  {
    name: "Тимур Н.",
    role: "CEO AutoLux KZ",
    tag: "Авто",
    initial: "Т",
    stars: 5,
    text: "Лиды из Instagram стали предсказуемыми. Видим воронку целиком и понимаем, куда уходит каждый тенге.",
  },
  {
    name: "Аружан П.",
    role: "Основатель Silk Room",
    tag: "Красота",
    initial: "А",
    stars: 5,
    text: "Контент стал выглядеть дорого — и клиенты это чувствуют. Средний чек вырос, потому что доверие появилось ещё до визита.",
  },
  {
    name: "Бекзат О.",
    role: "Директор StroyLine",
    tag: "Строительство",
    initial: "Б",
    stars: 5,
    text: "Нужны были заявки, а не лайки. Получили стабильный поток обращений из таргета уже в первый месяц работы.",
  },
  {
    name: "Карина Л.",
    role: "Школа английского SpeakUp",
    tag: "Образование",
    initial: "К",
    stars: 5,
    text: "Заполнили группы на летний сезон за 6 недель. Креативы тестируют быстро, сливов бюджета почти нет.",
  },
  {
    name: "Нурлан К.",
    role: "Основатель TechFlow",
    tag: "IT",
    initial: "Н",
    stars: 5,
    text: "Помогли упаковать продукт для B2B: сайт, презентации, LinkedIn. Первые enterprise-лиды пришли через 3 недели.",
  },
  {
    name: "Мадина Т.",
    role: "Бутик AURA",
    tag: "Fashion",
    initial: "М",
    stars: 5,
    text: "Stories и Reels наконец начали продавать, а не просто красиво выглядеть. Онлайн-заказы выросли в 3 раза.",
  },
  {
    name: "Арман Ж.",
    role: "Клиника VitaDent",
    tag: "Медицина",
    initial: "А",
    stars: 5,
    text: "Аккуратно работают с медицинской тематикой — без банов и стрёмных обещаний. Запись на консультации стабильная.",
  },
  {
    name: "Дана Е.",
    role: "Основатель NutriBox",
    tag: "E-commerce",
    initial: "Д",
    stars: 5,
    text: "Подняли CTR рекламы и снизили CPA. Наконец понятно, какие связки масштабировать, а какие отключать.",
  },
] as const;

type Review = (typeof REVIEWS)[number];

const ROW_DIRECTIONS = ["down", "up", "down", "up", "down"] as const;
const ROW_INTERACTIVE = [false, true, true, true, false] as const;
const ITEMS_PER_ROW = 8;

function getRowReviews(rowIndex: number): Review[] {
  const items: Review[] = [];

  for (let i = 0; i < ITEMS_PER_ROW; i++) {
    items.push(REVIEWS[(rowIndex * 3 + i) % REVIEWS.length]);
  }

  return items;
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className={styles.card}>
      <div className={styles.stars} aria-label={`${review.stars} звёзд`}>
        {Array.from({ length: review.stars }).map((_, j) => (
          <span key={j} className={styles.star} aria-hidden>
            ★
          </span>
        ))}
      </div>

      <p className={styles.quote}>{review.text}</p>

      <div className={styles.author}>
        <div className={styles.avatar} aria-hidden>
          {review.initial}
        </div>
        <div className={styles.authorInfo}>
          <span className={styles.authorName}>{review.name}</span>
          <span className={styles.authorRole}>{review.role}</span>
        </div>
      </div>

      <span className={styles.tag}>{review.tag}</span>
    </article>
  );
}

function ReviewTrack({
  direction,
  rowIndex,
}: {
  direction: "down" | "up";
  rowIndex: number;
}) {
  const items = getRowReviews(rowIndex);
  const loop = [...items, ...items];

  return (
    <div
      className={`${styles.track} ${
        direction === "down" ? styles.trackDown : styles.trackUp
      }`}
      style={{ animationDuration: `${36 + rowIndex * 5}s` }}
    >
      {loop.map((review, i) => (
        <ReviewCard key={`${rowIndex}-${review.name}-${i}`} review={review} />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="reviews" className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease }}
        >
          <p className={styles.label}>Отзывы клиентов</p>
          <h2 className={styles.heading}>Говорят наши клиенты</h2>
        </motion.div>
      </div>

      <div className={styles.marqueeShell}>
        <div className={styles.rows}>
          {ROW_DIRECTIONS.map((direction, rowIndex) => (
            <div
              key={`${direction}-${rowIndex}`}
              className={`${styles.row} ${
                ROW_INTERACTIVE[rowIndex]
                  ? styles.rowInteractive
                  : styles.rowEdge
              }`}
            >
              <ReviewTrack direction={direction} rowIndex={rowIndex} />
            </div>
          ))}
        </div>

        <div className={styles.fadeTop} aria-hidden />
        <div className={styles.fadeBottom} aria-hidden />
        <div className={styles.fadeLeft} aria-hidden />
        <div className={styles.fadeRight} aria-hidden />
      </div>
    </section>
  );
}
