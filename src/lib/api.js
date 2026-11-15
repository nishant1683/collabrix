export async function createEnquiry(payload) {
  const response = await fetch('/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.error || 'The enquiry could not be submitted.')
    error.status = response.status
    throw error
  }
  return body.enquiry
}

export async function getDashboard(accessToken) {
  const response = await fetch('/api/dashboard', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'Dashboard unavailable.')
  return body
}

async function authenticatedRequest(path, accessToken, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) }
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'The request could not be completed.')
  return body
}

export const getDeals = (token) => authenticatedRequest('/api/deals', token)
export const updateDealStatus = (token, dealId, status) => authenticatedRequest(`/api/deals/${dealId}/status`, token, { method: 'PATCH', body: JSON.stringify({ status }) })
export const getDealMessages = (token, dealId) => authenticatedRequest(`/api/deals/${dealId}/messages`, token)
export const sendDealMessage = (token, dealId, body) => authenticatedRequest(`/api/deals/${dealId}/messages`, token, { method: 'POST', body: JSON.stringify({ body }) })
export const getDealRevisions = (token, dealId) => authenticatedRequest(`/api/deals/${dealId}/revisions`, token)
export const requestDealRevision = (token, dealId, description) => authenticatedRequest(`/api/deals/${dealId}/revisions`, token, { method: 'POST', body: JSON.stringify({ description }) })
export const getNotifications = (token) => authenticatedRequest('/api/notifications', token)
export const markNotificationRead = (token, notificationId) => authenticatedRequest(`/api/notifications/${notificationId}/read`, token, { method: 'PATCH' })
export const getReports = (token) => authenticatedRequest('/api/reports/summary', token)
