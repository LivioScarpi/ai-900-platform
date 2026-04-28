import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// ── Attempt ──────────────────────────────────────────────────────────────────

export async function saveAttempt(params: {
  userId: string;
  questionId: number;
  mode: string;
  selectedAnswers: string[];
  isCorrect: boolean;
  timeTakenMs?: number;
}) {
  await supabase.from("attempts").insert({
    user_id: params.userId,
    question_id: params.questionId,
    mode: params.mode,
    selected_answers: params.selectedAnswers,
    is_correct: params.isCorrect,
    time_taken_ms: params.timeTakenMs ?? null,
  });
}

// ── Exam Session ──────────────────────────────────────────────────────────────

export async function saveExamSession(params: {
  userId: string;
  mode: string;
  score: number;
  total: number;
  topicScores: Record<string, { correct: number; total: number }>;
  durationMs: number;
}) {
  await supabase.from("exam_sessions").insert({
    user_id: params.userId,
    mode: params.mode,
    score: params.score,
    total: params.total,
    topic_scores: params.topicScores,
    duration_ms: params.durationMs,
  });
}

// ── Flashcard Rating ─────────────────────────────────────────────────────────

export async function saveFlashcardRating(params: {
  userId: string;
  questionId: number;
  rating: "got_it" | "missed_it";
}) {
  await supabase.from("flashcard_ratings").insert({
    user_id: params.userId,
    question_id: params.questionId,
    rating: params.rating,
  });
}

// ── Dashboard queries ─────────────────────────────────────────────────────────

export async function getAttemptStats(userId: string) {
  const { data, error } = await supabase
    .from("attempts")
    .select("is_correct")
    .eq("user_id", userId);
  if (error || !data) return { total: 0, correct: 0 };
  const total = data.length;
  const correct = data.filter((r) => r.is_correct).length;
  return { total, correct };
}

export async function getExamHistory(userId: string) {
  const { data } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data ?? [];
}

export async function getQuestionAttempts(userId: string): Promise<{ question_id: number; is_correct: boolean }[]> {
  const { data } = await supabase
    .from("attempts")
    .select("question_id, is_correct")
    .eq("user_id", userId);
  return data ?? [];
}

// ── Exam Draft ────────────────────────────────────────────────────────────────

export async function saveExamDraft(userId: string, data: object) {
  const { error } = await supabase.from("exam_drafts").upsert({ user_id: userId, data, updated_at: new Date().toISOString() });
  if (error) console.error("[exam_drafts] save error:", error.message);
}

export async function loadExamDraft(userId: string) {
  const { data } = await supabase
    .from("exam_drafts")
    .select("data, updated_at")
    .eq("user_id", userId)
    .single();
  return data ?? null;
}

export async function deleteExamDraft(userId: string) {
  await supabase.from("exam_drafts").delete().eq("user_id", userId);
}
