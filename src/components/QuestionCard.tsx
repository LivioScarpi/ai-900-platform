import { Question } from "@/types/question";
import { McqCard } from "./questions/McqCard";
import { MultiCard } from "./questions/MultiCard";
import { SentenceCompletionCard } from "./questions/SentenceCompletionCard";
import { YesNoCard } from "./questions/YesNoCard";
import { DropdownCard } from "./questions/DropdownCard";
import { DragDropCard } from "./questions/DragDropCard";

interface Props {
  question: Question;
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void;
}

export function QuestionCard({ question, onAnswer }: Props) {
  switch (question.type) {
    case "mcq":
      return <McqCard question={question} onAnswer={onAnswer} />;
    case "multi":
      return <MultiCard question={question} onAnswer={onAnswer} />;
    case "sentence_completion":
      return (
        <SentenceCompletionCard question={question} onAnswer={onAnswer} />
      );
    case "yesno":
      return <YesNoCard question={question} onAnswer={onAnswer} />;
    case "dropdown":
      return <DropdownCard question={question} onAnswer={onAnswer} />;
    case "dragdrop":
      return <DragDropCard question={question} onAnswer={onAnswer} />;
  }
}
