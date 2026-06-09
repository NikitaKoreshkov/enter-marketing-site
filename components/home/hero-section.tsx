"use client";

import { motion, useReducedMotion } from "framer-motion";
import styles from "./hero-section.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

function scrollToNextSection() {
  const hero = document.querySelector('[data-hero-section="true"]');
  const next = hero?.nextElementSibling;
  if (next instanceof HTMLElement) {
    next.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section className={styles.hero} aria-label="Главный экран" data-hero-section="true">
      <div className={styles.frame}>
        <div className={styles.media}>
          <video
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          >
            <source src="/hero-showreel.mp4" type="video/mp4" />
          </video>

          <div className={styles.shade} aria-hidden />
          <div className={styles.grain} aria-hidden />
          <div className={styles.vignette} aria-hidden />
          <div className={styles.tint} aria-hidden />
          <div className={styles.bottomFade} aria-hidden />
          <div className={styles.readability} aria-hidden />

          <div className={styles.content}>
            <motion.div
              className={styles.copy}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              <p className={styles.pre}>Не контент — не охваты</p>

              <h1 className={styles.title}>
                Только <span className={styles.titleAccent}>продажи</span>
              </h1>

              <p className={styles.lead}>
                SMM, таргет и видео в Алматы — ведём от внимания в ленте до
                заявки в кабинете
              </p>

              <div className={styles.actions}>
                <a href="#contact" className={styles.btnPrimary}>
                  Обсудить проект
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        className={styles.scrollCue}
        onClick={scrollToNextSection}
        aria-label="Листайте дальше"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease, delay: reduce ? 0 : 1.35 }}
      >
        <span className={styles.scrollText}>Листайте дальше</span>
        <span className={styles.scrollTrack} aria-hidden>
          <span className={styles.scrollPulse} />
        </span>
      </motion.button>
    </section>
  );
}
