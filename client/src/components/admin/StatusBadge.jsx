const STATUS_COLORS = {
  order: {
    'Pending':          'bg-amber-100 text-amber-600 border-amber-200',
    'Accepted':         'bg-blue-100 text-blue-600 border-blue-200',
    'Preparing':        'bg-orange-100 text-orange-600 border-orange-200',
    'Out for Delivery': 'bg-purple-100 text-purple-600 border-purple-200',
    'Delivered':        'bg-emerald-100 text-emerald-600 border-emerald-200',
    'Rejected':         'bg-red-100 text-red-600 border-red-200',
    'Cancelled':        'bg-stone-100 text-stone-600 border-stone-200'
  },
  payment: {
    'pending':     'bg-amber-100 text-amber-600 border-amber-200',
    'paid':        'bg-emerald-100 text-emerald-600 border-emerald-200',
    'failed':      'bg-red-100 text-red-600 border-red-200'
  }
};

export default function StatusBadge({ status, type = 'order' }) {
  const colorClass = STATUS_COLORS[type][status] || STATUS_COLORS[type][status?.toLowerCase()] || 'bg-stone-100 text-stone-800 border-stone-200';
  
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${colorClass}`}>
      {status || 'Unknown'}
    </span>
  );
}
