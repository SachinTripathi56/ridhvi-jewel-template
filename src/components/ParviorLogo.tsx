/**
 * Parvior brand logo — pearl circle mark.
 * Large circle outline + small filled circle at bottom-right.
 * Uses `color` prop for full color control on any background.
 */
export function ParviorLogo({
  color = "currentColor",
  size = 40,
  className = "",
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="Parvior logo"
    >
      {/* Large outer circle */}
      <circle cx="52" cy="52" r="46" stroke={color} strokeWidth="5.5" />
      {/* Small ring */}
      <circle cx="90" cy="88" r="18" stroke={color} strokeWidth="4" />
      {/* Small filled dot */}
      <circle cx="90" cy="88" r="11" fill={color} />
    </svg>
  );
}
