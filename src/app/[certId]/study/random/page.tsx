"use client";

import { useState } from "react";
import { getCertQuestions } from "@/lib/questions";
import { StudyPage } from "@/components/StudyPage";
import { Question } from "@/types/question";

export default function RandomPage({ params }: { params: { certId: string } }) {
  const { certId } = params;
  const [questions] = useState<Question[]>(() =>
    [...getCertQuestions(certId)].sort(() => Math.random() - 0.5)
  );
  return <StudyPage questions={questions} certId={certId} title="Random Shuffle" mode="random_sequential" accentColor="#7C3AED" />;
}
