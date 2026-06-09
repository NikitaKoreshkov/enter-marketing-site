"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ServicesPanelGlass } from "./services-panel-glass";
import styles from "./services-section.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

type StatConfig =
  | { prefix: "×"; end: number; rangeSuffix?: string }
  | { prefix: "−"; end: number; suffix: "%" };

const SERVICES = [
  {
    num: "01",
    title: "SMM",
    subtitle: "Социальные сети",
    stat: { prefix: "×", end: 3, rangeSuffix: "–5" } satisfies StatConfig,
    statLabel: "рост охвата",
    benefit: "Подписчики → покупатели",
    channels: ["Instagram", "Reels", "Stories"],
  },
  {
    num: "02",
    title: "Таргет",
    subtitle: "Платный трафик",
    stat: { prefix: "−", end: 60, suffix: "%" } satisfies StatConfig,
    statLabel: "стоимость заявки",
    benefit: "Платите за результат, не за показы",
    channels: ["Meta Ads", "TikTok", "Яндекс"],
  },
  {
    num: "03",
    title: "Видео",
    subtitle: "Видеопроизводство",
    stat: { prefix: "×", end: 4 } satisfies StatConfig,
    statLabel: "CTR рекламы",
    benefit: "Контент, который останавливает скролл",
    channels: ["Reels", "Ролики", "Монтаж"],
  },
] as const;

const viewport = { once: true, margin: "-10%" as const };

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }

    let start: number | null = null;
    let raf = 0;

    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return count;
}

function AnimatedNum({
  value,
  active,
  reduce,
  className,
}: {
  value: string;
  active: boolean;
  reduce: boolean | null;
  className?: string;
}) {
  const target = parseInt(value, 10);
  const count = useCountUp(target, 1000, active && !reduce);
  const shown = reduce
    ? value
    : String(active ? count : 0).padStart(value.length, "0");

  return <span className={className}>{shown}</span>;
}

function AnimatedStat({
  config,
  active,
  reduce,
  className,
}: {
  config: StatConfig;
  active: boolean;
  reduce: boolean | null;
  className?: string;
}) {
  const count = useCountUp(config.end, 1300, active && !reduce);
  const [rangeVisible, setRangeVisible] = useState(false);

  useEffect(() => {
    if (!active || reduce) {
      setRangeVisible(false);
      return;
    }
    if ("rangeSuffix" in config && config.rangeSuffix && count >= config.end) {
      const t = setTimeout(() => setRangeVisible(true), 120);
      return () => clearTimeout(t);
    }
  }, [active, count, config, reduce]);

  if (reduce) {
    const final =
      config.prefix === "−"
        ? `${config.prefix}${config.end}${config.suffix}`
        : `${config.prefix}${config.end}${"rangeSuffix" in config ? config.rangeSuffix ?? "" : ""}`;
    return <span className={className}>{final}</span>;
  }

  if (config.prefix === "−") {
    return (
      <span className={className}>
        {config.prefix}
        {active ? count : 0}
        {config.suffix}
      </span>
    );
  }

  return (
    <span className={className}>
      {config.prefix}
      {active ? count : 0}
      {"rangeSuffix" in config && config.rangeSuffix && rangeVisible
        ? config.rangeSuffix
        : ""}
    </span>
  );
}

function TypewriterText({
  text,
  active,
  reduce,
  className,
  delay = 0,
  speed = 32,
}: {
  text: string;
  active: boolean;
  reduce: boolean | null;
  className?: string;
  delay?: number;
  speed?: number;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      setDone(false);
      return;
    }

    if (reduce) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);
    let interval = 0;
    let i = 0;

    const startTimer = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          window.clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, delay);

    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(interval);
    };
  }, [active, text, reduce, delay, speed]);

  return (
    <span className={className} aria-label={text}>
      {displayed}
      {active && !done && !reduce && (
        <span className={styles.typeCursor} aria-hidden>
          |
        </span>
      )}
    </span>
  );
}

const revealUp: Variants = {
  hidden: { opacity: 0, y: 36, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease },
  },
};

const panelReveal: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.45,
      ease: [0.16, 1, 0.3, 1],
      opacity: { duration: 1.15, ease: [0.22, 1, 0.36, 1] },
      y: { duration: 1.45, ease: [0.16, 1, 0.3, 1] },
      scale: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

