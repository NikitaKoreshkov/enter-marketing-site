"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import styles from "./face-section.module.css";

const FaceScene = dynamic(
  () => import("./face-scene").then((m) => ({ default: m.FaceScene })),
  { ssr: false, loading: () => <div className={styles.canvasPlaceholder} /> }
);

const ease = [0.22, 1, 0.36, 1] as const;

const STATS = [
  { num: "4.7", label: "Рейтинг на 2ГИС" },
  { num: "120+", label: "Клиентов в Алматы" },
  { num: "3 года", label: "На рынке" },
] as const;

export function FaceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const inView = useInView(textRef, { once: true, margin: "-18%" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const canvasY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: 0, y: 0 };
  };

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.inner}>
        {/* Text */}
        <div className={styles.textCol} ref={textRef}>
          <motion.p
            className={styles.label}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease }}
          >
            Наш подход
          </motion.p>

          <div className={styles.headingWrap}>
            <span className={styles.headingRule} aria-hidden />
            <motion.h2
              className={styles.heading}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.95, ease, delay: 0.08 }}
            >
              <span className={styles.headingLine1}>Мы создаём</span>
              <span className={styles.headingAccent}>образы</span>
              <span className={styles.headingLine3}>которые продают</span>
            </motion.h2>
          </div>

          <motion.p
            className={styles.body}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, ease, delay: 0.18 }}
          >
            <span className={styles.bodyLead}>
              Ваша аудитория видит не товар — она видит историю.
            </span>{" "}
            Каждый пост, ролик и рекламный баннер мы строим так,
            чтобы не просто привлечь внимание, а конвертировать его в заявку.
          </motion.p>

          <motion.div
            className={styles.stats}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, ease, delay: 0.28 }}
          >
            {STATS.map((s, i) => (
              <div key={s.label} style={{ display: "contents" }}>
                {i > 0 && <div className={styles.statDivider} aria-hidden />}
                <div className={styles.stat}>
                  <span className={styles.statNum}>{s.num}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* 3D Canvas */}
        <motion.div
          className={styles.canvasCol}
          style={{ y: canvasY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.canvasFrame}>
            <div className={styles.canvasWrap}>
              <FaceScene mouseRef={mouseRef} />
            </div>
            <div className={styles.canvasVignette} aria-hidden />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
