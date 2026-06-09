"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ServicesPanelGlass } from "./services-panel-glass";
import styles from "./results-section.module.css";

const ease = [0.22, 1, 0.36, 1] as const;
const AUTO_INTERVAL_MS = 5500;

function useVisibleCount() {
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= 720) setVisible(1);
      else if (window.innerWidth <= 1100) setVisible(2);
      else setVisible(3);
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return visible;
}

function useCountUp(target: number, duration = 1600, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;

    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [active, target, duration]);

  return count;
}

const CASES = [
  {
    client: "Кафе «Алатау»",
    niche: "Ресторан · Алматы",
    what: "SMM + таргет в Instagram, UGC-контент, продуктовые фото и видео под локальную аудиторию",
    duration: "3 месяца",
    beforeDisplay: "11",
    beforeLabel: "заявок в месяц",
    afterNum: 68,
    afterSuffix: "",
    afterLabel: "заявок в месяц",
    quote: "До Enter Marketing я вообще не верила в Instagram. Теперь у нас бронь расписана на неделю вперёд.",
    author: "Айдана Б., владелица",
  },
  {
    client: "Dent‑Pro Клиника",
    niche: "Стоматология · Алматы",
    what: "Facebook + Instagram Ads, ретаргетинг, видео-отзывы реальных пациентов и A/B тест аудиторий",
    duration: "2 месяца",
    beforeDisplay: "5 200₸",
    beforeLabel: "стоимость заявки",
    afterNum: 780,
    afterSuffix: "₸",
    afterLabel: "стоимость заявки",
    quote: "Рекламный бюджет тот же, но пациентов в 4 раза больше. Команда объяснила всё по цифрам.",
    author: "Алексей М., директор",
  },
  {
    client: "PrimeFit",
    niche: "Фитнес-клуб · Алматы",
    what: "TikTok + Instagram стратегия с нуля: before/after контент, акции на первую тренировку, таргет по геолокации",
    duration: "1.5 месяца",
    beforeDisplay: "0",
    beforeLabel: "онлайн-заявок",
    afterNum: 112,
    afterSuffix: "",
    afterLabel: "заявок за 45 дней",
    quote: "За полтора месяца заполнили группы на 3 месяца вперёд. Клубную карту теперь берут сразу.",
    author: "Жанна К., управляющая",
  },
  {
    client: "KazMall",
    niche: "E-commerce · Алматы",
    what: "Performance-таргет, динамический ретаргетинг, креативы под всю воронку от первого касания до покупки",
    duration: "4 месяца",
    beforeDisplay: "1.2",
    beforeLabel: "ROAS",
    afterNum: 4,
    afterSuffix: ".6",
    afterLabel: "ROAS",
    quote: "ROAS вырос с 1.2 до 4.6. Ребята думают про всю воронку — от первого касания до повторной покупки.",
    author: "Марат Д., владелец",
  },
  {
    client: "Brow Lab",
    niche: "Красота · Алматы",
    what: "Профиль под премиум-сегмент, Reels, Stories с записью и таргет на женскую аудиторию 25–40",
    duration: "2 месяца",
    beforeDisplay: "3",
    beforeLabel: "записи в неделю",
    afterNum: 18,
    afterSuffix: "",
    afterLabel: "записей в неделю",
    quote: "Профиль, который реально отличается от сотен других бьюти-аккаунтов. Запись заполнена на 3 недели.",
    author: "Сабина Р., владелица",
  },
  {
    client: "Lumière Home",
    niche: "E-commerce · Алматы",
    what: "Reels + таргет на покупателей декора, продуктовые видео и тесты офферов под сезонные пики",
    duration: "3 месяца",
    beforeDisplay: "1×",
    beforeLabel: "продажи до старта",
    afterNum: 2,
    afterSuffix: ".4×",
    afterLabel: "рост за первый квартал",
    quote: "Запустили Reels и таргет — продажи выросли в 2.4 раза за первый квартал. Команда на связи каждый день.",
    author: "Динара С., основатель",
  },
  {
    client: "Silk Room",
    niche: "Красота · Алматы",
    what: "Премиальная упаковка Instagram, контент про сервис и экспертность, таргет на платёжеспособную аудиторию",
    duration: "2.5 месяца",
    beforeDisplay: "18 000₸",
    beforeLabel: "средний чек",
    afterNum: 27,
    afterSuffix: " 000₸",
    afterLabel: "средний чек после роста",
    quote: "Контент стал выглядеть дорого — и клиенты это чувствуют. Средний чек вырос, потому что доверие появилось ещё до визита.",
    author: "Аружан П., основатель",
  },
] as const;

type CaseItem = (typeof CASES)[number];

