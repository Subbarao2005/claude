export const getStatusColor = (status) => {
  if (!status) return 'bg-stone-100 text-stone-800';
  const s = status.toLowerCase();
  const colors = {
    'pending': 'bg-amber-100 text-amber-600',
    'accepted': 'bg-blue-100 text-blue-600',
    'preparing': 'bg-orange-100 text-orange-600',
    'out for delivery': 'bg-purple-100 text-purple-600',
    'delivered': 'bg-emerald-100 text-emerald-600',
    'rejected': 'bg-red-100 text-red-600',
    'cancelled': 'bg-red-100 text-red-600'
  };
  return colors[s] || 'bg-stone-100 text-stone-800';
};

export const getPaymentStatusColor = (status) => {
  if (!status) return 'bg-stone-100 text-stone-800';
  const s = status.toLowerCase();
  const colors = {
    'pending': 'bg-amber-100 text-amber-600',
    'paid': 'bg-emerald-100 text-emerald-600',
    'failed': 'bg-red-100 text-red-600'
  };
  return colors[s] || 'bg-stone-100 text-stone-800';
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const truncateId = (id) => {
  if (!id) return '00000000';
  return id.toString().slice(-8).toUpperCase();
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
};
