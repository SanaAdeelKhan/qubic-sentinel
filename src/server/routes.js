const express = require('express');
const router = express.Router();
// Inline controllers (no separate file needed)
const alertsController = {
  testWebhook: (req, res) => {
    // Trigger EasyConnect webhook test
    const testPayload = { kind: 'test', message: 'Dashboard test!' };
    const easyConnect = require('./services/easyConnect');
    easyConnect.sendAlert(testPayload).then(() => {
      res.json({ status: 'ok', message: 'Webhook test sent to Discord!' });
    });
  },
  recentAlerts: (req, res) => {
    res.json([]); // Placeholder - real alerts later
  }
};

router.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
router.post('/webhook/test', alertsController.testWebhook);
router.get('/alerts/recent', alertsController.recentAlerts);

module.exports = router;
