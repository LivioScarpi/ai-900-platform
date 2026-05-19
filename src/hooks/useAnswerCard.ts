import { useState } from "react";

export function useAnswerCard({
  examMode,
  hasInitial,
  onAnswer,
}: {
  examMode?: boolean;
  hasInitial: boolean;
  onAnswer: (isCorrect: boolean, selected: string[]) => void;
}) {
  const [confirmed, setConfirmed] = useState(!examMode && hasInitial);

  function confirm(isCorrect: boolean, selected: string[]) {
    setConfirmed(true);
    onAnswer(isCorrect, selected);
  }

  return { confirmed, confirm };
}
