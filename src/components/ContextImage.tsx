"use client";

import { useState } from "react";

interface Props {
  src: string;
}

export function ContextImage({ src }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="rounded-xl overflow-hidden border border-cream-200 cursor-zoom-in"
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/images/${src}`}
          alt="Question context"
          className="w-full object-contain max-h-72"
        />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/images/${src}`}
            alt="Question context (zoomed)"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl leading-none"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
