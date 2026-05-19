import { TopicBadge } from "@/components/TopicBadge";
import { ContextImage } from "@/components/ContextImage";
import { ExplanationDrawer } from "@/components/ExplanationDrawer";
import { Topic } from "@/types/question";

interface BadgeProps {
  label: string;
  className: string;
}

interface CardShellProps {
  topic: Topic;
  badge: BadgeProps;
  contextImages?: string[];
  text?: string;
  children: React.ReactNode;
  confirmed: boolean;
  examMode?: boolean;
  canConfirm: boolean;
  onConfirm: () => void;
  hideExplanation?: boolean;
  explanation?: string;
  reference?: string;
  confirmLabel?: string;
}

export function CardShell({
  topic,
  badge,
  contextImages,
  text,
  children,
  confirmed,
  examMode,
  canConfirm,
  onConfirm,
  hideExplanation,
  explanation,
  reference,
  confirmLabel = "Confirm Answer",
}: CardShellProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge topic={topic} />
        <span className={`font-mono text-[9px] font-medium tracking-[0.15em] px-2 py-0.5 rounded-full uppercase border ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {(contextImages ?? []).map((url) => (
        <ContextImage key={url} src={url} />
      ))}

      {text && (
        <p className="text-[15px] font-semibold text-ink leading-relaxed tracking-[-0.01em]">
          {text}
        </p>
      )}

      {children}

      {!confirmed && !examMode && (
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className="w-full py-3 rounded-xl bg-ink text-white font-display font-bold text-[15px] tracking-[-0.01em] hover:bg-ink/85 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {confirmLabel}
        </button>
      )}

      {confirmed && !hideExplanation && (
        <ExplanationDrawer explanation={explanation} reference={reference} />
      )}
    </div>
  );
}