function ResultCard({
  c,
  index,
  highlighted,
}: {
  c: CaseItem;
  index: number;
  highlighted: boolean;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const cardInView = useInView(cardRef, { once: true, margin: "-5%" });
  const count = useCountUp(c.afterNum, 1800, cardInView);

  return (
    <div className={styles.panelCell}>
      <ServicesPanelGlass id={`results-panel-${index}`}>
        <article
          ref={cardRef}
          className={`${styles.card} ${highlighted ? styles.cardActive : ""}`}
        >
          <div className={styles.split}>
            <div className={styles.side}>
              <span className={styles.sideLabel}>ДО</span>
              <span className={`${styles.sideNum} ${styles.numBefore}`}>
                {c.beforeDisplay}
              </span>
              <span className={styles.sideSub}>{c.beforeLabel}</span>
            </div>
            <div className={styles.side}>
              <span className={styles.sideLabel}>ПОСЛЕ</span>
              <span className={`${styles.sideNum} ${styles.numAfter}`}>
                {count}
                {c.afterSuffix}
              </span>
              <span className={`${styles.sideSub} ${styles.sideSubAfter}`}>
                {c.afterLabel}
              </span>
            </div>
          </div>

          <div className={styles.body}>
            <div className={styles.client}>
              <span className={styles.clientName}>{c.client}</span>
              <span className={styles.clientNiche}>{c.niche}</span>
            </div>
            <p className={styles.what}>{c.what}</p>
            <div className={styles.duration}>Срок: {c.duration}</div>
          </div>

          <blockquote className={styles.quote}>
            «{c.quote}»
            <span className={styles.quoteAuthor}>— {c.author}</span>
          </blockquote>
        </article>
      </ServicesPanelGlass>
    </div>
  );
}

export function ResultsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const visibleCount = useVisibleCount();
  const reduceMotion = useReducedMotion();
  const [trackIndex, setTrackIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const slideCount = Math.max(1, CASES.length - visibleCount + 1);
  const canLoop = slideCount > 1;
  const loopEndIndex = CASES.length;
  const loopItems = canLoop ? [...CASES, ...CASES] : [...CASES];
  const centerOffset = Math.floor((visibleCount - 1) / 2);
  const centerTrackIndex = trackIndex + centerOffset;
  const displayIndex =
    trackIndex >= slideCount ? 0 : trackIndex % slideCount;

  const goToSlide = useCallback(
    (index: number) => {
      setTransitionEnabled(true);
      setTrackIndex(((index % slideCount) + slideCount) % slideCount);
      setProgress(0);
    },
    [slideCount],
  );

  const advanceSlide = useCallback(() => {
    if (!canLoop) return;

    setTrackIndex((prev) => {
      if (prev >= loopEndIndex) return prev;
      return prev + 1;
    });
    setProgress(0);
  }, [canLoop, loopEndIndex]);

  useEffect(() => {
    setTrackIndex((prev) => Math.min(prev, slideCount - 1));
  }, [slideCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !canLoop) return;

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== track || event.propertyName !== "transform") return;
      if (trackIndex !== loopEndIndex) return;

      setTransitionEnabled(false);
      setTrackIndex(0);
    };

    track.addEventListener("transitionend", handleTransitionEnd);
    return () => track.removeEventListener("transitionend", handleTransitionEnd);
  }, [trackIndex, loopEndIndex, canLoop]);

  useEffect(() => {
    if (transitionEnabled || trackIndex !== 0) return;

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setTransitionEnabled(true));
    });

    return () => cancelAnimationFrame(id);
  }, [transitionEnabled, trackIndex]);

  useEffect(() => {
    if (!inView || paused || !canLoop || reduceMotion) {
      setProgress(0);
      return;
    }

    const started = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - started;
      setProgress(Math.min(elapsed / AUTO_INTERVAL_MS, 1));
      if (elapsed >= AUTO_INTERVAL_MS) {
        advanceSlide();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, paused, canLoop, trackIndex, reduceMotion, advanceSlide]);

  const thumbWidth = 100 / slideCount;
  const thumbLeft = displayIndex * thumbWidth;

  return (
    <section id="results" className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease }}
        >
          <p className={styles.label}>Результаты</p>
          <h2 className={styles.heading}>До и после в цифрах</h2>
        </motion.div>

        <div
          className={styles.carousel}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{ "--visible": visibleCount } as React.CSSProperties}
        >
          <div className={styles.carouselStage}>
            <div className={styles.viewport}>
              <div
                ref={trackRef}
                className={`${styles.track} ${
                  transitionEnabled ? "" : styles.trackInstant
                }`}
                style={{
                  transform: `translate3d(calc(${-trackIndex} * (var(--slide-size) + var(--carousel-gap))), 0, 0)`,
                }}
              >
                {loopItems.map((c, i) => (
                  <ResultCard
                    key={`${c.client}-${i}`}
                    c={c}
                    index={i}
                    highlighted={i === centerTrackIndex}
                  />
                ))}
              </div>
            </div>

            <div className={styles.fadeLeft} aria-hidden />
            <div className={styles.fadeRight} aria-hidden />
          </div>

          <div className={styles.scrollbarWrap}>
            <div
              className={styles.scrollbar}
              role="tablist"
              aria-label="Кейсы"
            >
              <div
                className={styles.scrollbarTrack}
                aria-hidden
              >
                <div
                  className={styles.scrollbarThumb}
                  style={{
                    width: `${thumbWidth}%`,
                    left: `${thumbLeft}%`,
                  }}
                />
                {!paused && slideCount > 1 && (
                  <div
                    className={styles.scrollbarProgress}
                    style={{
                      width: `${thumbWidth}%`,
                      left: `${thumbLeft}%`,
                      transform: `scaleX(${progress})`,
                    }}
                    aria-hidden
                  />
                )}
              </div>

              {Array.from({ length: slideCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === displayIndex}
                  aria-label={`Кейс ${i + 1} из ${slideCount}`}
                  className={`${styles.scrollbarHit} ${
                    i === displayIndex ? styles.scrollbarHitActive : ""
                  }`}
                  style={{ width: `${thumbWidth}%`, left: `${i * thumbWidth}%` }}
                  onClick={() => goToSlide(i)}
                />
              ))}
            </div>

            <span className={styles.scrollbarMeta} aria-live="polite">
              {String(displayIndex + 1).padStart(2, "0")} /{" "}
              {String(slideCount).padStart(2, "0")}
            </span>
          </div>
        </div>

        <motion.div
          className={styles.footer}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease, delay: 0.35 }}
        >
          <a href="/cases" className={styles.moreBtn}>
            Подробнее
          </a>
        </motion.div>
      </div>
    </section>
  );
}