const cardReveal = (index: number): Variants => ({
  hidden: {
    opacity: 0,
    y: 56,
    x: index === 0 ? -24 : index === 2 ? 24 : 0,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: { duration: 0.95, ease, delay: index * 0.14 },
  },
});

const cardContent: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.12 },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease },
  },
};

const statPop: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.88 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.75, ease },
  },
};

function ServiceCard({
  service,
  index,
  reduce,
}: {
  service: (typeof SERVICES)[number];
  index: number;
  reduce: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, viewport);

  return (
    <motion.div
      ref={ref}
      className={styles.card}
      initial={reduce ? false : "hidden"}
      animate={reduce || inView ? "visible" : "hidden"}
      variants={reduce ? undefined : cardReveal(index)}
    >
      <motion.span
        className={styles.watermark}
        aria-hidden
        variants={reduce ? undefined : cardItem}
      >
        <AnimatedNum value={service.num} active={inView} reduce={reduce} />
      </motion.span>

      <motion.div
        className={styles.cardInner}
        variants={reduce ? undefined : cardContent}
        initial={reduce ? false : "hidden"}
        animate={reduce || inView ? "visible" : "hidden"}
      >
        <motion.div className={styles.cardHead} variants={reduce ? undefined : cardItem}>
          <TypewriterText
            text={service.subtitle}
            active={inView}
            reduce={reduce}
            className={styles.subtitle}
            delay={200}
            speed={36}
          />
          <AnimatedNum
            value={service.num}
            active={inView}
            reduce={reduce}
            className={styles.num}
          />
        </motion.div>

        <motion.h3 className={styles.title} variants={reduce ? undefined : cardItem}>
          {service.title}
        </motion.h3>

        <motion.div className={styles.statBlock} variants={reduce ? undefined : statPop}>
          <AnimatedStat
            config={service.stat}
            active={inView}
            reduce={reduce}
            className={styles.stat}
          />
          <TypewriterText
            text={service.statLabel}
            active={inView}
            reduce={reduce}
            className={styles.statLabel}
            delay={700}
            speed={40}
          />
        </motion.div>

        <motion.p className={styles.benefit} variants={reduce ? undefined : cardItem}>
          <TypewriterText
            text={service.benefit}
            active={inView}
            reduce={reduce}
            delay={950}
            speed={28}
          />
        </motion.p>

        <motion.p className={styles.channels} variants={reduce ? undefined : cardItem}>
          {service.channels.map((ch, idx) => (
            <span key={ch}>
              {idx > 0 && <span className={styles.channelSep} aria-hidden>·</span>}
              {ch}
            </span>
          ))}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export function ServicesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, viewport);
  const panelInView = useInView(panelRef, { once: true, margin: "-12%" });
  const reduce = useReducedMotion();

  return (
    <section id="services" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header} ref={headerRef}>
          <motion.p
            className={styles.label}
            initial={reduce ? false : "hidden"}
            animate={reduce || headerInView ? "visible" : "hidden"}
            variants={reduce ? undefined : revealUp}
          >
            <TypewriterText
              text="Что мы делаем"
              active={headerInView}
              reduce={reduce}
              delay={300}
              speed={45}
            />
          </motion.p>

          <h2 className={styles.heading}>
            <span className={styles.headingLine1}>Три инструмента</span>
            <span className={styles.headingAccent}>Один результат</span>
          </h2>
        </div>

        <div ref={panelRef} className={styles.panelWrap}>
          <motion.div
            className={styles.panelMotion}
            initial={reduce ? false : "hidden"}
            animate={reduce || panelInView ? "visible" : "hidden"}
            variants={reduce ? undefined : panelReveal}
          >
            <ServicesPanelGlass>
              <div className={styles.grid}>
                {SERVICES.map((s, i) => (
                  <ServiceCard key={s.num} service={s} index={i} reduce={reduce} />
                ))}
              </div>
            </ServicesPanelGlass>
          </motion.div>

          {!reduce && (
            <motion.div
              className={styles.panelBlurVeil}
              aria-hidden
              initial={{ opacity: 1 }}
              animate={panelInView ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
