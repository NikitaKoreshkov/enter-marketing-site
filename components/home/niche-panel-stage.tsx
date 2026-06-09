"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "framer-motion";
import styles from "./niches-section.module.css";
import { NicheCheckIcon } from "./niche-icons";

const ease = [0.22, 1, 0.36, 1] as const;
const SWITCH_MS = 380;
const PHASE_CROSSFADE = 0.55;

/** 0 hero → 1 header → 2 analysis → 3 +problems → 4 actions + result */
const PHASE_MS = [0, 1200, 2100, 3100, 4600] as const;

const titleLayout = {
  layout: { duration: 0.9, ease },
  opacity: { duration: 0 },
} as const;

const analysisBarVariants = {
  hidden: { scaleY: 0, opacity: 0, y: 14 },
  visible: {
    scaleY: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: [0.22, 1.2, 0.36, 1] as const },
  },
};

const analysisBarsContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.18 },
  },
};
const FINAL_PHASE = PHASE_MS.length - 1;

export type NichePanelData = {
  id: string;
  title: string;
  analysis: string;
  pains: readonly string[];
  actions: readonly string[];
  resultNum: string;
  resultLabel: string;
  resultSub: string;
};

type Props = {
  niche: NichePanelData;
  inView: boolean;
};

export function NichePanelStage({ niche, inView }: Props) {
  const reduceMotion = useReducedMotion();
  const [committed, setCommitted] = useState(niche);
  const [phase, setPhase] = useState(reduceMotion ? FINAL_PHASE : 0);
  const [panelVisible, setPanelVisible] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  const runIdRef = useRef(0);
  const switchRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const sequenceStartedRef = useRef(false);
  const committedIdRef = useRef(niche.id);
  const nicheRef = useRef(niche);
  nicheRef.current = niche;

  const showContent = !isSwitching && panelVisible;
  const showDiag = showContent && phase >= 2 && phase < FINAL_PHASE;
  const showOutcome = showContent && phase >= FINAL_PHASE;

  const cancelSequence = useCallback(() => {
    runIdRef.current += 1;
  }, []);

  const beginSequence = useCallback(() => {
    if (reduceMotion) {
      setPhase(FINAL_PHASE);
      return;
    }

    const runId = ++runIdRef.current;
    setPhase(0);

    PHASE_MS.slice(1).forEach((ms, i) => {
      window.setTimeout(() => {
        if (runIdRef.current !== runId) return;
        setPhase(i + 1);
      }, ms);
    });
  }, [reduceMotion]);

  const finishSwitch = useCallback(() => {
    const next = nicheRef.current;
    committedIdRef.current = next.id;
    setCommitted(next);
    setIsSwitching(false);
    setPanelVisible(true);
    if (sequenceStartedRef.current) {
      beginSequence();
    } else {
      setPhase(0);
    }
  }, [beginSequence]);

  const startSwitch = useCallback(() => {
    cancelSequence();
    setIsSwitching(true);
    setPanelVisible(false);
    setPhase(0);

    if (switchRef.current) window.clearTimeout(switchRef.current);

    switchRef.current = window.setTimeout(() => {
      switchRef.current = null;
      finishSwitch();
    }, SWITCH_MS);
  }, [cancelSequence, finishSwitch]);

  useLayoutEffect(() => {
    const current = nicheRef.current;

    if (reduceMotion) {
      committedIdRef.current = current.id;
      setCommitted(current);
      setPhase(FINAL_PHASE);
      setIsSwitching(false);
      setPanelVisible(true);
      return;
    }

    if (!mountedRef.current) {
      mountedRef.current = true;
      committedIdRef.current = current.id;
      setCommitted(current);
      return;
    }

    if (current.id === committedIdRef.current) return;

    if (!sequenceStartedRef.current) {
      committedIdRef.current = current.id;
      setCommitted(current);
      setPhase(0);
      setIsSwitching(false);
      setPanelVisible(true);
      return;
    }

    startSwitch();

    return () => {
      if (switchRef.current) {
        window.clearTimeout(switchRef.current);
        switchRef.current = null;
      }
    };
  }, [niche.id, reduceMotion, startSwitch]);

  useEffect(() => {
    if (reduceMotion || !inView || sequenceStartedRef.current) return;
    sequenceStartedRef.current = true;
    beginSequence();
  }, [inView, reduceMotion, beginSequence]);

  return (
    <div className={styles.panelStage}>
      <motion.div
        className={
          showOutcome
            ? `${styles.panelFlow} ${styles.panelFlowOutcome}`
            : styles.panelFlow
        }
        initial={false}
        animate={{
          opacity: panelVisible ? 1 : 0,
        }}
        transition={{
          duration: reduceMotion ? 0.01 : SWITCH_MS / 1000,
          ease,
        }}
      >
        {showContent && (
          <LayoutGroup id={committed.id}>
            <motion.div
              key={committed.id}
              className={`${styles.panelContentSwap}${
                showOutcome ? ` ${styles.panelContentSwapOutcome}` : ""
              }`}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.45, ease }}
            >
              <div
                className={
                  phase === 0
                    ? styles.panelTitleAreaHero
                    : styles.panelTitleAreaCompact
                }
              >
                {phase === 0 ? (
                  <div className={styles.panelHeroFill}>
                    <motion.div
                      layoutId="niche-panel-title"
                      className={styles.panelTitleFlyHero}
                      layout="position"
                      transition={titleLayout}
                      animate={{ opacity: 1 }}
                      style={{ color: "#fff" }}
                    >
                      <h2 className={styles.panelHeroTitle}>
                        {committed.title}
                      </h2>
                    </motion.div>
                  </div>
                ) : (
                  <header
                    className={`${styles.panelHead} ${styles.panelHeadStack}`}
                  >
                    <motion.div
                      layoutId="niche-panel-title"
                      className={styles.panelTitleFlyCompact}
                      layout="position"
                      transition={titleLayout}
                      animate={{ opacity: 1 }}
                      style={{ color: "#fff" }}
                    >
                      <h3 className={styles.panelTitle}>{committed.title}</h3>
                    </motion.div>
                    <div
                      className={styles.tagCollapse}
                      data-open={showOutcome ? "true" : "false"}
                    >
                      <div className={styles.tagCollapseInner}>
                        <p className={styles.sectionTagSuccess}>Что мы делаем</p>
                      </div>
                    </div>
                  </header>
                )}
              </div>

            {phase >= 2 && (
            <div className={styles.panelStageBody}>
              <AnimatePresence mode="sync" initial={false}>
                {showDiag && (
                  <motion.div
                    key="diag"
                    className={styles.diagStack}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{
                      opacity: 0,
                      transition: { duration: PHASE_CROSSFADE, ease },
                    }}
                    transition={{ duration: PHASE_CROSSFADE, ease }}
                  >
                    <motion.section
                      className={styles.analysisBlock}
                      aria-label="Анализ бизнеса"
                      layout={false}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, ease }}
                    >
                      <div className={styles.analysisTop}>
                        <span className={styles.analysisTag}>Анализ бизнеса</span>
                        <span className={styles.analysisPulse} aria-hidden />
                      </div>
                      <p className={styles.analysisText}>{committed.analysis}</p>
                      <div className={styles.analysisViz} aria-hidden>
                        <motion.div
                          className={styles.analysisBars}
                          variants={analysisBarsContainer}
                          initial="hidden"
                          animate="visible"
                        >
                          {[72, 48, 86, 38, 64].map((h, i) => (
                            <motion.span
                              key={i}
                              className={styles.analysisBar}
                              variants={analysisBarVariants}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </motion.div>
                        <div className={styles.analysisGrid}>
                          {Array.from({ length: 12 }).map((_, i) => (
                            <span key={i} className={styles.analysisCell} />
                          ))}
                        </div>
                        <div className={styles.analysisScan} />
                      </div>
                    </motion.section>

                    <div
                      className={styles.problemsCollapse}
                      data-open={phase >= 3 ? "true" : "false"}
                    >
                      <div className={styles.problemsCollapseInner}>
                        <section className={styles.problemsSection}>
                          <p className={styles.sectionTagDanger}>
                            Проблемы клиента
                          </p>
                          <ul className={styles.painGrid}>
                            {committed.pains.map((pain, i) => (
                              <motion.li
                                key={pain}
                                className={styles.painCard}
                                initial={false}
                                animate={{
                                  opacity: phase >= 3 ? 1 : 0,
                                  x: phase >= 3 ? 0 : -12,
                                }}
                                transition={{
                                  duration: 0.45,
                                  ease,
                                  delay: phase >= 3 ? i * 0.07 : 0,
                                }}
                              >
                                <span className={styles.painIndex}>
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className={styles.painText}>{pain}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    </div>
                  </motion.div>
                )}

                {showOutcome && (
                  <motion.div
                    key="outcome"
                    className={styles.outcomeBlock}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{
                      opacity: 0,
                      transition: { duration: PHASE_CROSSFADE, ease },
                    }}
                    transition={{
                      duration: PHASE_CROSSFADE,
                      ease,
                      delay: 0.1,
                    }}
                  >
                    <div className={styles.outcomeStack}>
                      <ul className={styles.actionGrid}>
                        {committed.actions.map((action, i) => (
                          <motion.li
                            key={action}
                            className={styles.actionCard}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.48,
                              ease,
                              delay: 0.22 + i * 0.06,
                            }}
                          >
                            <NicheCheckIcon className={styles.checkIcon} />
                            <span>{action}</span>
                          </motion.li>
                        ))}
                      </ul>

                      <motion.div
                        className={styles.resultBadge}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease, delay: 0.48 }}
                      >
                        <span className={styles.resultNum}>{committed.resultNum}</span>
                        <div className={styles.resultMeta}>
                          <span className={styles.resultLabel}>
                            {committed.resultLabel}
                          </span>
                          <span className={styles.resultSub}>
                            {committed.resultSub}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}
            </motion.div>
          </LayoutGroup>
        )}
      </motion.div>
    </div>
  );
}
