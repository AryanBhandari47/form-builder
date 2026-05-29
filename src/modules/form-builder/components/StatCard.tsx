interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="flex flex-col gap-0.5 p-4 bg-surface border border-border rounded-[var(--radius-md)]">
      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <span className="text-2xl font-bold text-text-primary">{value}</span>
      {sub && <span className="text-[10px] text-text-muted">{sub}</span>}
    </div>
  );
}
