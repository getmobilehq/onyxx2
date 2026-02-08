import React from 'react';

interface FCIBadgeProps {
  value: number | null | undefined;
}

function getFCILevel(fci: number): { label: string; className: string } {
  const pct = fci * 100;
  if (pct <= 5) return { label: 'Good', className: 'fci-good' };
  if (pct <= 10) return { label: 'Fair', className: 'fci-fair' };
  if (pct <= 30) return { label: 'Poor', className: 'fci-poor' };
  return { label: 'Critical', className: 'fci-critical' };
}

export default function FCIBadge({ value }: FCIBadgeProps) {
  if (value == null) {
    return <span className="badge bg-slate-100 text-slate-500">N/A</span>;
  }

  const fci = Number(value);
  const { label, className } = getFCILevel(fci);

  return (
    <span className={`badge ${className}`}>
      {(fci * 100).toFixed(1)}% &middot; {label}
    </span>
  );
}
