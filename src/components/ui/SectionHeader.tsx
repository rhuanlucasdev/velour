interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional right-side slot for actions/buttons */
  actions?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  actions,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-white/90 leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[13px] text-white/35 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
