const app = require('./app');
const env = require('./config/env');
const { initDb } = require('./config/db');

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error('[db] Could not connect to PostgreSQL:', err.message);
    console.error('[db] Check the DB_* values in Backend/.env. The server will not start.');
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`[server] Listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

start();
