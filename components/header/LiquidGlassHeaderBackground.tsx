"use client";

import { useRef, useEffect, useLayoutEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import LiquidGlass from "liquid-glass-react";

/*
  z-стек:
    z-1   — #background-container
    z-2   — LiquidGlass plate  ← видит контент страницы снизу, НЕ видит header
    z-5   — rim (белая обводка)
    z-10  — shell с ссылками/кнопками   ← полностью отдельный слой
*/

const VAR_CX = "--glass-header-cx";
const VAR_CY = "--glass-header-cy";
const VAR_W  = "--glass-header-w";
const VAR_H  = "--glass-header-h";

const GLASS_BORDER_RADIUS_PX = 20;
const ACTIVATION_ZONE        = 200;

export interface GlassParams {
  displacementScale:   number;
  blurAmount:          number;
  saturation:          number;
  aberrationIntensity: number;
  rimAngle:            number;
  rimPeak:             number;
  rimEdge:             number;
}

export const DEFAULT_GLASS_PARAMS: GlassParams = {
  displacementScale:   151,
  blurAmount:          0.12,
  saturation:          200,
  aberrationIntensity: 5,
  rimAngle:            135,
  rimPeak:             1,
  rimEdge:             0,
};

interface Props {
  params?:    GlassParams;
  forceShow?: boolean;
}

export function LiquidGlassHeaderBackground({
  params    = DEFAULT_GLASS_PARAMS,
  forceShow = false,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [geo, setGeo]         = useState({ cx: 0, cy: 0, w: 0, h: 0, r: GLASS_BORDER_RADIUS_PX, key: "" });

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [mousePos,    setMousePos]    = useState<{ x: number; y: number } | undefined>(undefined);

  const geomRef = useRef({ cx: 0, cy: 0, w: 0, h: 0 });

  const flushVars = useCallback((cx: number, cy: number, w: number, h: number) => {
    const s = document.documentElement.style;
    s.setProperty(VAR_CX, `${cx}px`);
    s.setProperty(VAR_CY, `${cy}px`);
    s.setProperty(VAR_W,  `${Math.max(1, w)}px`);
    s.setProperty(VAR_H,  `${Math.max(1, h)}px`);
    geomRef.current = { cx, cy, w, h };
  }, []);

  const sync = useCallback(() => {
    const el = document.querySelector<HTMLElement>("#site-header");
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const w  = rect.width;
    const h  = rect.height;
    flushVars(cx, cy, w, h);
    const key = `${Math.round(w / 8)}x${Math.round(h / 4)}`;
    setGeo({ cx, cy, w, h, r: GLASS_BORDER_RADIUS_PX, key });
  }, [flushVars]);

  /* rAF sync loop */
  useEffect(() => {
    sync();
    setMounted(true);
    let rafId = 0;
    let alive = true;
    const frame = () => {
      if (!alive) return;
      sync();
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  useLayoutEffect(() => {
    if (mounted) sync();
  }, [mounted, sync]);

  /* Mouse tracking */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const { cx, cy, w, h } = geomRef.current;
      if (w < 1) return;
      const edgeX = Math.max(0, Math.abs(e.clientX - cx) - w / 2);
      const edgeY = Math.max(0, Math.abs(e.clientY - cy) - h / 2);
      const dist  = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
      const fade  = dist > ACTIVATION_ZONE ? 0 : 1 - dist / ACTIVATION_ZONE;
      setMouseOffset({
        x: ((e.clientX - cx) / w) * 100 * fade,
        y: ((e.clientY - cy) / h) * 100 * fade,
      });
      setMousePos(fade > 0 ? { x: e.clientX, y: e.clientY } : undefined);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!mounted || geo.w < 10) return null;

  const rimAngle = params.rimAngle + mouseOffset.x * 1.5;
  const rimPeak  = Math.min(1,   params.rimPeak + Math.abs(mouseOffset.x) * 0.002);
  const rimEdge  = Math.min(0.9, params.rimEdge + (Math.abs(mouseOffset.x) + Math.abs(mouseOffset.y)) * 0.001);

  const fixedBase: React.CSSProperties = {
    position: "fixed",
    top:    `var(${VAR_CY})`,
    left:   `var(${VAR_CX})`,
    width:  `var(${VAR_W})`,
    height: `var(${VAR_H})`,
    pointerEvents: "none",
  };

  return createPortal(
    <div id="liquid-glass-header-portal">
      {/* ── Стекло: z-2. backdrop-filter видит страницу, НЕ видит контент хедера (z-10) ── */}
      <LiquidGlass
        key={geo.key}
        mode="standard"
        displacementScale={params.displacementScale}
        blurAmount={params.blurAmount}
        saturation={params.saturation}
        aberrationIntensity={params.aberrationIntensity}
        elasticity={0}
        cornerRadius={geo.r}
        overLight={false}
        padding="0px"
        globalMousePos={mousePos}
        mouseOffset={mouseOffset}
        style={{ ...fixedBase, zIndex: 2 }}
      >
        <span aria-hidden style={{ display: "block", width: `var(${VAR_W})`, height: `var(${VAR_H})` }} />
      </LiquidGlass>

      {/* ── Rim: z-5, поверх стекла, под контентом ── */}
      <div
        aria-hidden
        style={{
          ...fixedBase,
          transform:    "translate(-50%, -50%)",
          borderRadius: geo.r,
          padding:      "1px",
          background:   `linear-gradient(${rimAngle}deg,
            rgba(255,255,255,${rimEdge}) 0%,
            rgba(255,255,255,${rimPeak}) 45%,
            rgba(255,255,255,${rimPeak * 0.9}) 55%,
            rgba(255,255,255,${rimEdge * 0.7}) 100%
          )`,
          WebkitMask:         "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite:       "exclude",
          zIndex: 5,
        } as React.CSSProperties}
      />
    </div>,
    document.body,
  );
}
