import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`wordmark inline-block ${className}`}>
      <span className="text-2xl text-white">PARVIOR</span>
    </Link>
  );
}
