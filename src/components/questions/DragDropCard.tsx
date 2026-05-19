"use client";

import { useState } from "react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors,
  useDraggable, useDroppable,
} from "@dnd-kit/core";
import { DragDropQuestion } from "@/types/question";
import { CardShell } from "./CardShell";
import { useAnswerCard } from "@/hooks/useAnswerCard";

interface Props {
  question: DragDropQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
  hideExplanation?: boolean;
  examMode?: boolean;
  initialAnswer?: string[];
}

const SRC_PREFIX = "src__";

function DraggableChip({ id, label, disabled, used }: { id: string; label: string; disabled: boolean; used?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled });
  return (
    <div
      ref={setNodeRef} {...listeners} {...attributes}
      style={{ touchAction: "none" }}
      className={`px-3.5 py-2.5 rounded-lg border text-[13px] font-medium select-none transition-all flex items-center gap-2
        ${disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
        ${isDragging ? "opacity-25" : ""}
        ${used && !disabled ? "opacity-40 border-cream-200 bg-white text-ink-faint" : "border-cream-200 bg-white text-ink hover:border-brand/50 hover:bg-[rgba(0,102,204,0.02)]"}`}
    >
      <span>{label}</span>
      {used && !disabled && <span className="font-mono text-[9px] text-ink-faint">used</span>}
    </div>
  );
}

function DropZone({ id, targetText, assignedItem, confirmed, isCorrect, onClear }: {
  id: string; targetText: string; assignedItem: string | null;
  confirmed: boolean; isCorrect: boolean | null; onClear: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  let zoneClass = "min-h-[46px] rounded-lg border border-dashed flex items-center px-3 transition-colors duration-150";
  if (!confirmed) {
    zoneClass += isOver ? " border-brand bg-[rgba(0,102,204,0.04)]" : " border-cream-200 bg-white hover:border-brand/40";
  } else {
    zoneClass += isCorrect ? " border-status-green/50 bg-status-green-bg" : " border-status-red/50 bg-status-red-bg";
  }
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13.5px] font-semibold text-ink leading-snug">{targetText}</span>
      <div ref={setNodeRef} className={zoneClass}>
        {assignedItem ? (
          <div className="flex items-center justify-between w-full">
            <span className={`text-[13px] font-medium ${confirmed ? (isCorrect ? "text-status-green" : "text-status-red") : "text-brand"}`}>
              {assignedItem}
            </span>
            {!confirmed && (
              <button onClick={onClear} className="ml-2 text-ink-faint hover:text-ink text-lg leading-none transition-colors" aria-label="Clear">×</button>
            )}
          </div>
        ) : (
          <span className="font-mono text-[10px] text-ink-faint">Drop here</span>
        )}
      </div>
    </div>
  );
}

export function DragDropCard({ question, onAnswer, hideExplanation, examMode, initialAnswer }: Props) {
  const hasInitial = !!(initialAnswer?.length && initialAnswer.some(Boolean));
  const [assignments, setAssignments] = useState<Record<number, string>>(() => {
    if (!initialAnswer?.length) return {};
    return Object.fromEntries(initialAnswer.map((item, i) => [i, item]).filter(([, item]) => item));
  });
  const { confirmed, confirm } = useAnswerCard({ examMode, hasInitial, onAnswer });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const placedItems = new Set(Object.values(assignments));

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const draggedId = active.id as string;
    const realItem = draggedId.startsWith(SRC_PREFIX) ? draggedId.slice(SRC_PREFIX.length) : draggedId;
    const targetIndex = parseInt(over.id as string, 10);
    if (isNaN(targetIndex)) return;
    setAssignments((prev) => {
      const next = { ...prev, [targetIndex]: realItem };
      if (examMode) {
        const isCorrect = question.targets.every((t, i) => next[i] === t.correctItem);
        onAnswer(isCorrect, question.targets.map((_, i) => next[i] ?? ""));
      }
      return next;
    });
  }

  function clearAssignment(targetIndex: number) {
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[targetIndex];
      if (examMode) {
        const isCorrect = question.targets.every((t, i) => next[i] === t.correctItem);
        onAnswer(isCorrect, question.targets.map((_, i) => next[i] ?? ""));
      }
      return next;
    });
  }

  const allAssigned = Object.keys(assignments).length >= question.targets.length;
  const isCorrect = question.targets.every((t, i) => assignments[i] === t.correctItem);

  return (
    <CardShell
      topic={question.topic}
      badge={{ label: "Drag & Drop", className: "bg-pink-50 text-pink-700 border-pink-100" }}
      contextImages={question.contextImages}
      text={question.text}
      confirmed={confirmed}
      examMode={examMode}
      canConfirm={allAssigned}
      onConfirm={() => confirm(isCorrect, question.targets.map((_, i) => assignments[i] ?? ""))}
      hideExplanation={hideExplanation}
      explanation={question.explanation}
      reference={question.reference}
      confirmLabel="Check Answers"
    >
      <DndContext
        sensors={sensors}
        onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-1">Items</p>
            {question.items.map((item) => (
              <DraggableChip key={item} id={`${SRC_PREFIX}${item}`} label={item} disabled={confirmed} used={placedItems.has(item)} />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.12em] mb-1">Targets</p>
            {question.targets.map((target, i) => (
              <DropZone
                key={i} id={String(i)} targetText={target.text}
                assignedItem={assignments[i] ?? null}
                confirmed={confirmed}
                isCorrect={confirmed ? assignments[i] === target.correctItem : null}
                onClear={() => clearAssignment(i)}
              />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeId && (
            <div className="px-3.5 py-2.5 rounded-lg border border-brand bg-white text-brand text-[13px] font-medium shadow-md">
              {activeId.startsWith(SRC_PREFIX) ? activeId.slice(SRC_PREFIX.length) : activeId}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {confirmed && (
        <div className="flex flex-col gap-1">
          {question.targets.map((t, i) =>
            assignments[i] !== t.correctItem ? (
              <p key={i} className="font-mono text-[11px] text-status-green">
                {t.text} → <strong>{t.correctItem}</strong>
              </p>
            ) : null
          )}
        </div>
      )}
    </CardShell>
  );
}
