const logger = require('');
const { getRecentAlerts, pushAlert } = require('');

export function recentAlerts(req, res) {
  const alerts = getRecentAlerts();
  res.json({ count: alerts.length, alerts });
}

export async function testWebhook(req, res) {
  // create a sample payload and push to easyConnect via easyConnect service
  const example = {
    type: 'test',
    message: 'This is a test alert from Qubic Sentinel Lite',
    timestamp: new Date().toISOString()
  };

  try {
    // lazy require to avoid circular before services are ready
    const easyConnect = await import('../services/easyConnect.js');
    await easyConnect.sendAlert(example);
    // Also store locally for demo
    const { pushAlert: _push } = await import('../services/alertStore.js');
    _push(example);

    res.json({ ok: true, sent: example });
  } catch (err) {
    logger.error('testWebhook error', err.message || err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}

export default { recentAlerts, testWebhook };

