const { PDFParse } = require('pdf-parse'); 
const emailService = require('../services/emailService');
const aiService = require('../services/aiService');
const db = require('../config/db');

const handleIncomingEmail = async (req, res) => {
    
    console.log("-> [DEBUG] Webhook Hit! Sending 200 OK...");
    res.status(200).send("Received"); 

    try {
        const event = req.body;
        console.log("-> [DEBUG] Event Type:", event.event_type);

        if (!event.event_type || event.event_type !== 'message.received') {
            console.log("-> [DEBUG] Ignored: Not a message.received event");
            return;
        }

        const message = event.message;
        const subject = message.subject;
        const fromEmail = message.from.match(/<(.+)>/)?.[1] || message.from;

        console.log(`-> 📨 New Reply from ${fromEmail}: "${subject}"`);

        // 2. Extract RFP ID
        const match = subject.match(/RFP-(\d+)/);
        if (!match) {
            console.log("-> [DEBUG] Ignored: No RFP ID in subject.");
            return;
        }
        const rfpId = parseInt(match[1]);
        console.log(`-> [DEBUG] RFP ID Extracted: ${rfpId}`);

        // 3. Find Vendor ID
        console.log(`-> [DEBUG] Checking DB for vendor email: ${fromEmail}...`);
        const vendorRes = await db.query('SELECT id FROM vendors WHERE email = $1', [fromEmail]);
        if (vendorRes.rows.length === 0) {
            console.log(`-> [DEBUG] Ignored: Vendor not found in DB`);
            return;
        }
        const vendorId = vendorRes.rows[0].id;
        console.log(`-> [DEBUG] Vendor Found. ID: ${vendorId}`);

        // 4. Download & Parse PDF
        let extractedText = message.text || ""; 
        let attachmentUrl = null;

        if (message.attachments && message.attachments.length > 0) {
            const att = message.attachments[0];
            console.log(`-> [DEBUG] Found Attachment: ${att.filename} (ID: ${att.attachment_id})`);
            console.log(`-> [DEBUG] Downloading from AgentMail API...`);

            try {
                // Step A: Download
                const pdfBuffer = await emailService.getAttachment(message.inbox_id, message.message_id, att.attachment_id);
                console.log(`-> [DEBUG] Download Success! Buffer Size: ${pdfBuffer.length} bytes`);
                
                // Step B: Parse
                console.log("-> [DEBUG] Parsing PDF with pdf-parse...");
                const parser = new PDFParse({ data: pdfBuffer });
                const pdfData = await parser.getText();
                await parser.destroy(); 
                
                console.log(`-> [DEBUG] Parse Success! Extracted Length: ${pdfData.text.length} chars`);
                extractedText += "\n --- PDF QUOTE CONTENT ---\n" + pdfData.text;
                attachmentUrl = att.filename;

            } catch (err) {
                console.error("-> [DEBUG] Attachment Processing Failed:", err.message);
                // Don't crash, just continue without PDF text
            }
        } else {
            console.log("-> [DEBUG] No Attachments found.");
        }

        // 5. AI Analysis
        console.log("-> [DEBUG] Fetching RFP requirements from DB...");
        const rfpRes = await db.query('SELECT raw_prompt FROM rfps WHERE id = $1', [rfpId]);
        const requirements = rfpRes.rows[0].raw_prompt;
        
        const analysisPrompt = `
            RFP Requirement: "${requirements}"
            Vendor Quote Full Text: "${extractedText}"
            
            Task: 
            1. Extract the Total Price (number).
            2. Extract Delivery Timeline (in days, as number).
            3. Compare the Quote vs Requirement.
            4. Assign a Score (0-100) based on price and timeline.
            
            Return JSON: { "total_price": number, "delivery_days": number, "score": number, "summary": "Short 1 sentence summary" }
        `;

        console.log("-> [DEBUG] Calling Groq/AI Service...");
        const aiResult = await aiService.parseRFPRequirements(analysisPrompt);
        console.log("-> [DEBUG] AI Response:", JSON.stringify(aiResult));

        // 6. Save to Database
        console.log("-> [DEBUG] Saving Proposal to DB...");
        await db.query(`
            INSERT INTO proposals 
            (rfp_id, vendor_id, raw_email_subject, attachment_url, ai_extracted_data, ai_score, ai_analysis)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            rfpId, 
            vendorId, 
            subject, 
            attachmentUrl, 
            { raw_text_snippet: extractedText.substring(0, 500) },
            aiResult?.score || 0, 
            JSON.stringify(aiResult)
        ]);

        console.log(`-> ✅ Proposal Saved Successfully! ID: RFP-${rfpId} / Vendor-${vendorId}`);

    } catch (error) {
        console.error("-> [DEBUG] FATAL Webhook Error:", error);
    }
};

module.exports = { handleIncomingEmail };
