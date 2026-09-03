"use client";

import Link from "next/link";
import { useEffect, type MouseEvent } from "react";
import { scrollToSection } from "@/lib/site/scroll";
import styles from "./burger-menu.module.css";

const LINKS = [
  { href: "#hero", label: "Главная", index: "01" },
  { href: "#cases", label: "Кейсы", index: "02" },
  { href: "#footer", label: "Контакты", index: "03" },
] as const;

type BurgerMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function BurgerMenu({ open, onClose }: BurgerMenuProps) {
  useEffect(() => {
    document.documentElement.toggleAttribute("data-menu-open", open);
    return () => document.documentElement.removeAttribute("data-menu-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    onClose();

    window.setTimeout(() => {
      scrollToSection(href);
      history.pushState(null, "", href);
    }, 80);
  };

  return (
    <div
      className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
      aria-hidden={!open}
      onClick={onClose}
    >
      <nav
        className={styles.panel}
        aria-label="Меню"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.layout}>
          <div className={styles.lead} style={{ ["--i" as string]: 0 }}>
            <p className={styles.eyebrow}>Enter Marketing</p>
            <p className={styles.tagline}>Digital агентство полного цикла</p>
          </div>

          <ul className={styles.nav}>
            {LINKS.map((link, i) => (
              <li
                key={link.href}
                className={styles.navItem}
                style={{ ["--i" as string]: i + 1 }}
              >
                <Link
                  href={link.href}
                  className={styles.link}
                  onClick={(event) => onNavClick(event, link.href)}
                >
                  <span className={styles.linkIndex}>{link.index}</span>
                  <span className={styles.linkLabel}>{link.label}</span>
                  <span className={styles.linkArrow} aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.foot} style={{ ["--i" as string]: 5 }}>
            <div className={styles.footMeta}>
              <a href="tel:+77051222765" className={styles.phone}>
                +7 (705) 122 27 65
              </a>
              <span className={styles.dot} aria-hidden>
                ·
              </span>
              <a
                href="mailto:enter-marketing@gmail.com"
                className={styles.email}
              >
                enter-marketing@gmail.com
              </a>
              <span className={styles.dot} aria-hidden>
                ·
              </span>
              <span className={styles.place}>Алматы</span>
            </div>

            <a
              href="https://api.whatsapp.com/send/?phone=77051222765"
              className={styles.cta}
              target="_blank"
              rel="noreferrer noopener"
              onClick={onClose}
            >
              Обсудить проект
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}
