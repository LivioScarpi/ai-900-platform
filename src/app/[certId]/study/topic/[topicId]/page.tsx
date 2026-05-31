"use client";

import { notFound } from "next/navigation";
import { getCertVideoQuestions, pickRandom } from "@/lib/questions";
import { TOPICS } from "@/lib/topics";
import { StudyPage } from "@/components/StudyPage";

export default function TopicStudyPage({
  params,
}: {
  params: { certId: string; topicId: string };
}) {
  const { certId, topicId } = params;

  const topicInfo = TOPICS.find((t) => t.key === topicId);
  if (!topicInfo) notFound();

  const all = getCertVideoQuestions(certId);
  const filtered = all.filter((q) => q.topic === topicId);
  if (filtered.length === 0) notFound();

  const questions = pickRandom(filtered, filtered.length);

  return (
    <StudyPage
      questions={questions}
      certId={certId}
      title={`Topic Focus — ${topicInfo.displayName}`}
      mode={`topic_${topicId}`}
      accentColor={topicInfo.color}
    />
  );
}
