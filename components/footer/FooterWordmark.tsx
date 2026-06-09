"use client";

import { useRef, useState } from "react";
import styles from "./FooterWordmark.module.css";

export function FooterWordmark() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;

    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
    setLit(true);
  };

  return (
    <div className={styles.wordmark}>
      <div
        ref={wrapRef}
        className={styles.textWrap}
        onMouseMove={handleMove}
        onMouseLeave={() => setLit(false)}
        aria-hidden
      >
        <p className={styles.textBase}>ENTER MARKETING</p>
        <p
          className={`${styles.textGlow}${lit ? ` ${styles.textGlowActive}` : ""}`}
          style={
            {
              "--mx": `${pos.x}%`,
              "--my": `${pos.y}%`,
            } as React.CSSProperties
          }
        >
          ENTER MARKETING
        </p>
      </div>
    </div>
  );
}
