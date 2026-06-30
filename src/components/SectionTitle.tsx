export function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl">{children}</h2>
      <span className="divider-dot mt-4 block">
        <span className="inline-block w-1.5 h-1.5 rounded-full border border-rose-taupe" />
      </span>
      {subtitle && <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
