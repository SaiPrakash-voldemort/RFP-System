const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

const sendRFPEmail = async (toEmail, subject, htmlBody) => {
    try {
        console.log(`-> Sending email to ${toEmail} via Gmail...`);

        const info = await transporter.sendMail({
            from: `"RFP System" <${process.env.SMTP_EMAIL}>`, 
            to: toEmail,
            replyTo: process.env.AGENT_EMAIL_ADDRESS, 
            subject: subject,
            html: htmlBody
        });

        console.log(`-> Email Sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Sending Failed:", error);
        throw new Error("Email Failed");
    }
};


const getAttachment = async (inboxId, messageId, attachmentId) => {
    try {
        const url = `https://api.agentmail.to/v0/inboxes/${inboxId}/messages/${messageId}/attachments/${attachmentId}`;
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${process.env.AGENTMAIL_API_KEY}`
            },
            responseType: 'arraybuffer' 
        });

        return response.data; 
    } catch (error) {
        console.error("Attachment Download Failed:", error.message);
        throw error;
    }
};
module.exports = { sendRFPEmail, getAttachment };
