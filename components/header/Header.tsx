"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useContactModal } from "@/components/contact/contact-modal-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { ProfileIcon } from "@/components/icons/profile-icon";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { LiquidGlassHeaderBackground } from "./LiquidGlassHeaderBackground";
import styles from "./Header.module.css";

const LINKS = [
  { href: "#services", label: "Услуги"   },
  { href: "#niches",   label: "Ниши"     },
  { href: "#results",  label: "Кейсы"    },
  { href: "#reviews",  label: "Отзывы"   },
  { href: "#contact",  label: "Заявка"   },
];

const CTA_LABEL = "Обсудить проект";
const PROFILE_ARIA = "Мой профиль";

export function Header() {
  const [open, setOpen] = useState(false);
  const { open: openContactModal } = useContactModal();
  const { user } = useAuth();
  const profileHref = user ? AUTH_ROUTES.profile : AUTH_ROUTES.login;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleOpenContact = () => {
    setOpen(false);
    openContactModal();
  };

  return (
    <>
      {/*
        Стекло портируется в document.body (z-2).
        Никак не связано с содержимым хедера.
        Видит страницу снизу, не видит shell (z-10).
      */}
      <LiquidGlassHeaderBackground forceShow />

      {/*
        Shell — фиксированный контейнер с навигацией (z-10).
        Полностью отдельный от glass слой.
        id="site-header" — glass измеряет геометрию по нему.
      */}
      <div className={styles.shell} data-site-header-shell>
        <div id="site-header" className={styles.pill}>
          <div className={styles.barInner}>
            <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
              <span className={styles.logoTitle}>Enter Marketing</span>
            </Link>

            <nav className={styles.nav} aria-label="Навигация">
              {LINKS.map(({ href, label }) => (
                <a key={href} href={href} className={styles.navLink}>
                  {label}
                </a>
              ))}
            </nav>

            <div className={styles.right}>
              <button
                type="button"
                className={styles.cta}
                onClick={handleOpenContact}
              >
                {CTA_LABEL}
              </button>
              <Link
                href={profileHref}
                className={styles.profileBtn}
                aria-label={PROFILE_ARIA}
                onClick={() => setOpen(false)}
              >
                <ProfileIcon size={20} />
              </Link>
              <button
                type="button"
                className={`${styles.menuBtn}${open ? ` ${styles.menuBtnOpen}` : ""}`}
                aria-label={open ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className={styles.mobileMenu}>
            {LINKS.map(({ href, label }) => (
              <a key={href} href={href} className={styles.mobileLink} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            <div className={styles.mobileFooter}>
              <button
                type="button"
                className={styles.cta}
                onClick={handleOpenContact}
              >
                {CTA_LABEL}
              </button>
              <Link
                href={profileHref}
                className={styles.profileBtn}
                aria-label={PROFILE_ARIA}
                onClick={() => setOpen(false)}
              >
                <ProfileIcon size={20} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
