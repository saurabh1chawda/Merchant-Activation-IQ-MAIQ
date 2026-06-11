# PRODUCT REQUIREMENTS DOCUMENT (ALIGNED)
## Merchant Activation IQ - Feature 3: Razorpay X Payouts Trigger (Operations Lock-in)
*Version v1.1 (Aligned Version)*

| Metadata | Value |
| :--- | :--- |
| **Product Name** | Merchant Activation IQ - Feature 3: Razorpay X Payouts Trigger |
| **Author** | Senior Growth Product Manager, Razorpay |
| **Reviewer** | Rohan Mehta — Director of Product, Growth · Razorpay |
| **Framework** | STEP (Scope → Target → Experiment → Prove) |
| **Version** | v1.1 (Aligned Version) |
| **Status** | Aligned & Approved by Product Trio & Executives |

---

## 1. Scope & Core Requirements (S)

### 1.1 Goal
Introduce an interactive, zero-risk **Razorpay X Payouts Simulator** to SME merchants who have completed payment gateway activation (D7 activated). By simulating automated batch payouts (IMPS/NEFT/RTGS) directly from their mock wallet, we drive operations lock-in and increase D90 merchant retention by demonstrating how back-office operational overhead is eliminated.

### 1.2 Aligned Assumptions & Feedback Loop Resolutions
*   **FB-D-01 (Animation Compression):** Compress the batch execution animation to **1.5s** (0.5s verification + 0.4s debit + 0.6s disbursement) to maintain demo momentum.
*   **FB-D-02 (Amount bounds check):** Limit custom input values: only numeric values, minimum ₹1, and maximum capped at the active wallet balance.
*   **FB-E-01 (Integer Paise Storage):** Store all balance and transaction values as **integers in paise** (e.g. ₹50,000.00 stored as `5000000` paise) to prevent javascript float rounding errors.
*   **FB-E-02 (Multi-Merchant Data Isolation):** Isolate wallet balances and payout logs inside dictionary keys mapped by `merchant_id` in `localStorage` to prevent data leaking between selected merchants.
*   **FB-CPO-01 (Live Bridge Checklist):** Show a success CTA `[🚀 Upgrade to Live Payouts]` exposing a 3-step live activation list (Link Account, Verify Beneficiaries, Fund Account).
*   **FB-CPO-02 (Withdrawal Guardrail):** Render a persistent warning below the wallet balance: `*Sandbox virtual funds - non-withdrawable.*`
*   **FB-CEO-01 (Lock-in Metric HUD):** On batch success, display dynamic ROI statistics: *Time Saved: ~45 Minutes* and *Errors Prevented: 100%*.
*   **FB-CEO-02 (Logs Constraint):** Scrollable payout log table capped at the latest 10 transactions. No sorting/search features.

---

## 2. Interface & Flow Details

### 2.1 Tab Navigation & Smart Defaults
*   Integrated as the third tab `[💸 Payouts Sandbox]` next to Onboarding Sandbox and KYC Document Check.
*   **Smart Routing:** If the active merchant has `first_txn_done` == `true` AND `kyc_status` == `APPROVED` upon drawer opening, the drawer auto-selects the Payouts Sandbox tab.

### 2.2 Wallet Balance Widget
*   Located at the top of the Payouts tab.
*   Renders: **`Razorpay X Wallet Balance: ₹50,000.00`**.
*   A persistent disclaimer: `*Sandbox virtual funds - non-withdrawable.*`
*   A green `[+ Recharge Wallet]` button to restore balance to ₹50,000.00 (5,000,000 paise).

### 2.3 Interactive Vendor Selection List
Renders 4 static preset vendors:
1.  **Gupta Logistics** | Bank: *HDFC Bank* | Account: *******5920* | Default Amount: *₹12,500.00* | Status: `Verified`
2.  **Apex Raw Materials** | Bank: *ICICI Bank* | Account: *******1024* | Default Amount: *₹22,000.00* | Status: `Verified`
3.  **SaaS Infrastructure** | Bank: *SBI* | Account: *******8844* | Default Amount: *₹3,500.00* | Status: `Verified`
4.  **Freelance Designer** | Bank: *Axis Bank* | Account: *******3,000.00* | Status: `Mismatched` *(Triggers beneficiary verification mismatch)*

*   Each row contains a selection checkbox, editable payout amount (validated to numbers), and a status badge.
*   A "Pay All" checkbox in the header.

### 2.4 Batch Payout Processing Animation
Clicking **"Execute Batch Payout"** disables inputs and shows:
*   **Phase 1 (Verification - 0.5s):** Spinner reading: *"Verifying vendor accounts..."*.
*   **Phase 2 (Debit - 0.4s):** Progress bar 0%-50%: *"Debiting wallet balance..."*.
*   **Phase 3 (Disbursement - 0.6s):** Progress bar 50%-100%: *"Sending instant IMPS payouts..."*.
*   **On Success:** Plays success chime, triggers confetti, displays success banner, updates wallet balance, and appends logs. Renders ROI value stats (*Time Saved: ~45 min*, *Errors Prevented: 100%*).

---

## 3. Aligned Data Schema (`maiq_sandbox_state`)
Consolidated in local storage under `maiq_sandbox_state`:
```json
{
  "transactions": [],
  "rewards": {},
  "ocr_scans": [],
  "kyc_overrides": {},
  "name_overrides": {},
  "payout_balances": {
    "mer_9A2b8D4f": 5000000
  },
  "payout_transactions": {
    "mer_9A2b8D4f": [
      {
        "payout_id": "pout_sb_7c8d9e",
        "vendor_name": "Gupta Logistics",
        "amount": 1250000,
        "status": "SUCCESS",
        "timestamp": 1778901234000
      }
    ]
  },
  "vendor_status_overrides": {
    "mer_9A2b8D4f_vendor4": "Verified"
  }
}
```

---

## 4. Edge Cases & Failure States

### 4.1 Insufficient Balance
*   If selected total payout > active wallet balance, disable the execution button and render an inline warning: `⚠️ Insufficient Balance. Please recharge your wallet.`

### 4.2 Payout Cancellation
*   Closing drawer during animation halts execution. Display a confirm modal. If user accepts, debit is reverted and the payout is logged as `CANCELLED`.

### 4.3 Vendor Bank Verification Mismatch
*   If Vendor 4 ("Freelance Designer") is checked, animation halts at 25% and shows a mismatch panel:
    *   *Registered vendor name:* `Freelance Designer`
    *   *Beneficiary account name:* `Suresh Kumar` (mismatch error: `ERR_BENEFICIARY_MISMATCH`)
    *   **Remediation Options:**
        1.  `[Verify & Correct]` -> Updates vendor name to `Suresh Kumar`, saves status override to localStorage, and auto-resumes payout.
        2.  `[Skip Vendor]` -> Excludes Vendor 4 from current batch, resuming remaining payouts.
        3.  `[Force Transfer]` -> Continues transfer but logs status as `RISK_REVIEW_HOLD`.
