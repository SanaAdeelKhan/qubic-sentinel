const limit = parseInt(process.env.RECENT_ALERTS_LIMIT || '200', 10);
const alerts = [];

/**
 * push an alert to in-memory store
 * @param {object} item
 */
export function pushAlert(item) {
  alerts.unshift({ ...item, receivedAt: new Date().toISOString() });
  if (alerts.length > limit) alerts.length = limit;
}

/** get recent alerts */
export function getRecentAlerts() {
  return alerts.slice();
}

