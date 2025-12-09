# SmartProcure: AI-Agent RFP Management System

SmartProcure is an intelligent procurement automation platform. It allows users to define requirements in natural language, automatically converts them into structured Requests for Proposals (RFPs), emails vendors, and—most importantly—uses GenAI to read, parse, and score incoming vendor quotes (PDFs/Emails) without human intervention.

 **Demo Video:** [Watch on Loom](https://www.loom.com/share/9c364e4fd0064c4eacad2df052a01b42)

---

##  Tech Stack

### Core
- **Frontend:** React.js (Vite), TailwindCSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Hosted on Supabase)

### AI & Intelligence
- **LLM Provider:** Groq (Model: `llama-3.3-70b-versatile`) for ultra-fast JSON extraction.
- **PDF Parsing:** `pdf-parse` for extracting raw text from vendor attachments.

### Communication Infrastructure
- **Outbound Email:** Nodemailer (via Gmail SMTP) for high deliverability.
- **Inbound Email:** AgentMail.to for receiving replies and parsing MIME types.
- **Tunneling:** Ngrok to expose the local webhook to the public internet.

---

##  Project Setup

### 1. Prerequisites
- **Node.js:** v18+
- **Database:** PostgreSQL Database (Supabase recommended for SSL support)
- **Accounts:** Groq (API Key), AgentMail (API Key), Gmail (App Password)

### 2. Installation

**Backend:**
cd backend
npm install

text

**Frontend:**
cd frontend
npm install

text

### 3. Environment Configuration
Create a `.env` file in the `/backend` folder using the example below:

PORT=3000

Database Connection (Supabase)
DATABASE_URL=postgresql://user:password@host:5432/dbname

AI Provider
GROQ_API_KEY=gsk_8yv1...

Outbound Email (Gmail App Password)
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx

Inbound Email (AgentMail)
This is the "Reply-To" address that captures vendor responses
AGENT_EMAIL_ADDRESS=agent-inbox@agentmail.to
AGENTMAIL_API_KEY=am_...

text

### 4. Database Setup
Run the initialization script to create the necessary tables (`rfps`, `vendors`, `proposals`).

cd backend
node src/config/init.js

text

### 5. Running Locally
You will need three terminal windows:

**Terminal 1 (Backend):**
cd backend
npm start

Server runs on http://localhost:3000
text

**Terminal 2 (Frontend):**
cd frontend
npm run dev

UI runs on http://localhost:5173
text

**Terminal 3 (Ngrok Tunnel):**
*Required for receiving email webhooks.*
ngrok http 3000

text
*Copy the HTTPS URL (e.g., `https://1234.ngrok-free.app`) and update your AgentMail Webhook settings to point to:* `https://1234.ngrok-free.app/api/webhooks/agentmail`

---

##  How to Configure "Receiving" (AgentMail.to)
To test the *vendor reply* feature locally:

1.  **Create an Account:** Go to [AgentMail.to](https://agentmail.to) and create a free inbox.
2.  **Get Credentials:** Copy your `Inbox Address` (e.g., `rfp-bot@agentmail.to`).
3.  **Set Webhook:** Point the AgentMail webhook to your backend endpoint (e.g., `https://[your-ngrok-url]/api/webhook/email`).

---

##  API Documentation

### 1. Create RFP
- **Endpoint:** `POST /api/rfps`
- **Description:** Parses natural language into structured JSON using Groq.
- **Body:**
{
"title": "Q1 Laptops",
"raw_prompt": "I need 10 Macbooks..."
}

text

### 2. Send RFP to Vendors
- **Endpoint:** `POST /api/rfps/:id/send`
- **Description:** Sends emails to selected vendors. Sets `Reply-To` header to AgentMail.
- **Body:**
{ "vendorIds": }​

text

### 3. Webhook (The Brain)
- **Endpoint:** `POST /api/webhooks/agentmail`
- **Description:** Triggered by AgentMail when a vendor replies.
- **Logic:**
1. Parses Email Subject to find RFP ID.
2. Downloads PDF attachment.
3. Extracts text using `pdf-parse`.
4. Sends text + Original Requirement to Groq AI.
5. AI extracts Price, Delivery Time, and generates a Score (0-100).
6. Saves Proposal to DB.

---

##  Decisions & Assumptions

### Design Decisions
- **Hybrid Email Architecture:** We used Gmail for sending (to avoid spam folders) but AgentMail for receiving (to handle complex MIME parsing). The two are linked via the `Reply-To` header.
- **Direct Webhook Processing:** For this MVP, we process the AI analysis directly in the webhook. In a production environment with high volume, I would move this to a Message Queue (BullMQ/Redis) to avoid timeouts.
- **Llama 3 70b:** Selected over GPT-4 for its speed and superior performance in JSON formatting on Groq's LPU hardware.

### Assumptions
- Vendors will include the Quote/Price in the email body or a standard PDF.
- Vendors will reply to the specific email thread (preserving the Subject line for ID tracking).
- Corporate firewalls may block DB connections (Solved during development).

---

##  Scalability & Future Architecture (Production Roadmap)
While this MVP demonstrates the core AI procurement logic, I have designed the architecture to scale for enterprise production workloads.

### 1. Concurrency Handling (Message Queues)
- **Current:** Webhooks are processed synchronously.
- **Future:** Implement **BullMQ** or **RabbitMQ** to decouple email ingestion from AI processing.
- **Why:** In a high-traffic scenario (1000+ vendor replies/minute), synchronous processing would timeout. A queue ensures 100% reliability by buffering incoming webhooks and processing them with worker nodes.

### 2. Advanced Document Intelligence
- **Current:** `pdf-parse` (Node.js library) for text extraction.
- **Future:** Integrate **Reducto.ai** or **AWS Textract**.
- **Why:** While `pdf-parse` works for standard digital PDFs, production systems receive scanned invoices and complex tables. Reducto.ai offers superior layout preservation, ensuring the AI extracts line-item details with near-100% precision.

### 3. Mass Vendor Orchestration
- **Current:** Single-vendor targeting for demo simplicity.
- **Future:** The backend service layer is already structured to accept vendor arrays (`vendorIds: []`).
- **Upgrade:** Refactor the Frontend UI to support "Bulk Select" and "Batch Upload" (CSV) of vendors, enabling users to blast RFPs to 50+ suppliers in one click.

---

##  AI Tools Usage & Learnings

### Tools Used
- **Perplexity AI:** Used as a primary documentation search engine and debugging partner.
- **Groq API:** The engine powering the application's intelligence.
- **ChatGPT:** Used for debugging.

### What I Learned (The "Real" Journey)
This project was a massive learning curve. I encountered and solved several complex engineering challenges:

- **Network Infrastructure & Firewalls:**
I initially struggled with `ENOTFOUND` errors when connecting to the database. I learned that corporate/office WiFi networks often block outbound traffic on Port 5432 (PostgreSQL). I diagnosed this by switching networks and realized the importance of network permissions in backend development.

- **Tunneling & Webhooks:**
I learned how localhost is isolated from the internet and how tools like Ngrok bridge that gap. I now understand how webhooks work: the external service (AgentMail) needs a public "door" (Ngrok URL) to knock on my local server.

- **Environment Variable Parsing:**
I debugged a critical issue where `dotenv` was parsing a double assignment (`KEY=KEY=value`) causing the DB host to be read as "base". This taught me to meticulously check configuration files and not rely blindly on copy-paste.

- **Resilience:**
From struggling with parsing logic to handling undefined frontend states (`vendors.map is not a function`), I learned that 90% of engineering is reading logs, understanding the data flow, and not giving up when the screen is blank.

---