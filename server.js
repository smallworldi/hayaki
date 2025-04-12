const express = require('express');
const os = require('os');
const app = express();
const PORT = 3000;

app.get('/botstatus', (req, res) => {
  const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
  const uptime = process.uptime();
  const formattedUptime = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;

  res.json({
    status: 'online',
    memory: `${memoryUsage.toFixed(2)} MB`,
    uptime: formattedUptime,
    region: 'railway (us-east-1)' 
  });
});

app.listen(PORT, () => console.log(`Status API rodando em http://localhost:${PORT}/botstatus`));