// ─── Safe type utilities ───────────────────────────
export const safeStr = (v) => {
  if (v === null || v === undefined) return ''
  return String(v)
}

export const safeTrim = (v) => safeStr(v).trim()

export const safeLower = (v) => safeStr(v).toLowerCase()

export const safeNum = (v) => {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

export const safeArr = (v) => {
  return Array.isArray(v) ? v : []
}

// ─── Format utilities ─────────────────────────────
export const formatCurrency = (amount) => {
  const num = safeNum(amount)
  return `₹ ${num.toFixed(2)}`
}

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString(
      'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    )
  } catch { return 'N/A' }
}

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const diff = Date.now() - new Date(dateString).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  } catch { return 'N/A' }
}

export const truncateId = (id) => {
  if (!id) return '#00000000'
  return '#' + safeStr(id).slice(-8)
}

// ─── Status color utilities ────────────────────────
export const getStatusColor = (status) => {
  const s = safeTrim(status)
  const map = {
    'Pending':          'bg-yellow-100 text-yellow-800',
    'Accepted':         'bg-blue-100 text-blue-800',
    'Preparing':        'bg-orange-100 text-orange-800',
    'Out for Delivery': 'bg-purple-100 text-purple-800',
    'Delivered':        'bg-green-100 text-green-800',
    'Rejected':         'bg-red-100 text-red-800',
    'Cancelled':        'bg-gray-100 text-gray-600'
  }
  return map[s] || 'bg-gray-100 text-gray-600'
}

export const getPaymentStatusColor = (status) => {
  const s = safeLower(safeTrim(status))
  const map = {
    'pending':    'bg-yellow-100 text-yellow-800',
    'successful': 'bg-green-100 text-green-800',
    'failed':     'bg-red-100 text-red-800'
  }
  return map[s] || 'bg-gray-100 text-gray-600'
}

// ─── Order status transitions ──────────────────────
export const getNextStatuses = (currentStatus) => {
  const transitions = {
    'Pending':          ['Accepted', 'Rejected'],
    'Accepted':         ['Preparing', 'Cancelled'],
    'Preparing':        ['Out for Delivery'],
    'Out for Delivery': ['Delivered'],
    'Delivered':        [],
    'Rejected':         [],
    'Cancelled':        []
  }
  return transitions[safeTrim(currentStatus)] || []
}

// ─── Validation utilities ──────────────────────────
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    safeStr(email)
  )
}

export const validatePhone = (phone) => {
  return /^\d{10}$/.test(safeStr(phone))
}

export const validatePincode = (pincode) => {
  return /^\d{6}$/.test(safeStr(pincode))
}

export const validateUrl = (url) => {
  try {
    new URL(safeStr(url))
    return true
  } catch { return false }
}

// ─── Storage utilities ─────────────────────────────
export const clearCorruptedStorage = () => {
  try {
    const cart = localStorage.getItem('melcho_cart')
    if (cart) {
      const parsed = JSON.parse(cart)
      if (!Array.isArray(parsed)) {
        localStorage.removeItem('melcho_cart')
        return
      }
      const clean = parsed.filter(item =>
        item &&
        item.product &&
        item.product._id &&
        item.product.title
      )
      if (clean.length !== parsed.length) {
        localStorage.setItem(
          'melcho_cart',
          JSON.stringify(clean)
        )
      }
    }
  } catch {
    localStorage.removeItem('melcho_cart')
  }
}
