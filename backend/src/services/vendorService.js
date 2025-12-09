const db = require('../config/db');

const createVendor = async (name, email) => {
    const query = 'INSERT INTO vendors (name, email) VALUES ($1, $2) RETURNING *';
    const result = await db.query(query, [name, email]);
    return result.rows[0];
};

const getAllVendors = async () => {
    const result = await db.query('SELECT * FROM vendors');
    return result.rows;
};

module.exports = { createVendor, getAllVendors };
