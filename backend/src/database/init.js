const db = require('../config/db');

const createTables = async () => {
    try {
        // 1. Vendors Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS vendors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                contact_phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("-> Vendors table ready");

        // 2. RFPs Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS rfps (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                raw_prompt TEXT, 
                structured_data JSONB, -- The AI parsed budget, items, etc.
                status VARCHAR(50) DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("-> RFPs table ready");

        // 3. Proposals Table (The Responses)
        await db.query(`
            CREATE TABLE IF NOT EXISTS proposals (
                id SERIAL PRIMARY KEY,
                rfp_id INT REFERENCES rfps(id) ON DELETE CASCADE,
                vendor_id INT REFERENCES vendors(id),
                raw_email_subject TEXT,
                attachment_url TEXT,
                ai_extracted_data JSONB, -- Reducto output
                ai_score INT,
                ai_analysis TEXT,
                received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("-> Proposals table ready");

        process.exit(0);
    } catch (err) {
        console.error("Error creating tables:", err);
        process.exit(1);
    }
};

createTables();
