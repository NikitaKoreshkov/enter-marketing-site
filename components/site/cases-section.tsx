"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import type { SiteCase } from "@/lib/site/case-types";
import { CaseModal } from "./case-modal";
import styles from "./cases-section.module.css";

const LOOP_COPIES = 3;
const AUTOPLAY_MS = 4200;

export function CasesSection({ cases }: { cases: SiteCase[] }) {
  const total = cases.length;
  const [modalCase, setModalCase] = useState<SiteCase | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [index, setIndex] = useState(total);
  const [offset, setOffset] = useState(0);
  const [durationMs, setDurationMs] = useState(650);
  const [instant, setInstant] = useState(true);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [pagePaused, setPagePaused] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(index);
  const progressRef = useRef(0);
  const pendingCaseIdRef = useRef<string | null>(null);
  const pendingOpenTimerRef = useRef(0);
  const normalizingRef = useRef(false);
  const bootedRef = useRef(false);

  indexRef.current = index;
  progressRef.current = progress;

  const paused = hoverPaused || pagePaused;
  const modalActive = Boolean(modalCase);

  const slides = useMemo(
    () => Array.from({ length: LOOP_COPIES }, () => cases).flat(),
    [cases, total]
  );

  const realIndex = total > 0 ? ((index % total) + total) % total : 0;
  const trackLength = total * LOOP_COPIES;

  const calcOffset = useCallback((targetIndex: number) => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return null;

    const card = track.children[targetIndex] as HTMLElement | undefined;
    if (!card) return null;

    return viewport.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
  }, []);

  const snapToMiddle = useCallback(
    (fromIndex: number) => {
      if (total === 0) return fromIndex;
      const middle = ((fromIndex % total) + total) % total + total;
      if (middle === fromIndex) return fromIndex;

      normalizingRef.current = true;
      flushSync(() => {
        setInstant(true);
        setIndex(middle);
      });
      indexRef.current = middle;

      const nextOffset = calcOffset(middle);
      if (nextOffset != null) {
        flushSync(() => setOffset(nextOffset));
      }

      flushSync(() => {
        normalizingRef.current = false;
        setInstant(false);
      });

      return middle;
    },
    [calcOffset, total]
  );

  useLayoutEffect(() => {
    const nextOffset = calcOffset(index);
    if (nextOffset == null) return;
    setOffset(nextOffset);

    if (!bootedRef.current) {
      bootedRef.current = true;
      setReady(true);
      // Keep transitions off until after first paint in the correct place
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setInstant(false);
        });
      });
      return;
    }

    if (!instant) return;

    void trackRef.current?.offsetHeight;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        normalizingRef.current = false;
        setInstant(false);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [index, calcOffset, instant, slides.length]);

  useEffect(() => {
    const onResize = () => {
      const nextOffset = calcOffset(indexRef.current);
      if (nextOffset != null) setOffset(nextOffset);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [calcOffset]);

  // Always step from a live indexRef — and rebase into the middle copy
  // immediately if a previous wrap-animation hasn't normalized yet.
  // That keeps last→first available even when the user spam-clicks.
  const goBy = useCallback(
    (delta: number, slideMs?: number) => {
      if (total === 0 || delta === 0) return 0;

      let current = indexRef.current;

      if (current < total || current >= total * 2) {
        current = snapToMiddle(current);
      }

      let target = current + delta;

      if (target < 0 || target >= trackLength) {
        current = snapToMiddle(current);
        target = current + delta;
      }

      const duration = slideMs ?? Math.min(1200, 640 + Math.abs(delta) * 100);
      indexRef.current = target;
      setDurationMs(duration);
      setInstant(false);
      setIndex(target);
      return duration;
    },
    [snapToMiddle, total, trackLength]
  );

  const goToReal = useCallback(
    (targetReal: number, slideMs?: number) => {
      if (total === 0) return 0;

      let current = indexRef.current;
      if (current < total || current >= total * 2) {
        current = snapToMiddle(current);
      }

      const currentReal = ((current % total) + total) % total;
      const normalized = ((targetReal % total) + total) % total;
      if (normalized === currentReal) return 0;

      const forward = (normalized - currentReal + total) % total;
      const backward = (currentReal - normalized + total) % total;
      const steps = forward <= backward ? forward : backward;
      const duration =
        slideMs ?? Math.min(1200, 640 + steps * 100);

      if (forward <= backward) goBy(forward, duration);
      else goBy(-backward, duration);

      return duration;
    },
    [goBy, snapToMiddle, total]
  );

  const showModal = useCallback(
    (caseId: string) => {
      const item = cases.find((entry) => entry.id === caseId);
      if (!item) return;
      setModalCase(item);
      setModalOpen(true);
    },
    [cases]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleModalExited = useCallback(() => {
    setModalCase(null);
  }, []);

  const openCaseFromCard = useCallback(
    (caseId: string, slideIndex: number, isActive: boolean) => {
      window.clearTimeout(pendingOpenTimerRef.current);
      pendingCaseIdRef.current = null;

      if (isActive) {
        showModal(caseId);
        return;
      }

      // Faster slide when opening a case, modal starts before slide fully ends
      const wait = goToReal(slideIndex % total, 420);
      if (wait === 0) {
        showModal(caseId);
        return;
      }

      pendingCaseIdRef.current = caseId;
      pendingOpenTimerRef.current = window.setTimeout(() => {
        if (pendingCaseIdRef.current !== caseId) return;
        pendingCaseIdRef.current = null;
        showModal(caseId);
      }, wait + 16);
    },
    [goToReal, showModal, total]
  );

  const next = useCallback(() => goBy(1), [goBy]);
  const prev = useCallback(() => goBy(-1), [goBy]);

  const resyncCarousel = useCallback(() => {
    if (total === 0) return;

    progressRef.current = 0;
    setProgress(0);

    const current = snapToMiddle(indexRef.current);
    const nextOffset = calcOffset(current);
    if (nextOffset != null) setOffset(nextOffset);
  }, [calcOffset, snapToMiddle, total]);

  // Pause + hard resync when leaving/returning to the tab or bfcache
  useEffect(() => {
    const onHide = () => setPagePaused(true);

    const onShow = () => {
      resyncCarousel();
      setPagePaused(false);
    };

    const onVisibility = () => {
      if (document.hidden) onHide();
      else onShow();
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) onShow();
    };

    if (document.hidden) onHide();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [resyncCarousel]);

  // Hard-reset progress before paint on every real slide change
  useLayoutEffect(() => {
    progressRef.current = 0;
    setProgress(0);
  }, [realIndex]);

  // Autoplay — frame-delta clock (no wall-clock catch-up after tab sleep)
  useEffect(() => {
    if (!ready || total === 0 || modalActive || paused) return;

    let raf = 0;
    let advanced = false;
    let last = performance.now();
    let elapsed = progressRef.current * AUTOPLAY_MS;

    const tick = (now: number) => {
      const delta = Math.min(Math.max(0, now - last), 64);
      last = now;
      elapsed += delta;

      const nextProgress = Math.min(1, elapsed / AUTOPLAY_MS);
      progressRef.current = nextProgress;
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        if (!advanced) {
          advanced = true;
          progressRef.current = 0;
          goBy(1);
        }
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, total, modalActive, goBy, realIndex, paused]);

  // Quiet wrap: after a slow slide into a clone, teleport back to middle
  useEffect(() => {
    if (total === 0) return;
    const track = trackRef.current;
    if (!track) return;

    const onEnd = (event: TransitionEvent) => {
      if (event.target !== track || event.propertyName !== "transform") return;

      const pending = pendingCaseIdRef.current;
      if (pending) {
        pendingCaseIdRef.current = null;
        window.clearTimeout(pendingOpenTimerRef.current);
        showModal(pending);
      }

      const current = indexRef.current;
      if (current >= total && current < total * 2) return;

      snapToMiddle(current);
    };

    track.addEventListener("transitionend", onEnd);
    return () => track.removeEventListener("transitionend", onEnd);
  }, [showModal, snapToMiddle, total]);

  useEffect(() => {
    return () => window.clearTimeout(pendingOpenTimerRef.current);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let startX = 0;
    let active = false;
    let didDrag = false;

    const onDown = (event: PointerEvent) => {
      // Don't steal clicks from cards — only track potential swipe
      if ((event.target as HTMLElement).closest("button")?.classList.contains(styles.arrow)) {
        return;
      }
      active = true;
      didDrag = false;
      startX = event.clientX;
    };

    const onMove = (event: PointerEvent) => {
      if (!active) return;
      if (Math.abs(event.clientX - startX) > 10) {
        didDrag = true;
      }
    };

    const onUp = (event: PointerEvent) => {
      if (!active) return;
      active = false;
      const dx = event.clientX - startX;
      if (didDrag && Math.abs(dx) > 40) {
        event.preventDefault();
        if (dx < 0) next();
        else prev();
      }
    };

    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onUp);
    viewport.addEventListener("pointercancel", onUp);
    return () => {
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerup", onUp);
      viewport.removeEventListener("pointercancel", onUp);
    };
  }, [next, prev]);

  // Desktop trackpad / shift+wheel horizontal browsing
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let acc = 0;
    let gestureUsed = false;
    let idleTimer = 0;

    const endGesture = () => {
      gestureUsed = false;
      acc = 0;
    };

    const onWheel = (event: WheelEvent) => {
      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);
      const useVerticalAsHorizontal = event.shiftKey && absY >= absX;
      const delta = useVerticalAsHorizontal ? event.deltaY : event.deltaX;

      // Ignore plain vertical page scroll
      if (!useVerticalAsHorizontal && absX < absY) return;
      if (Math.abs(delta) < 0.5) return;

      event.preventDefault();

      // One physical flick = one slide; ignore trackpad inertia after that
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(endGesture, 180);

      if (gestureUsed) return;

      acc += delta;
      if (Math.abs(acc) < 40) return;

      gestureUsed = true;
      const direction = acc;
      acc = 0;
      if (direction > 0) next();
      else prev();
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.clearTimeout(idleTimer);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [next, prev]);

  if (total === 0) {
    return (
      <section id="cases" className={styles.section}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>Наши кейсы</h2>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="cases" className={styles.section}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>Наши кейсы</h2>

          <div className={styles.carousel}>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowPrev}`}
              aria-label="Предыдущий кейс"
              onClick={prev}
              style={{
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
              }}
            >
              <svg
                className={styles.arrowIcon}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M14.5 5.5 8 12l6.5 6.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div
              className={`${styles.viewport} ${ready ? styles.viewportReady : ""}`}
              ref={viewportRef}
              onPointerEnter={() => setHoverPaused(true)}
              onPointerLeave={() => setHoverPaused(false)}
            >
              <div
                className={`${styles.track} ${instant ? styles.trackInstant : ""}`}
                ref={trackRef}
                style={{
                  transform: `translate3d(${offset}px, 0, 0)`,
                  transitionDuration: instant ? "0ms" : `${durationMs}ms`,
                  ["--slide-duration" as string]: instant ? "0ms" : `${durationMs}ms`,
                }}
              >
                {slides.map((item, i) => {
                  const isActive = i === index;
                  const distance = Math.abs(i - index);
                  return (
                    <article
                      key={`${item.id}-${i}`}
                      className={`${styles.card} ${isActive ? styles.cardActive : ""} ${instant ? styles.cardInstant : ""}`}
                      data-distance={Math.min(distance, 3)}
                      role="button"
                      tabIndex={0}
                      onClick={() => openCaseFromCard(item.id, i, isActive)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        openCaseFromCard(item.id, i, isActive);
                      }}
                    >
                      <div className={styles.cardBody}>
                        <span className={styles.watermark} aria-hidden>
                          {String((i % total) + 1).padStart(2, "0")}
                        </span>

                        <div className={styles.cardTop}>
                          <span className={styles.index}>
                            {String((i % total) + 1).padStart(2, "0")}
                          </span>
                          <h3 className={styles.title}>{item.title}</h3>
                        </div>

                        <div className={styles.cardBottom}>
                          <span className={styles.service}>{item.service}</span>
                          <span className={styles.viewBtn}>
                            Смотреть
                            <svg
                              className={styles.viewIcon}
                              viewBox="0 0 16 16"
                              fill="none"
                              aria-hidden
                            >
                              <path
                                d="M3 8h10M9 4l4 4-4 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowNext}`}
              aria-label="Следующий кейс"
              onClick={next}
              style={{
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
              }}
            >
              <svg
                className={styles.arrowIcon}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9.5 5.5 16 12l-6.5 6.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className={styles.footerNav}>
            <div className={styles.progress}>
              {cases.map((item, i) => {
                const isActive = i === realIndex;
                const isDone = i < realIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={item.title}
                    aria-current={isActive ? "true" : undefined}
                    className={`${styles.bar} ${isActive ? styles.barActive : ""} ${isDone ? styles.barDone : ""}`}
                    onClick={() => goToReal(i)}
                  >
                    <span className={styles.barTrack} />
                    <span
                      className={styles.barFill}
                      style={{
                        transform: `translateY(-50%) scaleX(${isDone ? 1 : isActive ? progress : 0})`,
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <p className={styles.counter}>
              <span className={styles.counterCurrent}>
                {String(realIndex + 1).padStart(2, "0")}
              </span>
              <span className={styles.counterSep}>/</span>
              <span className={styles.counterTotal}>
                {String(total).padStart(2, "0")}
              </span>
            </p>
          </div>

          <div className={styles.ctaBlock}>
            <p className={styles.ctaEyebrow}>Следующий кейс — ваш</p>
            <h3 className={styles.ctaTitle}>
              Готовы к цифрам,
              <br />
              а не к обещаниям?
            </h3>
            <p className={styles.ctaText}>
              Разберём нишу, соберём стратегию и запустим маркетинг, который
              приводит заявки — как в кейсах выше.
            </p>
            <a
              href="https://api.whatsapp.com/send/?phone=77051222765"
              target="_blank"
              rel="noreferrer"
              className={styles.ctaButton}
            >
              Обсудить проект
            </a>
          </div>
        </div>
      </section>

      {modalCase ? (
        <CaseModal
          siteCase={modalCase}
          open={modalOpen}
          onClose={closeModal}
          onExited={handleModalExited}
        />
      ) : null}
    </>
  );
}
