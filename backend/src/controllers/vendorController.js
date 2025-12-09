const vendorService = require('../services/vendorService');

const createVendor = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const vendor = await vendorService.createVendor(name, email);
        res.status(201).json({ success: true, data: vendor });
    } catch (err) { next(err); }
};

const getVendors = async (req, res, next) => {
    try {
        const vendors = await vendorService.getAllVendors();
        res.json({ success: true, data: vendors });
    } catch (err) { next(err); }
};

module.exports = { createVendor, getVendors };
