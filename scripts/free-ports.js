const { execSync } = require('child_process');

const PORTS = [3000, 5000];

const getPidsForPort = (port) => {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return Array.from(
      new Set(
        output
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => line.split(/\s+/).pop())
          .filter((pid) => pid && pid !== '0')
      )
    );
  } catch (error) {
    return [];
  }
};

const killPid = (pid) => {
  try {
    execSync(`taskkill /PID ${pid} /F`, {
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    console.log(`Freed stale process ${pid}`);
  } catch (error) {
    // Ignore failures so start can continue.
  }
};

PORTS.forEach((port) => {
  const pids = getPidsForPort(port);
  pids.forEach(killPid);
});
