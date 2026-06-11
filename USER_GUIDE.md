# MAIQ Operational User Guide 📘
*A Step-by-Step Manual for Growth PMs and Operations Teams*

This guide walks you through the operations of the **Merchant Activation IQ (MAIQ)** growth dashboard to upload cohorts, customize incentives, and utilize the self-serve suite: Sandbox Checkout, OCR KYC, Payouts Trigger, and AI Copilot.

---

## 🧭 Dashboard Sections

1.  **Onboarding Funnel (Top Left):** Shows current conversion percentages for the active list.
2.  **Campaign Levers (Bottom Left):** Configures nudge delays, activation incentives, compliance data masking, and displays reward countdowns.
3.  **SME Merchant Cohort Manager (Top Right):** Displays active merchant queues.
4.  **Campaign Router & Payload Compiler (Bottom Right):** Houses the campaign output, manual message editor, and export JSON.

---

## 🏃 Workflow 1: 1-Click Sandbox Checkout Simulation

1.  Select a merchant in the cohort manager table.
2.  Click the **"Try 1-Click Test Onboarding"** button (which opens the right-hand drawer).
3.  Navigate to the **Payments Tab**.
4.  On the mock UPI phone screen, select an app (GPay, PhonePe, or Paytm) and click **"Approve Payment"**.
5.  A processing screen will load, followed by a payment success animation and chime.
6.  *Verification:* The drawer closes, confetti bursts, the merchant's activation flag turns true, and a Tier-scaled reward card (₹500 or ₹100) appears in the Campaign Levers sidebar with a 14-day expiry.

---

## 🏃 Workflow 2: KYC OCR Simulation

1.  Select a merchant with a stalled KYC status (`REJECTED`, `IN_PROGRESS`) in the cohort table.
2.  Click **"Try 1-Click Test Onboarding"** and navigate to the **KYC Check Tab**.
3.  Use the preset buttons inside the dropzone to simulate document scans:
    *   **Blurry PAN:** Simulates poor legibility error.
    *   **Mismatched PAN:** Detects registered vs. extracted name diff.
    *   **Unsigned GST:** Detects missing signature.
    *   **Clean PAN:** Simulates a perfect scan.
4.  *Remediation:* If you trigger the Name Mismatch error, click **"Update Profile Name to Match Document"**. The system auto-updates the merchant's profile, re-runs the scan successfully, and sets KYC status to `APPROVED`.

---

## 🏃 Workflow 3: Razorpay X Payouts Trigger

1.  Open the Sandbox Drawer and select the **Payouts Tab**.
2.  *Prerequisite:* You must generate API Keys via the AI Copilot tab first. If not generated, the Payouts form is locked.
3.  Once unlocked, fill in the Payout Amount and click **"Trigger Payout"**.
4.  *Verification:* The system processes the mock payout and logs the transaction in the history table at the bottom of the drawer.

---

## 🏃 Workflow 4: AI Integration Copilot

1.  Open the Sandbox Drawer and select the **AI Copilot Tab**.
2.  Click **"Generate Production API Keys"**.
    *   *Verification:* A secure API Key and Secret are generated and securely stored in `localStorage`. The keys are masked but copyable.
3.  Select a tech stack (Node.js, Python) from the **Integration Snippets** dropdown. The code block will update with copy-paste ready examples.
4.  **Webhook Testing:**
    *   Enter a webhook URL (e.g., `http://localhost:3000/hooks`).
    *   Click **"Test Webhook"**.
    *   *Verification:* The system validates the regex pattern and simulates a ping, verifying that the endpoint is ready to receive events.

---

## 🛠️ Troubleshooting & Guardrails

*   **Sandbox Sound Muted:** Click the speaker icon in the drawer header to toggle sound.
*   **Duplicate Payment Block:** Once a merchant completes a checkout, they cannot unlock the tier credit twice.
*   **Locked Tabs:** If a merchant hasn't cleared KYC, their payments/payouts tabs may restrict full functionality.
