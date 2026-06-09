"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import styles from "./services-panel-glass.module.css";

const ACTIVATION_ZONE = 200;
const ELASTICITY = 0.18;
const LERP = 0.08;

interface Props {
  children: React.ReactNode;
  id?: string;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function ServicesPanelGlass({ children, id = "services-panel" }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const geomRef = useRef({ cx: 0, cy: 0, w: 0, h: 0 });
  const mouseRef = useRef({ x: 0, y: 0, fade: 0 });
  const currentRef = useRef({ tx: 0, ty: 0, sx: 1, sy: 1 });

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const rafActiveRef = useRef(false);

  const syncGeom = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1) return;
    geomRef.current = {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      w: rect.width,
      h: rect.height,
    };
  }, []);

  const calcTarget = useCallback(() => {
    const { cx, cy, w } = geomRef.current;
    const { x: mx, y: my, fade } = mouseRef.current;

    if (w < 1 || fade <= 0) {
      return { tx: 0, ty: 0, sx: 1, sy: 1 };
    }

    const tx = (mx - cx) * ELASTICITY * 0.1 * fade;
    const ty = (my - cy) * ELASTICITY * 0.1 * fade;

    const deltaX = mx - cx;
    const deltaY = my - cy;
    const centerDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;
    const nx = deltaX / centerDistance;
    const ny = deltaY / centerDistance;
    const stretch = Math.min(centerDistance / 300, 1) * ELASTICITY * fade;
    const sx =
      1 +
      Math.abs(nx) * stretch * 0.3 -
      Math.abs(ny) * stretch * 0.15;
    const sy =
      1 +
      Math.abs(ny) * stretch * 0.3 -
      Math.abs(nx) * stretch * 0.15;

    return {
      tx,
      ty,
      sx: Math.max(0.985, sx),
      sy: Math.max(0.985, sy),
    };
  }, []);

  useEffect(() => {
    syncGeom();
    window.addEventListener("scroll", syncGeom, { passive: true });
    window.addEventListener("resize", syncGeom, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncGeom);
      window.removeEventListener("resize", syncGeom);
    };
  }, [syncGeom]);

  const startRaf = useCallback(() => {
    if (rafActiveRef.current) return;
    rafActiveRef.current = true;

    let raf = 0;

    const tick = () => {
      const target = calcTarget();
      const c = currentRef.current;

      c.tx = lerp(c.tx, target.tx, LERP);
      c.ty = lerp(c.ty, target.ty, LERP);
      c.sx = lerp(c.sx, target.sx, LERP);
      c.sy = lerp(c.sy, target.sy, LERP);

      const el = shellRef.current;
      if (el) {
        el.style.transform = `translate3d(${c.tx}px, ${c.ty}px, 0) scale(${c.sx}, ${c.sy})`;
      }

      const settled =
        Math.abs(c.tx - target.tx) < 0.02 &&
        Math.abs(c.ty - target.ty) < 0.02 &&
        Math.abs(c.sx - target.sx) < 0.001 &&
        Math.abs(c.sy - target.sy) < 0.001;

      if (!settled || mouseRef.current.fade > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        rafActiveRef.current = false;
      }
    };

    raf = requestAnimationFrame(tick);
  }, [calcTarget]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      syncGeom();
      const { cx, cy, w, h } = geomRef.current;
      if (w < 1) return;

      const edgeX = Math.max(0, Math.abs(e.clientX - cx) - w / 2);
      const edgeY = Math.max(0, Math.abs(e.clientY - cy) - h / 2);
      const dist = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
      const fade = dist > ACTIVATION_ZONE ? 0 : 1 - dist / ACTIVATION_ZONE;

      mouseRef.current = { x: e.clientX, y: e.clientY, fade };

      setMouseOffset({
        x: ((e.clientX - cx) / w) * 100 * fade,
        y: ((e.clientY - cy) / h) * 100 * fade,
      });

      startRaf();
    };

    const onLeave = () => {
      mouseRef.current = { x: 0, y: 0, fade: 0 };
      setMouseOffset({ x: 0, y: 0 });
      startRaf();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [syncGeom, startRaf]);

  const rimAngle = 135 + mouseOffset.x * 1.5;
  const rimPeak = Math.min(1, 1 + Math.abs(mouseOffset.x) * 0.002);
  const rimEdge = Math.min(
    0.9,
    (Math.abs(mouseOffset.x) + Math.abs(mouseOffset.y)) * 0.001,
  );

  return (
    <div id={id} ref={shellRef} className={styles.shell}>
      <div
        className={styles.rim}
        aria-hidden
        style={{
          background: `linear-gradient(${rimAngle}deg,
            rgba(255,255,255,${rimEdge}) 0%,
            rgba(255,255,255,${rimPeak}) 45%,
            rgba(255,255,255,${rimPeak * 0.9}) 55%,
            rgba(255,255,255,${rimEdge * 0.7}) 100%)`,
        }}
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
