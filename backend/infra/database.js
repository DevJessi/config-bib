import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

export const pool = new Pool({
    connectionString: env.databaseUrl,
    max: env.databasePoolMax,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
});

pool.on('error', (error) => {
    console.error(JSON.stringify({
        level: 'error',
        event: 'database.idle_client_error',
        message: error.message,
    }));
});
