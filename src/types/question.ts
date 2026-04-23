export type Topic =
  | "responsible_ai"
  | "ml_fundamentals"
  | "computer_vision"
  | "nlp"
  | "conversational_ai"
  | "azure_cognitive"
  | "azure_ml"
  | "unknown";

export interface BaseQuestion {
  id: number;
  topic: Topic;
  explanation: string;
  reference?: string;
  contextImages: string[];
}

export interface McqQuestion extends BaseQuestion {
  type: "mcq";
  text: string;
  options: { letter: string; text: string }[];
  correctAnswer: string;
}

export interface MultiQuestion extends BaseQuestion {
  type: "multi";
  text: string;
  options: { letter: string; text: string }[];
  correctAnswers: string[];
}

export interface SentenceCompletionQuestion extends BaseQuestion {
  type: "sentence_completion";
  sentence: string;
  options: string[];
  correctAnswer: string;
}

export interface YesNoQuestion extends BaseQuestion {
  type: "yesno";
  text: string;
  statements: {
    text: string;
    correct: "Yes" | "No";
  }[];
}

export interface DropdownQuestion extends BaseQuestion {
  type: "dropdown";
  text: string;
  statements: {
    text: string;
    options: string[];
    correctAnswer: string;
  }[];
}

export interface DragDropQuestion extends BaseQuestion {
  type: "dragdrop";
  text: string;
  items: string[];
  targets: {
    text: string;
    correctItem: string;
  }[];
}

export type Question =
  | McqQuestion
  | MultiQuestion
  | SentenceCompletionQuestion
  | YesNoQuestion
  | DropdownQuestion
  | DragDropQuestion;
