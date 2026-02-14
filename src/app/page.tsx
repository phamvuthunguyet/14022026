"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useStarProgress } from "@/lib/useStarProgress";
import { LetterModal } from "@/components/LetterModal";
import type { StarsConfig, StarData, Phase } from "@/lib/types";

const Starfield = dynamic(
  () => import("@/components/Starfield").then((m) => m.Starfield),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-space-950">
        <p className="font-serif text-star-soft animate-pulse">
          Loading the stars…
        </p>
      </div>
    ),
  },
);

export default function HomePage() {
  const [config, setConfig] = useState<StarsConfig | null>(null);
  const [phase, setPhase] = useState<Phase>("exploring");
  const [formationProgress, setFormationProgress] = useState(0);
  const [letterStar, setLetterStar] = useState<StarData | null>(null);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [easterEggTriggered, setEasterEggTriggered] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const codeRef = useRef({ sequence: "", lastAt: 0 });
  const CODE = "240126";
  const CODE_TIMEOUT_MS = 3000;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 && e.key >= "0" && e.key <= "9") {
        const now = Date.now();
        if (now - codeRef.current.lastAt > CODE_TIMEOUT_MS) {
          codeRef.current.sequence = "";
        }
        codeRef.current.lastAt = now;
        codeRef.current.sequence = (codeRef.current.sequence + e.key).slice(
          -CODE.length,
        );
        if (codeRef.current.sequence === CODE) {
          setEasterEggTriggered(true);
          setShowFinalMessage(true);
          codeRef.current.sequence = "";
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    fetch("/api/stars")
      .then((res) => res.json())
      .then((data: StarsConfig) => setConfig(data))
      .catch(() => {
        setConfig(null);
      });
  }, []);

  const mainStarIds = config?.mainStarIds ?? [];
  const {
    openedIds,
    openStar,
    reset,
    allOpened,
    openedCount,
    mainStarIds: _m,
  } = useStarProgress(mainStarIds);

  useEffect(() => {
    if (!allOpened || phase !== "exploring") return;
    const timeoutId = setTimeout(() => {
      setPhase("formation");
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [allOpened, phase]);

  useEffect(() => {
    if (phase !== "formation") return;
    const start = performance.now();
    const duration = 3000;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      setFormationProgress(t);
      if (t < 1) requestAnimationFrame(tick);
      else {
        setPhase("complete");
        setShowFinalMessage(true);
      }
    };
    requestAnimationFrame(tick);
  }, [phase]);

  const handleLetterOpen = useCallback((star: StarData) => {
    setLetterStar(star);
    setPhase("letter-open");
  }, []);

  const handleLetterClose = useCallback(() => {
    if (letterStar) {
      openStar(letterStar.id);
      setLetterStar(null);
    }
    setPhase("exploring");
    setShowOnboarding(false);
  }, [letterStar, openStar]);

  const handleReset = useCallback(() => {
    reset();
    setPhase("exploring");
    setFormationProgress(0);
    setLetterStar(null);
    setShowFinalMessage(false);
    setEasterEggTriggered(false);
    setShowOnboarding(true);
    setShowResetConfirm(false);
  }, [reset]);

  const finalMessage = config?.finalMessage;
  const easterEgg = config?.easterEgg;
  const messageToShow =
    easterEggTriggered && easterEgg ? easterEgg : (finalMessage ?? null);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-950">
        <p className="font-serif text-star-soft">Loading...</p>
      </div>
    );
  }

  const totalMain = config.mainStarIds.length;

  return (
    <main className="relative min-h-screen w-full bg-space-950 overflow-hidden">
      <Starfield
        config={config}
        openedIds={openedIds}
        openStar={openStar}
        phase={phase}
        formationProgress={formationProgress}
        onLetterOpen={handleLetterOpen}
        letterOpen={!!letterStar}
        focusedStarId={letterStar?.id ?? null}
      />

      {/* Onboarding hint */}
      <AnimatePresence>
        {showOnboarding && phase === "exploring" && openedCount === 0 && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 -translate-x-1/2 text-star-dim text-sm font-sans z-10"
            style={{ left: "46%" }}
          >
            Click a star to read a letter.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        <span className="font-sans text-star-soft text-sm tabular-nums">
          {openedCount}/{totalMain} stars
        </span>
        <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-star-glow rounded-full"
            initial={false}
            animate={{ width: `${(openedCount / totalMain) * 100}%` }}
            transition={{ type: "spring", damping: 20 }}
          />
        </div>
      </div>

      {/* Reset */}
      <div className="absolute top-4 right-4 z-10">
        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="text-star-dim hover:text-star-soft text-xs font-sans transition-colors"
          >
            Reset
          </button>
        ) : (
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={handleReset}
              className="text-red-300 hover:text-red-200"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="text-star-soft"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Letter modal */}
      <LetterModal
        isOpen={!!letterStar}
        onClose={handleLetterClose}
        body={letterStar?.message ?? ""}
      />

      {/* Final message modal (normal completion or easter egg) */}
      <AnimatePresence>
        {showFinalMessage && messageToShow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="final-title"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="paper max-w-lg w-full rounded-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h2
                  id="final-title"
                  className="font-serif text-2xl text-star-bright"
                >
                  {messageToShow.title}
                </h2>
              </div>
              <div className="p-6">
                <p className="font-serif text-star-soft leading-relaxed whitespace-pre-wrap">
                  {messageToShow.body}
                </p>
              </div>
              <div className="p-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFinalMessage(false);
                    setEasterEggTriggered(false);
                  }}
                  className="px-4 py-2 rounded-lg font-sans text-star-soft hover:text-star-bright hover:bg-white/5 transition-colors"
                >
                  Keep exploring
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFinalMessage(false);
                    setEasterEggTriggered(false);
                    handleReset();
                  }}
                  className="px-4 py-2 rounded-lg font-sans bg-star-glow/20 text-star-bright hover:bg-star-glow/30 transition-colors"
                >
                  Replay
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
