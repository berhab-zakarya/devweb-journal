'use client';

export function ReviewScoresGrid({
  originality,
  methodology,
  clarity,
  overall,
}: Readonly<{
  originality?: number | null;
  methodology?: number | null;
  clarity?: number | null;
  overall?: number | null;
}>) {
  const rows = [
    { label: 'Originality', value: originality },
    { label: 'Methodology', value: methodology },
    { label: 'Clarity', value: clarity },
    { label: 'Overall', value: overall },
  ];
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
      {rows.map(({ label, value }) => (
        <div key={label} className="rounded border border-subtle bg-muted/30 px-3 py-2">
          <dt className="text-xs text-muted uppercase tracking-wide">{label}</dt>
          <dd className="text-lg font-semibold text-primary">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
