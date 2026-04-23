"use client";

import { useState } from "react";
import { YesNoQuestion } from "@/types/question";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { ContextImage } from "@/components/ContextImage";
import { TopicBadge } from "@/components/TopicBadge";

interface Props {
  question: YesNoQuestion;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
}

export function YesNoCard({ question, onAnswer }: Props) {
  const [answers, setAnswers] = useState<(string | null)[]>(
    question.statements.map(() => null)
  );
  const [confirmed, setConfirmed] = useState(false);

  function setAnswer(index: number, value: "Yes" | "No") {
    if (confirmed) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function confirm() {
    if (answers.some((a) => a === null)) return;
    setConfirmed(true);
    const isCorrect = question.statements.every(
      (s, i) => answers[i] === s.correct
    );
    onAnswer(isCorrect, answers as string[]);
  }

  function btnClass(index: number, value: "Yes" | "No") {
    const chosen = answers[index] === value;
    if (!confirmed) {
      return chosen
        ? "bg-brand text-white shadow-[0_0_0_3px_rgba(0,120,212,0.15)]"
        : "bg-cream-100 text-ink-muted border border-cream-200 hover:border-brand/40 hover:bg-[rgba(0,120,212,0.04)]";
    }
    const correct = question.statements[index].correct === value;
    if (correct) return "bg-status-green text-white";
    if (chosen) return "bg-status-red text-white";
    return "bg-cream-100 text-ink-faint opacity-40";
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge topic={question.topic} />
        <span className="font-mono text-[10px] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0369a1] uppercase border border-[#bae6fd]">
          Yes / No
        </span>
      </div>

      {(question.contextImages ?? []).map((url) => (
        <ContextImage key={url} src={url} />
      ))}

      {question.text && (
        <p className="text-[15px] font-semibold text-ink leading-relaxed">
          {question.text}
        </p>
      )}

      <div className="rounded-xl border border-cream-200 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 border-b border-cream-200">
            <tr>
              <th className="text-left px-4 py-2.5 label-caps">
                Statement
              </th>
              <th className="px-4 py-2.5 label-caps w-24 text-center">
                Yes
              </th>
              <th className="px-4 py-2.5 label-caps w-24 text-center">
                No
              </th>
            </tr>
          </thead>
          <tbody>
            {question.statements.map((stmt, i) => (
              <tr
                key={i}
                className="border-t border-cream-200"
              >
                <td className="px-4 py-3.5 text-[13.5px] text-ink leading-snug">
                  {stmt.text}
                </td>
                {(["Yes", "No"] as const).map((val) => (
                  <td key={val} className="text-center px-4 py-3">
                    <button
                      onClick={() => setAnswer(i, val)}
                      className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all ${btnClass(i, val)}`}
                    >
                      {val}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!confirmed && (
        <button
          onClick={confirm}
          disabled={answers.some((a) => a === null)}
          className="mt-1 w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-40 hover:bg-brand-dark transition-colors tracking-wide"
        >
          Confirm Answer
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
