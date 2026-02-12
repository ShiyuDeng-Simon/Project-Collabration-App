const { Pool } = require('pg');
require('dotenv').config();

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({
        user: process.env.USERNAME,
        password: process.env.PASSWORD,
        host: process.env.HOST,
        port: process.env.DBPORT,
        database: process.env.DATABASE || 'collabrationapp'
    });

module.exports = pool;