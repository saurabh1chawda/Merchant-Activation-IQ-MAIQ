# PRODUCT REQUIREMENTS DOCUMENT (DRAFT)
## Merchant Activation IQ - Feature 3: Razorpay X Payouts Trigger (Operations Lock-in)
*Version v1.0 (Draft)*

| Metadata | Value |
| :--- | :--- |
| **Product Name** | Merchant Activation IQ - Feature 3: Razorpay X Payouts Trigger |
| **Author** | Senior Growth Product Manager, Razorpay |
| **Reviewer** | Rohan Mehta — Director of Product, Growth · Razorpay |
| **Framework** | STEP (Scope → Target → Experiment → Prove) |
| **Version** | v1.0 (Draft) |
| **Status** | Awaiting Product Trio & Executive Review |

---

## 1. Scope & Core Requirements (S)

### 1.1 Goal
Introduce an interactive, zero-risk **Razorpay X Payouts Simulator** to SME merchants who have completed payment gateway activation (D7 activated). By simulating automated batch payouts (IMPS/NEFT/RTGS) directly from their mock wallet, we drive operations lock-in and increase D90 merchant retention by demonstrating how back-office operational overhead is eliminated.

### 1.2 Clarifying Questions & Scope Assumptions
*   **Q1: Does the Payouts Sandbox require real banking integrations?**
    *   *Assumption:* No. It runs entirely client-side as a mock simulation in the Sandbox Drawer, preserving the risk-free learning posture of the growth sandbox environment.
*   **Q2: What is the starting wallet balance, and where is it tracked?**
    *   *Assumption:* The simulation provides a pre-funded mock balance of **₹50,000.00**. Wallet balance updates are tracked in memory and persisted inside `localStorage` under the unified key `maiq_sandbox_state.payouts_wallet_balance`.
*   **Q3: Can merchants customize the list of vendors?**
    *   *Assumption:* For the MVP, a static list of 4 vendors is provided to simulate different back-office scenarios (e.g., successful payouts and bank verification mismatches).
*   **Q4: How does this feature interface with other sandbox features?**
    *   *Assumption:* It is integrated as the third tab `[💸 Payouts Sandbox]` next to `[💬 Onboarding Sandbox]` (Feature 1) and `[📝 KYC Document Check]` (Feature 2) in the unified sliding sandbox drawer.

### 1.3 MVP Scope vs. Later Scope
| Feature Area | MVP Scope (In-Scope) | Later Scope (Out-of-Scope) |
| :--- | :--- | :--- |
| **Vendor Management** | 4 static preset vendors with predefined bank statuses. | Custom vendor additions, CSV/Excel bank details bulk uploads. |
| **Wallet Balance** | Static initial balance of ₹50,000, manually rechargeable. | Dynamic linkage to live Razorpay checkout ledger balances. |
| **Verification Checks** | Simulated Name Mismatch comparison pane with click-to-correct. | Real-time penny-less account validation with gateway banks. |
| **Reconciliation** | Simulated debit ledger log in the drawer view. | Excel/PDF statements download, auto-sync with Tally/Zoho. |

---

## 2. Target Segment & User Pain Points (T)

### 2.1 Target Segment
*   **Primary Cohort:** SME merchants who are D7-activated (processed at least one checkout transaction) but have low platform activity or are approaching D90 without deep operation integrations.
*   **Criteria:** Monthly revenue range: ₹50K to ₹50L (Tier 1 and Tier 2).

### 2.2 User Pain Points
1.  **Payout Setup Friction:** Integrating and setting up corporate payouts (virtual accounts, vendor registration, upload of bulk payees) is perceived as too technical and risky.
2.  **Manual Payouts Overhead:** Business owners waste several hours weekly copying IFSC/account details into banking portals or executing manual UPI payouts, leading to data-entry errors.
3.  **Lack of Trust in Automated Payments:** Fear of transactions failing mid-route, incorrect beneficiary routing, or lack of instant confirmation creates resistance to adopting automated payouts.

---

## 3. Experiment & Core Feature Specifications (E)

### 3.1 Payouts Simulator Tab
*   **Label:** `[💸 Payouts Sandbox]`
*   **Smart Routing:** If a selected merchant has `first_txn_done` == `true` AND `kyc_status` == `APPROVED` upon drawer opening, the drawer auto-selects the **Payouts Sandbox** tab to steer focus toward operational lock-in.

### 3.2 Mock Wallet Balance Widget
*   Located at the top of the Payouts tab view.
*   Renders: **`Razorpay X Wallet Balance: ₹50,000.00`**.
*   A green `[+ Recharge Wallet]` button is placed adjacent to the balance, allowing users to restore the balance back to ₹50,000.00 at any time.

### 3.3 Mock Vendor Selection List
Renders an interactive list of 4 preset vendors:
1.  **Gupta Logistics** | Bank: *HDFC Bank* | Account: *******5920* | Default Amount: *₹12,500.00* | Status: `Verified`
2.  **Apex Raw Materials** | Bank: *ICICI Bank* | Account: *******1024* | Default Amount: *₹22,000.00* | Status: `Verified`
3.  **SaaS Infrastructure** | Bank: *SBI* | Account: *******8844* | Default Amount: *₹3,500.00* | Status: `Verified`
4.  **Freelance Designer** | Bank: *Axis Bank* | Account: *******3311* | Default Amount: *₹8,000.00* | Status: `Mismatched` *(Triggers Edge Case)*

