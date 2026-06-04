export default function EmptyState({ icon = '◈', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="text-6xl text-muted animate-float">{icon}</div>
      <div className="text-center space-y-2">
        <h3 className="font-orbitron text-lg text-secondary">{title}</h3>
        <p className="text-muted text-sm max-w-xs">{message}</p>
      </div>
      {action}
    </div>
  );
}