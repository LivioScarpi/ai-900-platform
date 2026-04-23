/**
 * scripts/preprocess.ts
 *
 * One-time preprocessing script that:
 * 1. Parses data/questions.md
 * 2. Fetches images from GitHub raw URLs
 * 3. Sends images to Google Gemini 1.5 Flash for classification & extraction
 * 4. Assembles typed Question objects
 * 5. Writes data/questions.json
 *
 * Usage:
 *   GEMINI_API_KEY=your_key npx ts-node -P scripts/tsconfig.json scripts/preprocess.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Types (inlined to avoid Next.js path alias issues in ts-node) ─────────────

type Topic =
  | "responsible_ai"
  | "ml_fundamentals"
  | "computer_vision"
  | "nlp"
  | "conversational_ai"
  | "azure_cognitive"
  | "azure_ml"
  | "unknown";

interface BaseQuestion {
  id: number;
  topic: Topic;
  explanation: string;
  reference?: string;
  contextImages: string[];
}
interface McqQuestion extends BaseQuestion {
  type: "mcq";
  text: string;
  options: { letter: string; text: string }[];
  correctAnswer: string;
}
interface MultiQuestion extends BaseQuestion {
  type: "multi";
  text: string;
  options: { letter: string; text: string }[];
  correctAnswers: string[];
}
interface SentenceCompletionQuestion extends BaseQuestion {
  type: "sentence_completion";
  sentence: string;
  options: string[];
  correctAnswer: string;
}
interface YesNoQuestion extends BaseQuestion {
  type: "yesno";
  text: string;
  statements: { text: string; correct: "Yes" | "No" }[];
}
interface DropdownQuestion extends BaseQuestion {
  type: "dropdown";
  text: string;
  statements: { text: string; options: string[]; correctAnswer: string }[];
}
interface DragDropQuestion extends BaseQuestion {
  type: "dragdrop";
  text: string;
  items: string[];
  targets: { text: string; correctItem: string }[];
}
type Question =
  | McqQuestion
  | MultiQuestion
  | SentenceCompletionQuestion
  | YesNoQuestion
  | DropdownQuestion
  | DragDropQuestion;

// ── Topic auto-tagging ────────────────────────────────────────────────────────

const TOPIC_RULES: { key: Topic; keywords: string[] }[] = [
  {
    key: "responsible_ai",
    keywords: [
      "responsible",
      "fairness",
      "transparency",
      "accountability",
      "inclusiveness",
      "reliability",
      "privacy",
    ],
  },
  {
    key: "ml_fundamentals",
    keywords: [
      "machine learning",
      "training",
      "model",
      "regression",
      "classification",
      "clustering",
      "features",
      "labels",
    ],
  },
  {
    key: "computer_vision",
    keywords: [
      "image",
      "vision",
      "face",
      "object detection",
      "ocr",
      "spatial analysis",
    ],
  },
  {
    key: "nlp",
    keywords: [
      "language",
      "nlp",
      "sentiment",
      "key phrase",
      "text analytics",
      "translation",
      "speech",
    ],
  },
  {
    key: "conversational_ai",
    keywords: ["bot", "qna maker", "luis", "conversational", "intent"],
  },
  {
    key: "azure_cognitive",
    keywords: [
      "cognitive services",
      "azure ai",
      "form recognizer",
      "personalizer",
    ],
  },
  {
    key: "azure_ml",
    keywords: [
      "azure machine learning",
      "automated ml",
      "pipeline",
      "compute",
    ],
  },
];

function assignTopic(text: string, explanation: string): Topic {
  const combined = (text + " " + explanation).toLowerCase();
  for (const rule of TOPIC_RULES) {
    if (rule.keywords.some((kw) => combined.includes(kw))) return rule.key;
  }
  return "unknown";
}

// ── Constants ─────────────────────────────────────────────────────────────────

const GITHUB_BASE =
  "https://raw.githubusercontent.com/anxkhn/azure-ai-900-exam-prep/main/images/";
const IMAGE_RE = /!\[\]\(images\/([^)]+)\)/g;

// ── Fetch image as base64 ─────────────────────────────────────────────────────

function fetchImageBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

// ── Gemini classification ─────────────────────────────────────────────────────

const CLASSIFY_PROMPT = `You are processing images from a Microsoft AI-900 exam question bank.
Classify this image into exactly ONE of these roles:

1. CONTEXT_IMAGE — A visual that is part of the question content and must be shown to the user
   (e.g. a confusion matrix, a diagram, a chart, a screenshot of a UI, a table of data).
   The user needs to see this image to understand and answer the question.

2. QUESTION_SHELL — The image contains the question/answer UI rendered as an image
   (e.g. a "Hot Area" box with dropdown selects, a Yes/No table, a drag-drop matching layout).
   Extract all text content so it can be rendered as interactive UI components.

3. EXPLANATION_IMAGE — The image shows the completed/correct answer or explanation
   (e.g. filled-in version of the Hot Area, annotated diagram with answers).
   Extract all text content so it can be shown as a plain text explanation.

For QUESTION_SHELL, extract the interactive structure and return one of these subtypes:

subtype "sentence_completion" — one dropdown completing a sentence:
{
  "role": "QUESTION_SHELL",
  "subtype": "sentence_completion",
  "sentence": "...sentence with [BLANK]...",
  "options": ["option1", "option2", "option3"],
  "correctAnswer": "option1"
}

subtype "multi_statement_yesno" — table of statements each Yes or No:
{
  "role": "QUESTION_SHELL",
  "subtype": "multi_statement_yesno",
  "statements": [
    { "text": "Statement text", "correct": "Yes" },
    { "text": "Statement text", "correct": "No" }
  ]
}

subtype "multi_statement_dropdown" — table of statements each with a dropdown:
{
  "role": "QUESTION_SHELL",
  "subtype": "multi_statement_dropdown",
  "statements": [
    { "text": "...sentence with [BLANK]...", "options": ["a","b","c"], "correctAnswer": "a" }
  ]
}

subtype "dragdrop" — match items from left column to targets on right column:
{
  "role": "QUESTION_SHELL",
  "subtype": "dragdrop",
  "items": ["Item1", "Item2", "Item3"],
  "targets": [
    { "text": "Target description", "correctItem": "Item1" }
  ]
}

For CONTEXT_IMAGE return:
{ "role": "CONTEXT_IMAGE" }

For EXPLANATION_IMAGE return:
{ "role": "EXPLANATION_IMAGE", "text": "extracted text with answers..." }

Respond with ONLY valid JSON, no markdown fences.`;

interface ClassifyResult {
  role: "CONTEXT_IMAGE" | "QUESTION_SHELL" | "EXPLANATION_IMAGE";
  subtype?: string;
  sentence?: string;
  options?: string[];
  correctAnswer?: string;
  statements?: {
    text: string;
    correct?: "Yes" | "No";
    options?: string[];
    correctAnswer?: string;
  }[];
  items?: string[];
  targets?: { text: string; correctItem: string }[];
  text?: string;
}

async function classifyImage(
  genAI: GoogleGenerativeAI,
  filename: string
): Promise<ClassifyResult> {
  const url = GITHUB_BASE + filename;
  console.log(`    Fetching ${filename}...`);
  const base64 = await fetchImageBase64(url);

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const MAX_RETRIES = 5;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent([
        CLASSIFY_PROMPT,
        { inlineData: { mimeType: "image/jpeg", data: base64 } },
      ]);
      const raw = result.response.text().trim();
      // Strip markdown fences if the model included them
      const jsonStr = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
      return JSON.parse(jsonStr) as ClassifyResult;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429") || msg.includes("Too Many Requests")) {
        // Try to parse the suggested retry delay from the error message
        const delayMatch = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
        const retrySec = delayMatch ? Math.ceil(parseFloat(delayMatch[1])) : 60 * attempt;
        console.warn(`    Rate limited (attempt ${attempt}/${MAX_RETRIES}). Waiting ${retrySec}s...`);
        await sleep(retrySec * 1000);
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Failed to classify ${filename} after ${MAX_RETRIES} attempts`);
}

// ── Markdown parser ───────────────────────────────────────────────────────────

interface RawQuestion {
  id: number;
  rawText: string;
  rawOptions: string;
  rawAnswer: string;
  rawExplanation: string;
  rawReference: string;
}

function parseMarkdown(md: string): RawQuestion[] {
  const blocks = md.split(/(?=####\s+\*\*QUESTION:\s*\d+\*\*)/);
  const results: RawQuestion[] = [];

  for (const block of blocks) {
    const numMatch = block.match(/####\s+\*\*QUESTION:\s*(\d+)\*\*/);
    if (!numMatch) continue;
    const id = parseInt(numMatch[1], 10);

    // Remove the question header line
    const body = block.replace(/####\s+\*\*QUESTION:\s*\d+\*\*\s*\n/, "");

    // Split on Answer, Explanation, Reference sections
    const answerSplit = body.split(/\*\*Answer\(s\):\*\*/);
    const beforeAnswer = answerSplit[0] ?? "";
    const afterAnswer = answerSplit[1] ?? "";

    const explSplit = afterAnswer.split(/#{4,5}\s+\*\*Explanation:\*\*/);
    const rawAnswer = (explSplit[0] ?? "").trim();
    const afterExpl = explSplit[1] ?? "";

    const refSplit = afterExpl.split(/#{4,5}\s+\*\*Reference:\*\*/);
    const rawExplanation = (refSplit[0] ?? "").trim();
    const rawReference = (refSplit[1] ?? "").trim();

    // Separate question text from options
    // Options lines look like: A. text or A)  text
    const optionStartRe = /^[A-F][.)]\s+/m;
    const optMatch = beforeAnswer.search(optionStartRe);
    let rawText: string;
    let rawOptions: string;
    if (optMatch !== -1) {
      rawText = beforeAnswer.slice(0, optMatch).trim();
      rawOptions = beforeAnswer.slice(optMatch).trim();
    } else {
      rawText = beforeAnswer.trim();
      rawOptions = "";
    }

    results.push({
      id,
      rawText,
      rawOptions,
      rawAnswer,
      rawExplanation,
      rawReference,
    });
  }

  return results;
}

