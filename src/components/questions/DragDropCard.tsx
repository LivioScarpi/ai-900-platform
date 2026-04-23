"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { DragDropQuestion } from "@/types/question";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { ContextImage } from "@/components/ContextImage";
import { TopicBadge } from "@/components/TopicBadge";

interface Props {
  question: DragDropQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
}

function DraggableChip({
  id,
  label,
  disabled,
}: {
  id: string;
  label: string;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ touchAction: "none" }}
      className={`px-4 py-2.5 rounded-xl border-2 text-[13px] font-semibold select-none transition-all
        ${disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
        ${isDragging ? "opacity-30" : ""}
        border-brand/50 bg-[rgba(0,120,212,0.06)] text-brand`}
    >
      {label}
    </div>
  );
}

function DropZone({
  id,
  targetText,
  assignedItem,
  confirmed,
  isCorrect,
}: {
  id: string;
  targetText: string;
  assignedItem: string | null;
  confirmed: boolean;
  isCorrect: boolean | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  let zoneClass =
    "min-h-[52px] rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-medium px-3 transition-colors";
  if (!confirmed) {
    zoneClass +=
      isOver
        ? " border-brand bg-[rgba(0,120,212,0.06)]"
        : " border-cream-200 bg-white";
  } else {
    zoneClass +=
      isCorrect
        ? " border-status-green bg-status-green-bg"
        : " border-status-red bg-status-red-bg";
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-ink-muted">
        {targetText}
      </span>
      <div ref={setNodeRef} className={zoneClass}>
        {assignedItem ? (
          <span
            className={`font-semibold ${confirmed ? (isCorrect ? "text-status-green" : "text-status-red") : "text-brand"}`}
          >
            {assignedItem}
          </span>
        ) : (
          <span className="text-gray-400">Drop here</span>
        )}
      </div>
    </div>
  );
}

export function DragDropCard({ question, onAnswer }: Props) {
  // assignments: targetIndex → item label
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  // Items not yet placed in any drop zone
  const placedItems = new Set(Object.values(assignments));
  const availableItems = question.items.filter((item) => !placedItems.has(item));

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const targetIndex = parseInt(over.id as string, 10);
    const draggedItem = active.id as string;

    setAssignments((prev) => {
      const next = { ...prev };
      // Remove this item from any other slot it was in
      for (const [k, v] of Object.entries(next)) {
        if (v === draggedItem) delete next[parseInt(k)];
      }
      next[targetIndex] = draggedItem;
      return next;
    });
  }

  function confirm() {
    if (Object.keys(assignments).length < question.targets.length) return;
    setConfirmed(true);
    const isCorrect = question.targets.every(
      (t, i) => assignments[i] === t.correctItem
    );
    onAnswer(isCorrect, question.targets.map((_, i) => assignments[i] ?? ""));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge topic={question.topic} />
        <span className="font-mono text-[10px] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-full bg-[#fce7f3] text-[#be185d] uppercase border border-[#fbcfe8]">
          Drag &amp; Drop
        </span>
      </div>

      {(question.contextImages ?? []).map((url) => (
        <ContextImage key={url} src={url} />
      ))}

      <p className="text-[15px] font-semibold text-ink leading-relaxed">
        {question.text}
      </p>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: draggable chips */}
          <div className="flex flex-col gap-2">
            <p className="label-caps text-ink-faint mb-1">Items</p>
            {availableItems.map((item) => (
              <DraggableChip
                key={item}
                id={item}
                label={item}
                disabled={confirmed}
              />
            ))}
            {availableItems.length === 0 && (
              <p className="font-mono text-[11px] text-ink-faint italic">All items placed</p>
            )}
          </div>

          {/* Right: drop zones */}
          <div className="flex flex-col gap-3">
            <p className="label-caps text-ink-faint mb-1">Targets</p>
            {question.targets.map((target, i) => {
              const assigned = assignments[i] ?? null;
              const isCorrect = confirmed
                ? assigned === target.correctItem
                : null;
              return (
                <DropZone
                  key={i}
                  id={String(i)}
                  targetText={target.text}
                  assignedItem={assigned}
                  confirmed={confirmed}
                  isCorrect={isCorrect}
                />
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeId && (
            <div className="px-4 py-2.5 rounded-xl border-2 border-brand bg-[rgba(0,120,212,0.08)] text-brand text-[13px] font-semibold shadow-lg">
              {activeId}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {confirmed &&
        question.targets.map((t, i) =>
          assignments[i] !== t.correctItem ? (
            <p key={i} className="text-xs text-status-green font-semibold">
              {t.text} → <strong>{t.correctItem}</strong>
            </p>
          ) : null
        )}

      {!confirmed && (
        <button
          onClick={confirm}
          disabled={Object.keys(assignments).length < question.targets.length}
          className="mt-1 w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-40 hover:bg-brand-dark transition-colors tracking-wide"
        >
          Check Answers
        </button>
      )}

      {confirmed && (
        <ExplanationDrawer
          explanation={question.explanation}
          reference={question.reference}
        />
      )}
    </div>
  );
}
