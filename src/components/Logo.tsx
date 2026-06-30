import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`wordmark inline-block ${className}`}>
      <span className="text-2xl text-accent">R</span>
      <span className="text-2xl text-foreground">idhvi</span>
    </Link>
  );
}
