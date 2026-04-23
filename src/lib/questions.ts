import { Question } from "@/types/question";
import questionsJson from "../../data/questions.json";

export function getAllQuestions(): Question[] {
  return questionsJson as Question[];
}

export function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function pickProportional(questions: Question[], total: number): Question[] {
  const byTopic = questions.reduce<Record<string, Question[]>>((acc, q) => {
    (acc[q.topic] ??= []).push(q);
    return acc;
  }, {});

  const topics = Object.keys(byTopic);
  const result: Question[] = [];
  const perTopic = Math.floor(total / topics.length);
  const remainder = total % topics.length;

  topics.forEach((topic, i) => {
    const count = perTopic + (i < remainder ? 1 : 0);
    const pool = byTopic[topic];
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    result.push(...picked);
  });

  return result.sort(() => Math.random() - 0.5);
}
