import Link from "next/link";
import { HashLink } from "./hash-link";
import styles from "./footer.module.css";

const NAV = [
  { href: "#hero", label: "Главная" },
  { href: "#cases", label: "Кейсы" },
  { href: "#footer", label: "Контакты" },
  { href: "/login", label: "Кабинет" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
            <div className={styles.brandCol}>
              <p className={styles.colTitle}>Компания</p>
              <Link href="/" className={styles.logo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.svg"
                  alt="Enter Marketing"
                  className={styles.logoImg}
                  width={176}
                  height={40}
                />
              </Link>
              <p className={styles.tagline}>
                Digital агентство полного цикла. Таргет, SMM, видеопроизводство и
                маркетинг под ключ.
              </p>
            </div>

            <nav className={styles.navCol} aria-label="Навигация в подвале">
              <p className={styles.colTitle}>Навигация</p>
              <ul className={styles.navList}>
                {NAV.map(({ href, label }) => (
                  <li key={href}>
                    {href.startsWith("#") ? (
                      <HashLink
                        href={href as `#${string}`}
                        className={styles.navLink}
                      >
                        <span>{label}</span>
                      </HashLink>
                    ) : (
                      <Link href={href} className={styles.navLink}>
                        <span>{label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.contactCol}>
              <p className={styles.colTitle}>Контакты</p>
              <ul className={styles.contactList}>
                <li>
                  <a href="tel:+77051222765" className={styles.contactPrimary}>
                    +7 (705) 122 27 65
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:enter-marketing@gmail.com"
                    className={styles.contactLink}
                  >
                    enter-marketing@gmail.com
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
              <p className={styles.colTitle}>Быстрая связь</p>
              <div className={styles.socials}>
                <a
                  href="https://api.whatsapp.com/send/?phone=77051222765"
                  className={styles.socialLink}
                  aria-label="WhatsApp"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
                <a
                  href="mailto:enter-marketing@gmail.com"
                  className={styles.socialLink}
                  aria-label="Email"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
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
              <span className={styles.legalDot} aria-hidden>
                ·
              </span>
              <span className={styles.location}>Алматы · Казахстан</span>
            </div>
          </div>
        </div>
    </footer>
  );
}