Each vendor row contains:
*   A selection checkbox.
*   An editable text input for the Payout Amount.
*   A badge indicating account status (`Verified` in green, `Mismatched` in red).
*   A "Pay All" checkbox in the header.

### 3.4 Batch Payout Processing Animation
Upon clicking **"Execute Batch Payout"** (which shows the dynamic total, e.g. `Execute Payout to 3 Vendors (Total: ₹38,000.00)`):
1.  Disable all list checkboxes and inputs to prevent double clicks.
2.  Trigger a multi-step loading animation:
    *   **Phase 1 (Verification):** Shows a small loading spinner: *"Verifying vendor accounts... (Estimated time: 1.0s)"*.
    *   **Phase 2 (Debit):** Shows progress bar moving from 0% to 50%: *"Debiting wallet balance... (Estimated time: 0.8s)"*.
    *   **Phase 3 (Disbursement):** Shows progress bar moving from 50% to 100%: *"Sending instant IMPS payouts... (Estimated time: 1.0s)"*.
3.  On success:
    *   Play the synthesized success chime.
    *   Trigger a minor confetti burst.
    *   Display a success banner: *"Batch payout of ₹[Total] processed successfully. 3 vendors paid."*
    *   Update the mock wallet balance and append the transactions to the debit logs.

### 3.5 Transaction Debit Logs
A history panel at the bottom of the tab:
*   Columns: `Payout ID` (starts with `pout_sb_`), `Vendor Name`, `Amount`, `Status` (`SUCCESS` / `FAILED` / `REJECTED`), and `Timestamp`.
*   Data must be appended to the log table instantly and saved to `localStorage` under `maiq_sandbox_state.payout_transactions`.

### 3.6 Data Schema (`maiq_sandbox_state`)
The local storage schema is extended to:
```json
{
  "transactions": [],
  "rewards": {},
  "ocr_scans": [],
  "kyc_overrides": {},
  "name_overrides": {},
  "payouts_wallet_balance": 5000000, 
  "payout_transactions": [
    {
      "payout_id": "pout_sb_7c8d9e",
      "merchant_id": "mer_9A2b8D4f",
      "vendor_name": "Gupta Logistics",
      "amount": 1250000, 
      "status": "SUCCESS",
      "timestamp": 1778901234000
    }
  ]
}
```

### 3.7 Edge Cases & Failure States

#### 3.7.1 Insufficient Balance Simulation
*   **Condition:** Selected payout total is greater than the current mock wallet balance (e.g., total = ₹42,000 but wallet has ₹15,000).
*   **Behavior:**
    *   Disable the "Execute Batch Payout" button.
    *   Show an inline warning banner: *"⚠️ Insufficient Balance. Your current balance is ₹15,000.00. Please recharge your wallet."*
    *   Prevent submission.

#### 3.7.2 Payout Cancellation
*   **Condition:** User closes the drawer or clicks "Cancel & Exit" while the batch payout progress animation is running.
*   **Behavior:**
    *   Interruption causes the progress bar to halt.
    *   Show a modal prompt: *"Stop payout batch in progress? (Note: Debited funds will be returned to your wallet)."*
    *   If confirmed: Revert the wallet balance, log the transaction as `CANCELLED` in the debit logs, and close the drawer.

#### 3.7.3 Vendor Bank Verification Mismatch
*   **Condition:** User selects "Freelance Designer" (Vendor 4) for payout.
*   **Behavior:**
    *   During the verification phase, the animation stops at 25%.
    *   A red card pops up inside the terminal panel:
        *   *Registered vendor name:* `Freelance Designer`
        *   *Beneficiary bank account name:* `Suresh Kumar`
        *   *Error Code:* `ERR_BENEFICIARY_MISMATCH`
    *   **Action Remediation Buttons:**
        1.  `[Verify & Correct]` -> Updates the vendor name to `Suresh Kumar` in local storage, changes status to `Verified`, and auto-resumes the payout.
        2.  `[Skip Vendor]` -> Excludes the vendor from the current batch and resumes paying the remaining selected vendors.
        3.  `[Force Transfer (Risk Check)]` -> Continues transfer but marks the transaction in the debit logs as `RISK_REVIEW_HOLD`.

---

## 4. Prove & Success Metrics (P)

### 4.1 Retention & Payout Impact
*   **90-Day Retention Lift:** Increase D90 retention rate of activated SMEs from **58% to 68%** within two quarters.
*   **Payout Adoption Rate:** Percentage of active merchants who sign up and link a bank account for Razorpay X payouts within 14 days of running the payouts simulation. Target: **25% adoption**.
*   **Operations Lock-in Index (OLI):** Ratio of vendor payouts managed via Razorpay X versus legacy bank transfers. Target: OLI > 0.40 for activated cohorts within 90 days.

### 4.2 Guardrail Metrics
*   **Do No Harm (Support Volume):** Support tickets regarding "withdrawal of demo wallet funds" must remain at **0%**.
*   **Nudge Fatigue:** Razorpay X payouts campaign unsubscribe rates must remain below **1.2%**.
