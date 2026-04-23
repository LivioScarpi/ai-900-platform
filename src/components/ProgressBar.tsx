interface Props {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="label-caps">{label}</span>}
      <div className="w-full bg-cream-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-brand transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
