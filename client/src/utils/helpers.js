export const getStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  const s = status.toLowerCase();
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'accepted': 'bg-blue-100 text-blue-800',
    'preparing': 'bg-orange-100 text-orange-800',
    'out for delivery': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return colors[s] || 'bg-gray-100 text-gray-800';
};

export const getPaymentStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  const s = status.toLowerCase();
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'successful': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800'
  };
  return colors[s] || 'bg-gray-100 text-gray-800';
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹ 0.00';
  return `₹ ${Number(amount).toFixed(2)}`;
};

export const truncateId = (id) => {
  if (!id) return '#00000000';
  return '#' + id.toString().slice(-8);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(
      'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  } catch {
    return 'N/A';
  }
};
