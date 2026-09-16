export default function ProgressBar({ value = 0, label = true, size = 'md' }) {
  const h = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5';
  const color = value >= 100 ? 'bg-green-500' : value >= 50 ? 'bg-blue-500' : 'bg-yellow-400';
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span><span>{value}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${h}`}>
        <div className={`${color} ${h} rounded-full transition-all duration-500`} style={{ width: `${Math.min(value, 100)}%` }}></div>
      </div>
    </div>
  );
}
