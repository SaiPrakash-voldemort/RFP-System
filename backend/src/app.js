// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const rfpRoutes = require('./routes/rfpRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health Check Route (Good practice for SDE-2)
app.get('/',(req,res)=>{
    res.send('Welcome to the RFP Management API');
})
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Placeholder for Routes (We will add them later)
// const rfpRoutes = require('./routes/rfpRoutes');
// app.use('/api/rfps', rfpRoutes);

// Global Error Handler (Production practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: err.message || 'Internal Server Error' 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
