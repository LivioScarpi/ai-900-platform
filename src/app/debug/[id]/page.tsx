"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getAllQuestions, getCertQuestions } from "@/lib/questions";
import { QuestionCard } from "@/components/QuestionCard";

export default function DebugQuestionPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={null}>
      <DebugQuestion id={params.id} />
    </Suspense>
  );
}

function DebugQuestion({ id: paramId }: { id: string }) {
  const params = { id: paramId };
  const { id } = params;
  const certId = useSearchParams().get("cert");
  const questions = certId ? getCertQuestions(certId) : getAllQuestions();
  const question = questions.find((q) => q.id === Number(id));
  const [key, setKey] = useState(0);

  if (!question) {
    return (
      <div className="px-8 py-8 max-w-2xl mx-auto w-full">
        <p className="font-mono text-sm text-status-red">
          Question #{id} not found{certId ? ` in ${certId}` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-status-orange-bg text-status-orange border border-amber-200 uppercase tracking-widest">
          Debug
        </span>
        <p className="font-mono text-sm text-ink-faint">Question #{id}</p>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="ml-auto font-mono text-[11px] px-3 py-1 rounded-lg border border-cream-200 text-ink-faint hover:text-ink hover:border-brand transition-colors"
        >
          Reset
        </button>
      </div>
      <div className="card p-6">
        <QuestionCard key={key} question={question} onAnswer={() => {}} />
      </div>
    </div>
  );
}
