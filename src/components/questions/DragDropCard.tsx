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

const SRC_PREFIX = "src__";

function DraggableChip({
  id,
  label,
  disabled,
  used,
}: {
  id: string;
  label: string;
  disabled: boolean;
  used?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ touchAction: "none" }}
      className={`px-4 py-2.5 rounded-xl border-2 text-[13px] font-semibold select-none transition-all flex items-center gap-2
        ${disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
        ${isDragging ? "opacity-30" : ""}
        ${used && !disabled ? "opacity-50 border-brand/30 bg-[rgba(0,120,212,0.03)]" : "border-brand/50 bg-[rgba(0,120,212,0.06)]"}
        text-brand`}
    >
      <span>{label}</span>
      {used && !disabled && (
        <span className="text-[10px] font-normal opacity-60">✓ used</span>
      )}
    </div>
  );
}

function DropZone({
  id,
  targetText,
  assignedItem,
  confirmed,
  isCorrect,
  onClear,
}: {
  id: string;
  targetText: string;
  assignedItem: string | null;
  confirmed: boolean;
  isCorrect: boolean | null;
  onClear: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  let zoneClass =
    "min-h-[52px] rounded-xl border-2 border-dashed flex items-center px-3 transition-colors";
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
      <span className="text-xs text-ink-muted">{targetText}</span>
      <div ref={setNodeRef} className={zoneClass}>
        {assignedItem ? (
          <div className="flex items-center justify-between w-full">
            <span
              className={`text-[13px] font-semibold ${
                confirmed
                  ? isCorrect
                    ? "text-status-green"
                    : "text-status-red"
                  : "text-brand"
              }`}
            >
              {assignedItem}
            </span>
            {!confirmed && (
              <button
                onClick={onClear}
                className="ml-2 text-ink-faint hover:text-ink text-lg leading-none"
                aria-label="Clear"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">Drop here</span>
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

  // Set of item labels currently placed in any drop zone
  const placedItems = new Set(Object.values(assignments));

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    const draggedId = active.id as string;
    // Source items use "src__" prefix; extract real item name
    const realItem = draggedId.startsWith(SRC_PREFIX)
      ? draggedId.slice(SRC_PREFIX.length)
      : draggedId;

    if (!over) return;
    const targetIndex = parseInt(over.id as string, 10);
    if (isNaN(targetIndex)) return;
    // Set target assignment — other slots are untouched (allows item reuse)
    setAssignments((prev) => ({ ...prev, [targetIndex]: realItem }));
  }

  function clearAssignment(targetIndex: number) {
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[targetIndex];
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
          {/* Left: draggable chips — always all items, used ones are dimmed */}
          <div className="flex flex-col gap-2">
            <p className="label-caps text-ink-faint mb-1">Items</p>
            {question.items.map((item) => (
              <DraggableChip
                key={item}
                id={`${SRC_PREFIX}${item}`}
                label={item}
                disabled={confirmed}
                used={placedItems.has(item)}
              />
            ))}
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
                  onClear={() => clearAssignment(i)}
                />
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeId && (
            <div className="px-4 py-2.5 rounded-xl border-2 border-brand bg-[rgba(0,120,212,0.08)] text-brand text-[13px] font-semibold shadow-lg">
              {activeId.startsWith(SRC_PREFIX) ? activeId.slice(SRC_PREFIX.length) : activeId}
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
