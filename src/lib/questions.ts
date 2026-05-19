import { Question } from "@/types/question";
import legacyData from "../../data/questions.json";
import ai900Questions from "../../data/certifications/ai900/questions.json";

type CertData = { video: Question[]; microsoft: Question[] };

const CERT_DATA: Record<string, CertData> = {
  ai900: ai900Questions as CertData,
};

// ── Legacy (backwards compat) ─────────────────────────────────────────────
const _legacy = legacyData as CertData;

export function getAllQuestions(): Question[] {
  return [..._legacy.video, ..._legacy.microsoft];
}

export function getVideoQuestions(): Question[] {
  return _legacy.video;
}

export function getMicrosoftQuestions(): Question[] {
  return _legacy.microsoft;
}

// ── Cert-aware ────────────────────────────────────────────────────────────
export function getCertQuestions(certId: string): Question[] {
  const data = CERT_DATA[certId];
  if (!data) return [];
  return [...data.video, ...data.microsoft];
}

export function getCertMicrosoftQuestions(certId: string): Question[] {
  return CERT_DATA[certId]?.microsoft ?? [];
}

// ── Shared utilities ──────────────────────────────────────────────────────
export function pickRandom<T>(arr: T[], count: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

const STOPWORDS = new Set([
  "the","a","an","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","must","can",
  "to","of","in","for","on","with","at","by","from","up","about","into","each",
  "and","but","or","nor","so","yet","both","either","whether","that","which",
  "who","what","if","not","no","it","its","you","your","he","she","they","their",
  "this","these","those","select","following","statement","statements","appropriate",
  "complete","sentence","answer","area","match","types","scenarios","use",
]);

function fingerprint(text: string): Set<string> {
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let shared = 0;
  a.forEach((w) => { if (b.has(w)) shared++; });
  return shared / (a.size + b.size - shared);
}

function pickDiverse(pool: Question[], count: number): Question[] {
  if (pool.length <= count) return [...pool].sort(() => Math.random() - 0.5);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked: Question[] = [];
  const pickedFps: Set<string>[] = [];
  for (const candidate of shuffled) {
    if (picked.length >= count) break;
    const fp = fingerprint(candidate.text);
    if (!pickedFps.some((existing) => jaccard(fp, existing) > 0.5)) {
      picked.push(candidate);
      pickedFps.push(fp);
    }
  }
  if (picked.length < count) {
    for (const candidate of shuffled) {
      if (picked.length >= count) break;
      if (!picked.includes(candidate)) picked.push(candidate);
    }
  }
  return picked;
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
    result.push(...pickDiverse(byTopic[topic], perTopic + (i < remainder ? 1 : 0)));
  });
  return result.sort(() => Math.random() - 0.5);
}
