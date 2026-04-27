interface Props {
  label: string;
  value: number;
}

export function QualityIndicator({ label, value }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full quality-bar transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
