export default function OrbitLoader({ size = 40, label }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-plasma animate-orbit-spin"
          style={{ width: size, height: size }}
        />
        <div
          className="absolute rounded-full border border-plasma/20"
          style={{ width: size, height: size, top: 0, left: 0 }}
        />
        <div
          className="absolute rounded-full bg-plasma animate-pulse-glow"
          style={{ width: 8, height: 8, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
        />
      </div>
      {label && <p className="text-secondary text-sm font-mono">{label}</p>}
    </div>
  );
}