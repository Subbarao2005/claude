export const safeStr = (v) => String(v ?? '');
export const safeTrim = (v) => safeStr(v).trim();
export const safeLower = (v) => safeStr(v).toLowerCase();
export const safeNum = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};
export const safeArr = (v) => Array.isArray(v) ? v : [];

export const getStatusColor = (status) => {
  const s = safeTrim(status);
  const map = {
    'Pending':          'bg-yellow-100 text-yellow-800',
    'Accepted':         'bg-blue-100 text-blue-800',
    'Preparing':        'bg-orange-100 text-orange-800',
    'Out for Delivery': 'bg-purple-100 text-purple-800',
    'Delivered':        'bg-green-100 text-green-800',
    'Rejected':         'bg-red-100 text-red-800',
    'Cancelled':        'bg-gray-100 text-gray-600'
  };
  return map[s] || 'bg-gray-100 text-gray-600';
};

export const getPaymentStatusColor = (status) => {
  const s = safeLower(safeTrim(status));
  const map = {
    'pending':    'bg-yellow-100 text-yellow-800',
    'successful': 'bg-green-100 text-green-800',
    'paid':       'bg-green-100 text-green-800',
    'failed':     'bg-red-100 text-red-800'
  };
  return map[s] || 'bg-gray-100 text-gray-600';
};

export const getNextStatuses = (current) => {
  const transitions = {
    'Pending':          ['Accepted', 'Rejected'],
    'Accepted':         ['Preparing', 'Cancelled'],
    'Preparing':        ['Out for Delivery'],
    'Out for Delivery': ['Delivered'],
    'Delivered':        [],
    'Rejected':         [],
    'Cancelled':        []
  };
  return transitions[safeTrim(current)] || [];
};

export const formatCurrency = (amount) => {
  return `₹ ${safeNum(amount).toFixed(2)}`;
};

export const truncateId = (id) => {
  if (!id) return '#00000000';
  return '#' + safeStr(id).slice(-8).toUpperCase();
};

export const formatDate = (d) => {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return 'N/A'; }
};

export const formatRelativeTime = (d) => {
  if (!d) return 'N/A';
  try {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const dy = Math.floor(diff / 86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${dy}d ago`;
  } catch { return 'N/A'; }
};

export const validateEmail = (e) => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeStr(e));

export const validatePhone = (p) => 
  /^\d{10}$/.test(safeStr(p));

export const validatePincode = (p) => 
  /^\d{6}$/.test(safeStr(p));

export const clearCorruptedStorage = () => {
  try {
    const cart = localStorage.getItem('melcho_cart');
    if (cart) {
      const parsed = JSON.parse(cart);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem('melcho_cart');
        return;
      }
      const clean = parsed.filter(item =>
        item &&
        item.product &&
        item.product._id &&
        item.product.title
      );
      if (clean.length !== parsed.length) {
        localStorage.setItem('melcho_cart', JSON.stringify(clean));
      }
    }
  } catch {
    localStorage.removeItem('melcho_cart');
  }
};

// Safe string operations — never crash on non-strings
export const safeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export const safeTrim = (value) => {
  return safeString(value).trim();
};

export const safeLower = (value) => {
  return safeString(value).toLowerCase();
};

export const safeIncludes = (haystack, needle) => {
  return safeString(haystack)
    .toLowerCase()
    .includes(safeString(needle).toLowerCase());
};

// Safe number conversion
export const safeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};
