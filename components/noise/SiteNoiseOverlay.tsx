import styles from "./SiteNoiseOverlay.module.css";

export function SiteNoiseOverlay() {
  return (
    <div
      id="site-noise-overlay"
      className={styles.overlay}
      aria-hidden="true"
    >
      <div className={styles.grain} />
    </div>
  );
}
