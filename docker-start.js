// Docker startup wrapper - serves React build files and proxies API requests
const express = require('express');  
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const { spawn } = require('child_process');

// Start the actual server as a subprocess on port 5001
const serverProcess = spawn('node', ['./server/index.js'], {
  env: { ...process.env, SERVER_PORT: '5001' },
  stdio: 'inherit',
});

// Give the server a moment to start
setTimeout(() => {
  // Create the proxy Express app
  const app = express();
  
  // Serve static files from build directory
  const buildPath = path.join(__dirname, 'build');
  app.use(express.static(buildPath));
  
  // Serve static files from public directory
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));
  
  // Proxy API requests to the actual server on port 5001
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
  }));
  
  // SPA fallback - serve index.html for non-API routes
  app.use((req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  
  // Start the proxy server on port 5000
  app.listen(5000, () => {
    console.log('Proxy server listening on http://localhost:5000');
  });
}, 2000);
