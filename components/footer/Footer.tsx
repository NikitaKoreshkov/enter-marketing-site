import Link from "next/link";
import styles from "./Footer.module.css";

const NAV = [
  { href: "#services", label: "Услуги" },
  { href: "#niches", label: "Ниши" },
  { href: "#results", label: "Кейсы" },
  { href: "#reviews", label: "Отзывы" },
  { href: "#contact", label: "Заявка" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <p className={styles.colTitle}>Компания</p>
            <Link href="/" className={styles.logo}>
              Enter Marketing
            </Link>
            <p className={styles.tagline}>
              SMM, таргет и видеопроизводство для бизнеса в Алматы
            </p>
          </div>

          <nav className={styles.navCol} aria-label="Навигация в подвале">
            <p className={styles.colTitle}>Навигация</p>
            <ul className={styles.navList}>
              {NAV.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className={styles.navLink}>
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.contactCol}>
            <p className={styles.colTitle}>Контакты</p>
            <ul className={styles.contactList}>
              <li>
                <a href="tel:+77001234567" className={styles.contactPrimary}>
                  +7 700 123 45 67
                </a>
              </li>
              <li>
                <a href="mailto:hello@enter.kz" className={styles.contactLink}>
                  hello@enter.kz
                </a>
              </li>
              <li>
                <span className={styles.contactText}>Пн—Пт, 9:00–18:00</span>
              </li>
              <li>
                <span className={styles.contactText}>Алматы, Казахстан</span>
              </li>
            </ul>
          </div>

          <div className={styles.socialCol}>
            <p className={styles.colTitle}>Соцсети</p>
            <div className={styles.socials}>
              <a
                href="#"
                className={styles.socialLink}
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </a>
              <a
                href="#"
                className={styles.socialLink}
                aria-label="Instagram"
                title="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="#"
                className={styles.socialLink}
                aria-label="Telegram"
                title="Telegram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>© {year} Enter Marketing</p>
          <div className={styles.legal}>
            <a href="#" className={styles.legalLink}>
              Политика конфиденциальности
            </a>
            <span className={styles.legalDot} aria-hidden>·</span>
            <span className={styles.location}>Алматы · Казахстан</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
