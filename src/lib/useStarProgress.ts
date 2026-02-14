"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "stellar-love-opened-stars";

export function useStarProgress(mainStarIds: string[]) {
  const [openedIds, setOpenedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) {
          setOpenedIds(
            new Set(parsed.filter((id) => mainStarIds.includes(id))),
          );
        }
      }
    } catch {
      // ignore
    }
  }, [mainStarIds.join(",")]);

  const persist = useCallback((next: Set<string>) => {
    setOpenedIds(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // ignore
    }
  }, []);

  const openStar = useCallback(
    (id: string) => {
      if (!mainStarIds.includes(id)) return;
      setOpenedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [mainStarIds],
  );

  const reset = useCallback(() => {
    setOpenedIds(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const allOpened =
    mainStarIds.length > 0 && mainStarIds.every((id) => openedIds.has(id));
  const openedCount = mainStarIds.filter((id) => openedIds.has(id)).length;

  return { openedIds, openStar, reset, allOpened, openedCount, mainStarIds };
}
