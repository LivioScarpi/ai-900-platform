"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  durationSeconds: number;
  initialSeconds?: number;
  onExpire?: () => void;
  onTick?: (remaining: number) => void;
  paused?: boolean;
}

export function Timer({ durationSeconds, initialSeconds, onExpire, onTick, paused }: Props) {
  const [remaining, setRemaining] = useState(initialSeconds ?? durationSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onExpire?.();
          onTick?.(0);
          return 0;
        }
        const next = prev - 1;
        onTick?.(next);
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, onExpire, onTick]);

  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");
  const urgent = remaining < 300;

  return (
    <span className={`font-mono font-bold tabular-nums ${urgent ? "text-status-red" : "text-ink"}`}>
      {minutes}:{seconds}
    </span>
  );
}
