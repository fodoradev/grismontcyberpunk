// The circular flow mark: an open ring with one point that has made it round. Decorative supporting motif.
export default function FlowMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="108 18" transform="rotate(-60 24 24)" />
      <circle cx="36" cy="8" r="3.5" fill="#0E7C6B" />
    </svg>
  );
}
