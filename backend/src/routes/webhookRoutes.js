const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/agentmail', webhookController.handleIncomingEmail);

module.exports = router;
