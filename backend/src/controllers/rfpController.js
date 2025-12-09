const rfpService = require('../services/rfpService');
const emailService = require('../services/emailService');
const db = require('../config/db');

const createRFP = async (req, res, next) => {
    try {
        const { title, raw_prompt } = req.body;

        if (!title || !raw_prompt) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title and raw_prompt are required' 
            });
        }

        const newRFP = await rfpService.createRFP(title, raw_prompt);

        res.status(201).json({
            success: true,
            data: newRFP
        });
    } catch (error) {
        next(error);
    }
};
const sendRFPToVendors = async (req, res, next) => {
    try {
        const { rfpId } = req.params;
        const { vendorIds } = req.body; 

        if (!vendorIds || vendorIds.length === 0) {
            return res.status(400).json({ message: "No vendors selected" });
        }

        const rfpRes = await db.query('SELECT * FROM rfps WHERE id = $1', [rfpId]);
        if (rfpRes.rows.length === 0) return res.status(404).json({ message: "RFP Not Found" });
        const rfp = rfpRes.rows[0];

        const results = [];
        for (const vendorId of vendorIds) {
            const vendorRes = await db.query('SELECT * FROM vendors WHERE id = $1', [vendorId]);
            if (vendorRes.rows.length === 0) continue;
            const vendor = vendorRes.rows[0];

            const subject = `Request for Proposal: ${rfp.title} [Ref: RFP-${rfp.id}]`;
            
            const body = `
                <h3>Hello ${vendor.name},</h3>
                <p>We are inviting you to bid for the following requirement:</p>
                <blockquote>${rfp.raw_prompt}</blockquote>
                <p>Please reply to this email with your quote attached (PDF preferred).</p>
                <p><b>Reference ID:</b> RFP-${rfp.id}</p>
            `;

            await emailService.sendRFPEmail(vendor.email, subject, body);
            results.push({ vendor: vendor.name, status: "Sent" });
        }

        res.json({ success: true, sent_to: results });

    } catch (error) {
        next(error);
    }
};
const getAllRFPs = async (req, res) => {
    const result = await db.query('SELECT * FROM rfps ORDER BY created_at DESC');
    res.json(result.rows);
};

const getRFPDetails = async (req, res) => {
    const { id } = req.params;

    const rfp = await db.query('SELECT * FROM rfps WHERE id = $1', [id]);
  
    const proposals = await db.query(`
        SELECT p.*, v.name as vendor_name, v.email as vendor_email 
        FROM proposals p 
        JOIN vendors v ON p.vendor_id = v.id 
        WHERE p.rfp_id = $1
    `, [id]);
    
    res.json({ rfp: rfp.rows[0], proposals: proposals.rows });
};

module.exports = { createRFP, sendRFPToVendors, getAllRFPs, getRFPDetails };
