# FINAL PRODUCT REQUIREMENTS DOCUMENT

## Merchant Activation IQ (MAIQ)
*An AI-powered SME merchant activation, retention & monetisation platform*

| Metadata | Value |
| :--- | :--- |
| **Product Name** | Merchant Activation IQ (MAIQ) |
| **Author** | Saurabh Chawda — Candidate, Senior PM (Growth), Razorpay |
| **Reviewer** | Rohan Mehta — Director of Product, Growth · Razorpay |
| **Version** | v3.0 (Latest Live Prototype) |

---

## 1️⃣ Clarifying questions
When assessing the scope of MAIQ, several key constraints and contexts define the approach:
*   **Are there any time/resource constraints?** Yes, we aim to deliver an impact on activation within 2 quarters (6 months). Additionally, we are strictly constrained by API costs, mandating LLM token expenses to remain under ₹0.10 per merchant.
*   **Are we a startup or a large tech company?** We are Razorpay, a large fintech company. We have high volume, meaning small percentage wins lead to massive revenue, but it also means data privacy (DPDP Act) and compliance are absolute requirements.
*   **What is the platform's nature?** It's a hybrid tool. Initially an internal Growth PM platform to generate campaigns, but its core deliverables are merchant-facing, self-serve sandboxes and copilots.

## 2️⃣ Set a GOAL
*   **Company Strategy:** Increase market share and active transacting SMEs.
*   **Goal:** Increase merchant activation (moving them from Registered to First Transaction Done).
*   **North Star Metric:** Lift 30-day merchant activation rate from **45% to 52%** within 6 months.

## 3️⃣ Define users
We segment our users by their current activities and operational scale rather than demographics:
*   **Registered Non-Activators (RNAs):** SMEs who have created an account but stalled. These are often non-technical business owners (e.g., local shop owners transitioning online) who struggle with API documentation or fear making mistakes.
*   **Growth Product Managers (Internal):** Razorpay PMs managing cohort ingestion, campaign routing, and monitoring funnel drop-offs using tier-based logic.

## 4️⃣ User Pain Points
Targeting the **Registered Non-Activators (RNAs)** segment to maximize the GOAL, here are the top 3 pain points:
1.  **KYC Rejections Delay Activation:** Merchants frequently upload blurry documents or have mismatched names on their PAN vs. Profile. They only find out after manual review, causing immense drop-off frustration.
2.  **API Integration is Too Technical:** Non-technical SMEs struggle to understand developer documentation, generate API keys, and configure webhooks, leading to abandonment at the technical integration phase.
3.  **Fear of the "First Live Transaction":** Merchants hesitate to process real money to test their setup, fearing they might break something, lose money, or trigger compliance flags. They lack a safe, guided sandbox.

## 5️⃣ Solutions: Time to be a PM!
To solve these pain points, we propose the following solutions for MAIQ:

**Reasonable Idea 1: 1-Click "Live Test Checkout" Sandbox & Payouts Trigger**
*   **What it is:** A zero-risk, self-serve drawer where merchants can simulate a payment via mock UPI apps (GPay, PhonePe). Upon success, it plays a chime, drops confetti, and unlocks a tier-scaled welcome credit. Additionally, they can test Razorpay X Payouts instantly in a safe environment.
*   **Why it works:** It eliminates the fear of testing with real money, builds confidence, and gamifies the first transaction.

**Reasonable Idea 2: Pre-emptive OCR KYC Checker**
*   **What it is:** A client-side document scanner that instantly evaluates PAN/GST uploads. It catches blurry images, missing signatures, or name mismatches *before* the merchant submits them to the backend, offering 1-click remediation (e.g., auto-updating the profile name to match the PAN).
*   **Why it works:** Shrinks the KYC feedback loop from days to milliseconds.

**Moonshot Idea: AI Integration Copilot**
*   **What it is:** A fully self-serve, interactive AI bot acting as a virtual developer. It generates Production API keys with one click, provides live copy-paste code snippets for their specific tech stack (Node.js, Python), and includes a built-in webhook testing utility that pings local dev environments (e.g., localhost).
*   **Why it works:** Completely removes the dependency on technical agencies or reading extensive docs. It bridges the hardest gap in fintech activation.

## 6️⃣ Prioritize Features
We use a High-Medium-Low framework to assess Impact, Effort, and Urgency to maximize our GOAL.

| Feature | Impact (Towards Goal) | Effort (Dev Time) | Urgency (Time to Market) |
| :--- | :--- | :--- | :--- |
| **1-Click Sandbox Checkout & Payouts** | **High** (Directly drives the "First Txn" metric and builds highest trust) | **Medium** (UI mockups and local state management) | **High** (Easiest win to unblock hesitant users) |
| **AI Integration Copilot** | **High** (Solves the biggest technical churn point) | **High** (Requires complex state generation, snippet templates, and webhook ping simulation) | **High** (Technical drop-off is our biggest funnel leak) |
| **Pre-emptive OCR KYC Checker** | **Medium** (Great UX, but impacts a slightly earlier funnel stage) | **Medium** (Client-side validation heuristics) | **Medium** (Can be fast-tracked after the sandbox) |

*Decision:* We built all three as they interlock to solve the entire activation funnel (KYC -> Integration -> First Transaction).

## 7️⃣ Measure Success
*   **North Star:** Lift 30-day merchant activation rate from **45% to 52%**.
*   **Signposts (Leading Indicators):**
    *   % of merchants using the AI Copilot to generate API keys.
    *   % of KYC documents cleared on the first attempt via pre-emptive OCR validation.
    *   Number of mock sandbox checkouts and payouts completed per cohort.
*   **"Do no harm" metrics (Guardrails):**
    *   LLM API run cost < ₹0.10 per merchant (controlled via Tier & Rule-based routing).
    *   Merchant communication unsubscribe rates must remain under 1.5%.
    *   Support queries regarding sandbox test funds or fake payouts must remain <0.5%.
