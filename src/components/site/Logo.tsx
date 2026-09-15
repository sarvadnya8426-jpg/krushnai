export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/kt.png"
      alt="Krushnai Traders"
      className={`object-contain ${className ?? ""}`}
    />
  );
}
