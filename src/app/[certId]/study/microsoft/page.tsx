"use client";

import { useState } from "react";
import { getCertMicrosoftQuestions } from "@/lib/questions";
import { StudyPage } from "@/components/StudyPage";
import { Question } from "@/types/question";

export default function MicrosoftPage({ params }: { params: { certId: string } }) {
  const { certId } = params;
  const [questions] = useState<Question[]>(() =>
    [...getCertMicrosoftQuestions(certId)].sort(() => Math.random() - 0.5)
  );
  return <StudyPage questions={questions} certId={certId} title="Microsoft Simulation" mode="microsoft_simulation" accentColor="#0284C7" />;
}
