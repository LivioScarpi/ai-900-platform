"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  durationSeconds: number;
  onExpire?: () => void;
  paused?: boolean;
}

export function Timer({ durationSeconds, onExpire, paused }: Props) {
  const [remaining, setRemaining] = useState(durationSeconds);
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
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, onExpire]);

  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");
  const urgent = remaining < 300; // < 5 minutes

  return (
    <span
      className={`font-mono font-bold tabular-nums ${urgent ? "text-status-red" : "text-ink"}`}
    >
      {minutes}:{seconds}
    </span>
  );
}
