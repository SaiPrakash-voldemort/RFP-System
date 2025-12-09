const db = require('../config/db');
// 1. IMPORT the AI Service
const aiService = require('./aiService'); 

const createRFP = async (title, raw_prompt) => {
    try {
        console.log("-> Analyzing prompt with Gemini...");
        
        // 2. CALL the AI function
        // This will take ~1-2 seconds to return the JSON
        const structuredData = await aiService.parseRFPRequirements(raw_prompt);
        
        console.log("-> AI Result:", structuredData);

        // 3. UPDATE the SQL Query
        // We added the 3rd column: structured_data
        const query = `
            INSERT INTO rfps (title, raw_prompt, structured_data)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        
        // 4. UPDATE the Values array
        // structuredData is a JSON object. 'pg' handles it automatically.
        const values = [title, raw_prompt, structuredData];
        
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error("DEBUG - Full DB Error:", error);
        throw new Error('Database Error: ' + (error.message || JSON.stringify(error)));
    }
};

module.exports = {
    createRFP
};
