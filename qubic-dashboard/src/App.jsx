import React, { useState, useEffect } from 'react';
import { Activity, Bell, AlertCircle, TrendingUp, Waves, CheckCircle } from 'lucide-react';

export default function QubicSentinelDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    currentTick: 0,
    totalAlerts: 0,
    largestWhale: 0,
    isPolling: false
  });
  const [config, setConfig] = useState({
    rpcUrl: 'https://rpc.qubic.org/',
    whaleThreshold: 5000,
    pollInterval: 5000,
    webhookUrl: ''
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [testStatus, setTestStatus] = useState('');

  // Simulate live monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(async () => {
      try {
        // Fetch current tick info
        const response = await fetch(`${config.rpcUrl}v1/tick-info`);
        const data = await response.json();
        const currentTick = data.tickInfo?.tick || data.tick || 0;
        
        setStats(prev => ({
          ...prev,
          currentTick,
          isPolling: true
        }));
        setLastUpdate(new Date());

        // Simulate whale detection (in production, fetch actual transactions)
        if (Math.random() > 0.95) {
          const amount = Math.floor(Math.random() * 50000) + config.whaleThreshold;
          const newAlert = {
            id: Date.now(),
            tick: currentTick,
            amount,
            from: `QUBIC${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            to: `QUBIC${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            timestamp: new Date().toISOString()
          };
          
          setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);
          setStats(prev => ({
            ...prev,
            totalAlerts: prev.totalAlerts + 1,
            largestWhale: Math.max(prev.largestWhale, amount)
          }));

          // Send webhook if configured
          if (config.webhookUrl) {
            sendWebhook(newAlert);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        setStats(prev => ({ ...prev, isPolling: false }));
      }
    }, config.pollInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, config]);

  const sendWebhook = async (alert) => {
    if (!config.webhookUrl) return;
    
    try {
      const payload = {
        content: `🦈 **WHALE ALERT!**\n💰 Amount: ${alert.amount.toLocaleString()} QU\n📊 Tick: ${alert.tick}\n🔗 From: ${alert.from}\n➡️ To: ${alert.to}`,
        embeds: [{
          title: "Qubic Whale Transaction",
          color: 3447003,
          fields: [
            { name: "Amount", value: `${alert.amount.toLocaleString()} QU`, inline: true },
            { name: "Tick", value: alert.tick.toString(), inline: true },
            { name: "Source", value: alert.from, inline: false },
            { name: "Destination", value: alert.to, inline: false }
          ],
          timestamp: alert.timestamp
        }]
      };

      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Webhook error:', error);
    }
  };

  const testWebhook = async () => {
    setTestStatus('sending');
    try {
      const testPayload = {
        content: '🧪 **Test Alert from Qubic Sentinel**\n✅ Webhook connection successful!',
        embeds: [{
          title: "Connection Test",
          description: "Your EasyConnect webhook is working correctly!",
          color: 5763719,
          timestamp: new Date().toISOString()
        }]
      };

      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      
      setTestStatus('success');
      setTimeout(() => setTestStatus(''), 3000);
    } catch (error) {
      setTestStatus('error');
      setTimeout(() => setTestStatus(''), 3000);
    }
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      setStats(prev => ({ ...prev, isPolling: true }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Waves className="w-10 h-10 text-cyan-400" />
              <h1 className="text-4xl font-bold">Qubic Whale Sentinel</h1>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${stats.isPolling ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span>{stats.isPolling ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>
          <p className="text-gray-300">Real-time blockchain whale monitoring with EasyConnect integration</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Current Tick</p>
                <p className="text-2xl font-bold">{stats.currentTick.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Alerts</p>
                <p className="text-2xl font-bold">{stats.totalAlerts}</p>
              </div>
              <Bell className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Largest Whale</p>
                <p className="text-2xl font-bold">{stats.largestWhale.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Threshold</p>
                <p className="text-2xl font-bold">{config.whaleThreshold.toLocaleString()}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6 border border-white/20">
          <h2 className="text-xl font-bold mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">RPC URL</label>
              <input
                type="text"
                value={config.rpcUrl}
                onChange={(e) => setConfig({ ...config, rpcUrl: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white"
                disabled={isMonitoring}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Whale Threshold (QU)</label>
              <input
                type="number"
                value={config.whaleThreshold}
                onChange={(e) => setConfig({ ...config, whaleThreshold: parseInt(e.target.value) || 5000 })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white"
                disabled={isMonitoring}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Poll Interval (ms)</label>
              <input
                type="number"
                value={config.pollInterval}
                onChange={(e) => setConfig({ ...config, pollInterval: parseInt(e.target.value) || 5000 })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white"
                disabled={isMonitoring}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Webhook URL (Discord/EasyConnect)</label>
              <input
                type="text"
                value={config.webhookUrl}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={toggleMonitoring}
              className={`px-6 py-2 rounded font-medium transition ${
                isMonitoring 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isMonitoring ? '⏸ Stop Monitoring' : '▶ Start Monitoring'}
            </button>

            <button
              onClick={testWebhook}
              disabled={!config.webhookUrl || testStatus === 'sending'}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded font-medium transition flex items-center gap-2"
            >
              {testStatus === 'sending' && '⏳'}
              {testStatus === 'success' && <CheckCircle className="w-4 h-4" />}
              {testStatus === 'error' && '❌'}
              {testStatus === '' && '🧪'} Test Webhook
            </button>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Whale Alerts</h2>
            <span className="text-sm text-gray-300">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Waves className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No whale alerts yet. Start monitoring to detect large transactions!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-white/5 p-4 rounded border border-white/10 hover:bg-white/10 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="font-bold text-cyan-400">{alert.amount.toLocaleString()} QU</span>
                    </div>
                    <span className="text-sm text-gray-400">Tick {alert.tick}</span>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><span className="text-gray-500">From:</span> {alert.from}</p>
                    <p><span className="text-gray-500">To:</span> {alert.to}</p>
                    <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Qubic Sentinel • Track 2: EasyConnect Integration • Real-time Blockchain Monitoring</p>
        </div>
      </div>
    </div>
  );
}