// ── Extract image filenames from raw text ─────────────────────────────────────

function extractImageFilenames(text: string): string[] {
  const filenames: string[] = [];
  let match: RegExpExecArray | null;
  const re = /!\[\]\(images\/([^)]+)\)/g;
  while ((match = re.exec(text)) !== null) {
    filenames.push(match[1]);
  }
  return filenames;
}

// ── Strip image markdown from text ───────────────────────────────────────────

function stripImages(text: string): string {
  return text.replace(IMAGE_RE, "").replace(/\n{3,}/g, "\n\n").trim();
}

// ── Parse lettered options ────────────────────────────────────────────────────

function parseOptions(
  raw: string
): { letter: string; text: string }[] {
  const lines = raw.split("\n").filter((l) => l.trim());
  const options: { letter: string; text: string }[] = [];
  let current: { letter: string; text: string } | null = null;

  for (const line of lines) {
    const m = line.match(/^([A-F])[.)]\s+(.*)/);
    if (m) {
      if (current) options.push(current);
      current = { letter: m[1], text: m[2].trim() };
    } else if (current) {
      current.text += " " + line.trim();
    }
  }
  if (current) options.push(current);
  return options;
}

// ── Sleep helper ──────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const mdPath = path.join(__dirname, "../data/questions.md");
  const outPath = path.join(__dirname, "../data/questions.json");

  console.log("Reading questions.md...");
  const md = fs.readFileSync(mdPath, "utf-8");
  const rawQuestions = parseMarkdown(md);
  console.log(`Parsed ${rawQuestions.length} raw questions.`);

  const questions: Question[] = [];
  let skipped = 0;

  for (const raw of rawQuestions) {
    // Skip questions that contain images — we'll process them tomorrow
    const allText = raw.rawText + "\n" + raw.rawOptions + "\n" + raw.rawExplanation;
    const imageFilenames = extractImageFilenames(allText);
    if (imageFilenames.length > 0) {
      console.log(`Skipping Q${raw.id} (has ${imageFilenames.length} image(s))`);
      skipped++;
      continue;
    }

    console.log(`Processing Q${raw.id}...`);

    const explanation = stripImages(raw.rawExplanation);
    const reference = raw.rawReference.replace(/\s+/g, " ").trim() || undefined;

    const baseFields: BaseQuestion = {
      id: raw.id,
      topic: assignTopic(raw.rawText, explanation),
      explanation,
      reference,
      contextImages: [],
    };

    // ── Standard MCQ / Multi ──────────────────────────────────────────────────
    const options = parseOptions(raw.rawOptions);
    const text = stripImages(raw.rawText);
    const answers = raw.rawAnswer
      .split(/[,\s]+/)
      .map((a) => a.trim().toUpperCase())
      .filter((a) => /^[A-F]$/.test(a));

    if (answers.length > 1) {
      const q: MultiQuestion = {
        ...baseFields,
        type: "multi",
        text,
        options,
        correctAnswers: answers,
      };
      questions.push(q);
    } else {
      const q: McqQuestion = {
        ...baseFields,
        type: "mcq",
        text,
        options,
        correctAnswer: answers[0] ?? "A",
      };
      questions.push(q);
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(questions, null, 2), "utf-8");
  console.log(`\n✅ Done! Wrote ${questions.length} questions to data/questions.json (skipped ${skipped} with images)`);

  const byType = questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.type] = (acc[q.type] ?? 0) + 1;
    return acc;
  }, {});
  console.log("Question types:", byType);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
