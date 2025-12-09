const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfpController');

router.post('/', rfpController.createRFP);
router.post('/:rfpId/send', rfpController.sendRFPToVendors);
router.get('/', rfpController.getAllRFPs);
router.get('/:id', rfpController.getRFPDetails);


module.exports = router;
