export default function SkeletonCard({ lines = 3 }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="skeleton h-4 w-1/3 rounded-lg" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-3 rounded-lg" style={{ width: `${70 + Math.random() * 25}%` }} />
      ))}
      <div className="skeleton h-8 w-24 rounded-xl mt-2" />
    </div>
  );
}