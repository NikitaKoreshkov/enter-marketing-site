"use client";

import Link from "next/link";
import { useState } from "react";
import { BurgerMenu } from "./burger-menu";
import styles from "./header.module.css";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className={styles.spacer} aria-hidden />
      <header
        className={styles.header}
        style={{
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }}
      >
        <div className={styles.inner}>
          <Link href="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Enter Marketing"
              className={styles.logoImg}
              width={176}
              height={40}
            />
          </Link>

          <button
            type="button"
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
          </button>
        </div>
      </header>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
