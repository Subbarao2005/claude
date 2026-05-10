export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
  return date.toLocaleString('en-IN', options);
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "₹ 0.00";
  return `₹ ${parseFloat(amount).toFixed(2)}`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return "bg-yellow-100 text-yellow-800";
    case 'Accepted': return "bg-blue-100 text-blue-800";
    case 'Preparing': return "bg-orange-100 text-orange-800";
    case 'Out for Delivery': return "bg-purple-100 text-purple-800";
    case 'Delivered': return "bg-green-100 text-green-800";
    case 'Rejected': return "bg-red-100 text-red-800";
    case 'Cancelled': return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'pending': return "bg-yellow-100 text-yellow-800";
    case 'successful': return "bg-green-100 text-green-800";
    case 'failed': return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const truncateId = (id) => {
  if (!id || id.length < 8) return id ? `#${id}` : '';
  return `#${id.slice(-8)}`;
};
