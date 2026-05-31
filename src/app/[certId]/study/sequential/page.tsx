"use client";

import { getCertVideoQuestions } from "@/lib/questions";
import { StudyPage } from "@/components/StudyPage";

export default function SequentialPage({ params }: { params: { certId: string } }) {
  const { certId } = params;
  const questions = getCertVideoQuestions(certId);
  return <StudyPage questions={questions} certId={certId} title="Sequential Review" mode="sequential" accentColor="#0066CC" />;
}
