export default function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-800/60 ${className}`}
      {...props}
    />
  );
}
