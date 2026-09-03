"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import type { SiteCase } from "@/lib/site/case-types";
import styles from "./case-modal.module.css";

type CaseModalProps = {
  siteCase: SiteCase;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
};

type MediaItem = {
  src: string;
  kind: "image" | "video";
};

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

const MEDIA_LOOP = 3;
const MEDIA_AUTOPLAY_MS = 3800;
const CAROUSEL_MIN = 5;
const VIDEO_STUB_COUNT = 3;

function MediaViewer({
  label,
  items,
  index,
  open,
  onClose,
  onPrev,
  onNext,
}: {
  label: string;
  items: MediaItem[];
  index: number;
  open: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const total = items.length;
  const item = total > 0 ? items[((index % total) + total) % total] : null;
  const realIndex = total > 0 ? ((index % total) + total) % total : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    document.documentElement.setAttribute("data-media-viewer-open", "");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.removeAttribute("data-media-viewer-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, onNext, onPrev]);

  if (!mounted || !open || !item) return null;

  const visible = open && entered;

  return createPortal(
    <div
      className={`${styles.mediaViewer} ${visible ? styles.mediaViewerOpen : ""}`}
      data-media-viewer=""
      onClick={onClose}
      onWheel={(event) => event.preventDefault()}
      onTouchMove={(event) => event.preventDefault()}
    >
      <div
        className={`${styles.mediaViewerPanel} ${visible ? styles.mediaViewerPanelOpen : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.mediaViewerClose}
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>
        {total > 1 ? (
          <button
            type="button"
            className={`${styles.mediaViewerNav} ${styles.mediaViewerPrev}`}
            aria-label="Предыдущий"
            onClick={onPrev}
          >
            ‹
          </button>
        ) : null}
        <div className={styles.mediaViewerCard}>
          {item.kind === "video" ? (
            <video
              className={styles.mediaViewerMedia}
              src={item.src}
              controls
              autoPlay
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.mediaViewerMedia} src={item.src} alt="" />
          )}
          <div className={styles.mediaViewerMeta}>
            <span className={styles.mediaViewerLabel}>{label}</span>
            <span className={styles.mediaViewerIndex}>
              {String(realIndex + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
          </div>
        </div>
        {total > 1 ? (
          <button
            type="button"
            className={`${styles.mediaViewerNav} ${styles.mediaViewerNext}`}
            aria-label="Следующий"
            onClick={onNext}
          >
            ›
          </button>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

function MediaGrid({
  label,
  items,
}: {
  label: string;
  items: MediaItem[];
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const total = items.length;

  const openAt = (i: number) => {
    setViewerIndex(i);
    setViewerOpen(true);
  };

  const goBy = (delta: number) => {
    if (total === 0) return;
    setViewerIndex((current) => (current + delta + total) % total);
  };

  return (
    <>
      <div className={styles.mediaGrid}>
        {items.map((item, i) => (
          <button
            key={`${item.src}-${i}`}
            type="button"
            className={`${styles.mediaCard} ${styles.mediaCardActive} ${styles.mediaGridCard}`}
            onClick={() => openAt(i)}
          >
            {item.kind === "video" ? (
              <video
                className={styles.mediaCardMedia}
                src={item.src}
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.mediaCardMedia} src={item.src} alt="" />
            )}
            <span className={styles.mediaLabel}>{label}</span>
            <span className={styles.mediaIndex}>
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      <MediaViewer
        label={label}
        items={items}
        index={viewerIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onPrev={() => goBy(-1)}
        onNext={() => goBy(1)}
      />
    </>
  );
}

function MediaStubs({ label }: { label: string }) {
  return (
    <div className={styles.mediaGrid}>
      {Array.from({ length: VIDEO_STUB_COUNT }, (_, i) => (
        <div
          key={i}
          className={`${styles.mediaCard} ${styles.mediaCardActive} ${styles.mediaGridCard} ${styles.mediaStub}`}
          aria-hidden
        >
          <span className={styles.mediaStubPlay}>▶</span>
          <span className={styles.mediaLabel}>{label}</span>
          <span className={styles.mediaIndex}>
            {String(i + 1).padStart(2, "0")}
          </span>
        </div>
      ))}
    </div>
  );
}

function MediaCarousel({
  label,
  items,
}: {
  label: string;
  items: MediaItem[];
}) {
  const total = items.length;
  const trackLength = Math.max(total, 1) * MEDIA_LOOP;
  const [index, setIndex] = useState(Math.max(total, 1));
  const [offset, setOffset] = useState(0);
  const [instant, setInstant] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(index);

  indexRef.current = index;
  const realIndex = total > 0 ? ((index % total) + total) % total : 0;
  const slides =
    total > 0
      ? Array.from({ length: trackLength }, (_, i) => i % total)
      : [];
  const paused = hoverPaused || viewerOpen;

  useEffect(() => {
    setIndex(Math.max(total, 1));
    setInstant(true);
  }, [total, items]);

  const calcOffset = useCallback((target: number) => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return null;
    const card = track.children[target] as HTMLElement | undefined;
    if (!card) return null;
    return viewport.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
  }, []);

  const snapToMiddle = useCallback(
    (fromIndex: number) => {
      const middle = ((fromIndex % total) + total) % total + total;
      if (middle === fromIndex) return fromIndex;

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
        setInstant(false);
      });

      return middle;
    },
    [calcOffset, total]
  );

  useLayoutEffect(() => {
    const next = calcOffset(index);
    if (next != null) setOffset(next);
    if (!instant) return;

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setInstant(false));
    });
    return () => cancelAnimationFrame(id);
  }, [index, calcOffset, instant]);

  useEffect(() => {
    const onResize = () => {
      const next = calcOffset(indexRef.current);
      if (next != null) setOffset(next);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [calcOffset]);

  const goBy = useCallback(
    (delta: number) => {
      if (delta === 0 || total === 0) return;

      let current = indexRef.current;

      if (current < total || current >= total * 2) {
        current = snapToMiddle(current);
      }

      let target = current + delta;

      if (target < 0 || target >= trackLength) {
        current = snapToMiddle(current);
        target = current + delta;
      }

      indexRef.current = target;
      setInstant(false);
      setIndex(target);
    },
    [snapToMiddle, total, trackLength]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onEnd = (event: TransitionEvent) => {
      if (event.target !== track || event.propertyName !== "transform") return;
      const current = indexRef.current;
      if (current >= total && current < total * 2) return;
      snapToMiddle(current);
    };

    track.addEventListener("transitionend", onEnd);
    return () => track.removeEventListener("transitionend", onEnd);
  }, [snapToMiddle, total]);

  useEffect(() => {
    if (paused) return;

    const id = window.setInterval(() => {
      goBy(1);
    }, MEDIA_AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [goBy, paused, realIndex]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let startX = 0;
    let active = false;
    let didDrag = false;

    const onDown = (event: PointerEvent) => {
      active = true;
      didDrag = false;
      startX = event.clientX;
    };
    const onMove = (event: PointerEvent) => {
      if (!active) return;
      if (Math.abs(event.clientX - startX) > 8) didDrag = true;
    };
    const onUp = (event: PointerEvent) => {
      if (!active) return;
      active = false;
      const dx = event.clientX - startX;
      if (!didDrag || Math.abs(dx) < 36) return;
      if (dx < 0) goBy(1);
      else goBy(-1);
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
  }, [goBy]);

  const onCardClick = (slideIndex: number) => {
    if (slideIndex === index) {
      setViewerOpen(true);
      return;
    }

    const targetReal = slideIndex % total;
    const current = indexRef.current;
    const currentReal = ((current % total) + total) % total;
    const forward = (targetReal - currentReal + total) % total;
    const backward = (currentReal - targetReal + total) % total;
    if (forward === 0) return;
    if (forward <= backward) goBy(forward);
    else goBy(-backward);
  };

  return (
    <>
      <div
        className={styles.mediaCarousel}
        onPointerEnter={() => setHoverPaused(true)}
        onPointerLeave={() => setHoverPaused(false)}
      >
        <div className={styles.mediaStage}>
          <button
            type="button"
            className={`${styles.mediaArrow} ${styles.mediaArrowPrev}`}
            aria-label="Назад"
            onClick={() => goBy(-1)}
          >
            ‹
          </button>

          <div className={styles.mediaViewport} ref={viewportRef}>
            <div
              className={`${styles.mediaTrack} ${instant ? styles.mediaTrackInstant : ""}`}
              ref={trackRef}
              style={{ transform: `translate3d(${offset}px, 0, 0)` }}
            >
              {slides.map((real, i) => {
                const item = items[real];
                return (
                  <article
                    key={`${real}-${i}`}
                    className={`${styles.mediaCard} ${i === index ? styles.mediaCardActive : ""}`}
                    data-distance={Math.min(Math.abs(i - index), 2)}
                    onClick={() => onCardClick(i)}
                  >
                    {item.kind === "video" ? (
                      <video
                        className={styles.mediaCardMedia}
                        src={item.src}
                        muted
                        playsInline
                        loop
                        autoPlay={i === index}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className={styles.mediaCardMedia}
                        src={item.src}
                        alt=""
                      />
                    )}
                    <span className={styles.mediaLabel}>{label}</span>
                    <span className={styles.mediaIndex}>
                      {String(real + 1).padStart(2, "0")}
                    </span>
                  </article>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className={`${styles.mediaArrow} ${styles.mediaArrowNext}`}
            aria-label="Вперёд"
            onClick={() => goBy(1)}
          >
            ›
          </button>
        </div>

        <div className={styles.mediaDots}>
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.mediaDot} ${i === realIndex ? styles.mediaDotActive : ""}`}
              onClick={() => {
                const currentReal = realIndex;
                const forward = (i - currentReal + total) % total;
                const backward = (currentReal - i + total) % total;
                if (forward === 0) return;
                if (forward <= backward) goBy(forward);
                else goBy(-backward);
              }}
              aria-label={`Слайд ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <MediaViewer
        label={label}
        items={items}
        index={realIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onPrev={() => goBy(-1)}
        onNext={() => goBy(1)}
      />
    </>
  );
}

function MediaSection({
  label,
  items,
  stubsWhenEmpty = false,
}: {
  label: string;
  items: MediaItem[];
  stubsWhenEmpty?: boolean;
}) {
  if (items.length === 0) {
    if (stubsWhenEmpty) return <MediaStubs label={label} />;
    return (
      <div className={styles.mediaEmpty}>
        {label === "Видео" ? "Видео пока не добавлены" : "Фото пока не добавлены"}
      </div>
    );
  }

  if (items.length < CAROUSEL_MIN) {
    return <MediaGrid label={label} items={items} />;
  }

  return <MediaCarousel label={label} items={items} />;
}

export function CaseModal({ siteCase, open, onClose, onExited }: CaseModalProps) {
  const [entered, setEntered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      document.documentElement.removeAttribute("data-case-modal-open");
      return;
    }

    document.documentElement.setAttribute("data-case-modal-open", "");
    return () => document.documentElement.removeAttribute("data-case-modal-open");
  }, [open]);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (document.documentElement.hasAttribute("data-media-viewer-open")) return;
      onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const visible = open && entered;
  const instagramUrl = siteCase.instagram
    ? `https://instagram.com/${siteCase.instagram}`
    : null;

  const reveal = (delayMs: number, extra = "") => ({
    className: `${styles.reveal} ${extra} ${visible ? styles.revealIn : ""}`.trim(),
    style: { ["--d" as string]: `${delayMs}ms` },
  });

  if (!mounted) return null;

  return createPortal(
    <div
      className={`${styles.overlay} ${visible ? styles.overlayOpen : ""}`}
      data-case-modal=""
      role="dialog"
      aria-modal="true"
      aria-label={siteCase.title}
      onClick={onClose}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.propertyName !== "opacity") return;
        if (!open) onExited();
      }}
    >
      <div
        className={`${styles.dialog} ${visible ? styles.dialogOpen : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`${styles.topBar} ${reveal(40).className}`} style={reveal(40).style}>
          <div>
            <div className={styles.caseTitle}>{siteCase.title}</div>
            <div className={styles.caseService}>{siteCase.service}</div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Закрыть"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          <section className={`${styles.story} ${reveal(80).className}`} style={reveal(80).style}>
            <div className={styles.storyMeta}>
              <span className={styles.storyIndex}>01</span>
              <span className={styles.blockTitle}>Описание проекта</span>
            </div>
            <p className={styles.storyText}>{siteCase.description}</p>
          </section>

          {instagramUrl ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className={`${styles.igCard} ${reveal(140).className}`}
              style={reveal(140).style}
            >
              <div className={styles.igAvatarWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={siteCase.cover}
                  alt=""
                  className={styles.igAvatar}
                />
              </div>
              <div className={styles.igInfo}>
                <span className={styles.igHandle}>@{siteCase.instagram}</span>
                <span className={styles.igName}>{siteCase.title}</span>
                <span className={styles.igCta}>Открыть Instagram</span>
              </div>
              <span className={styles.igIcon}>
                <InstagramIcon />
              </span>
            </a>
          ) : null}

          <section className={`${styles.workSection} ${reveal(180).className}`} style={reveal(180).style}>
            <div className={styles.storyMeta}>
              <span className={styles.storyIndex}>02</span>
              <span className={styles.blockTitle}>Что мы сделали</span>
            </div>
            <ol className={styles.timeline}>
              {siteCase.work.map((item, i) => {
                const anim = reveal(200 + i * 40);
                return (
                  <li
                    key={item}
                    className={`${styles.timelineItem} ${anim.className}`}
                    style={anim.style}
                  >
                    <span className={styles.timelineNum}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.timelineText}>{item}</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className={styles.block}>
            <div
              className={`${styles.storyMeta} ${reveal(320).className}`}
              style={reveal(320).style}
            >
              <span className={styles.storyIndex}>03</span>
              <span className={styles.blockTitle}>Результат</span>
            </div>
            <div
              className={`${styles.resultCard} ${reveal(360, styles.revealFromRight).className}`}
              style={reveal(360).style}
            >
              <p className={styles.resultText}>{siteCase.result}</p>
            </div>
            <div className={styles.results}>
              {siteCase.results.map((item, i) => {
                const anim = reveal(420 + i * 70);
                return (
                  <div
                    key={item.label}
                    className={`${styles.result} ${anim.className}`}
                    style={anim.style}
                  >
                    <span className={styles.resultValue}>{item.value}</span>
                    <span className={styles.resultLabel}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={`${styles.block} ${reveal(620).className}`} style={reveal(620).style}>
            <div className={styles.storyMeta}>
              <span className={styles.storyIndex}>04</span>
              <span className={styles.blockTitle}>Видео</span>
            </div>
            <MediaSection
              label="Видео"
              items={siteCase.videos.map((src) => ({
                src,
                kind: "video" as const,
              }))}
              stubsWhenEmpty
            />
          </section>

          {siteCase.images.length > 0 ? (
            <section className={`${styles.block} ${reveal(700).className}`} style={reveal(700).style}>
              <div className={styles.storyMeta}>
                <span className={styles.storyIndex}>05</span>
                <span className={styles.blockTitle}>Фотографии</span>
              </div>
              <MediaSection
                label="Фото"
                items={siteCase.images.map((src) => ({
                  src,
                  kind: "image" as const,
                }))}
              />
            </section>
          ) : null}

          <div className={`${styles.footer} ${reveal(820).className}`} style={reveal(820).style}>
            <button type="button" className={styles.closeBottom} onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
