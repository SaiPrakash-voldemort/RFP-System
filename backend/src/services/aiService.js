const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const parseRFPRequirements = async (rawText) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Extract requirements into JSON: { budget: number, currency: 'USD', line_items: [{ item_name, quantity, specs }] }. Return ONLY JSON."
                },
                {
                    role: "user",
                    content: rawText
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content || "{}";
        return JSON.parse(content);
    } catch (error) {
        console.error("Groq AI Error:", error);
        return null;
    }
};

module.exports = { parseRFPRequirements };
