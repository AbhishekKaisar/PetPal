const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
    if (!process.env.POSTGRES_URL) {
        console.error("Error: POSTGRES_URL environment variable is missing.");
        console.log("Please create a .env file with POSTGRES_URL=...");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        const sqlPath = path.join(__dirname, '../database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log("Running database migrations...");
        await pool.query(sql);
        console.log("Database setup complete!");
    } catch (err) {
        console.error("Error setting up database:", err);
    } finally {
        await pool.end();
    }
}

setup();
