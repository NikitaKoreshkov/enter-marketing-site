import { HashLink } from "./hash-link";
import styles from "./hero.module.css";

export function HeroSection() {
  return (
    <section id="hero" className={styles.section} aria-label="Главный экран">
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
          <div className={styles.bottomFade} aria-hidden />
          <div className={styles.readability} aria-hidden />

          <div className={styles.content}>
            <div className={styles.inner}>
              <p className={styles.eyebrow}>Digital агентство</p>
              <h1 className={styles.title}>
                <span className={styles.titleLine}>Enter</span>
                <span className={styles.titleAccent}>Marketing</span>
              </h1>
              <p className={styles.slogan}>
                Помогаем компаниям увеличить поток клиентов за счёт рекламы
                и&nbsp;эффективных инструментов маркетинга и&nbsp;продаж.
              </p>
              <HashLink href="#cases" className={styles.cta}>
                Смотреть кейсы
              </HashLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
