const styles = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-orange-100 text-orange-700',
  todo: 'bg-gray-100 text-gray-500',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}
