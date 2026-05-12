const STATUS_COLORS = {
  order: {
    'Pending':          'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Accepted':         'bg-blue-100 text-blue-800 border-blue-200',
    'Preparing':        'bg-orange-100 text-orange-800 border-orange-200',
    'Out for Delivery': 'bg-purple-100 text-purple-800 border-purple-200',
    'Delivered':        'bg-green-100 text-green-800 border-green-200',
    'Rejected':         'bg-red-100 text-red-800 border-red-200',
    'Cancelled':        'bg-gray-100 text-gray-800 border-gray-200'
  },
  payment: {
    'pending':     'bg-yellow-100 text-yellow-800 border-yellow-200',
    'successful':  'bg-green-100 text-green-800 border-green-200',
    'failed':      'bg-red-100 text-red-800 border-red-200'
  }
};

export default function StatusBadge({ status, type = 'order' }) {
  const colorClass = STATUS_COLORS[type][status] || STATUS_COLORS[type][status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colorClass}`}>
      {status || 'Unknown'}
    </span>
  );
}
