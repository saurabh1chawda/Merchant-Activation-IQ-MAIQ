# FINAL PRODUCT REQUIREMENTS DOCUMENT
## Merchant Activation IQ - Feature 1: 1-Click "Live Test Checkout" Sandbox
*Version v1.2 (Signed Off)*

| Metadata | Value |
| :--- | :--- |
| **Product Name** | Merchant Activation IQ - Feature 1: 1-Click "Live Test Checkout" Sandbox |
| **Author** | Senior Growth Product Manager, Razorpay |
| **Reviewer** | Rohan Mehta — Director of Product, Growth · Razorpay |
| **Framework** | STEP (Scope → Target → Experiment → Prove) |
| **Version** | v1.2 (Final Aligned Version) |
| **Status** | Approved by Product Trio & Executive Board |

---

## 1. Scope & Core Requirements

*   **Goal:** Provide registered non-activated merchants with a zero-risk sandbox checkout to remove integration anxiety and drive activation.
*   **Access Point:** Direct button on the selected merchant card inside the dashboard: `Try 1-Click Live Test Checkout`.
*   **Infrastructure:** Run client-side with simulated responses; no real money moves or real banking APIs.
*   **State Persistence:** Use `localStorage` to save completed sandbox payments and reward states so data survives page reloads.
*   **Parent Cohort Sync:** Completing a sandbox payment updates the merchant's `first_txn_done` status to `true` in the parent cohort table and updates the onboarding funnel.

---

## 2. Interface & Flow Details

### 2.1 Side-by-Side Unified Sandbox Panel
The sandbox triggers a slide-out drawer split into two viewports:
*   **Left Half (Razorpay Checkout Frame):** Shows a mock payment window with an embedded static QR Code for ₹10.00.
*   **Right Half (UPI App Simulator):** Shows a phone mockup with Google Pay, PhonePe, and Paytm icons.
*   **Header Control:** Includes a clear **"Cancel & Exit Sandbox"** button to allow users to leave the sandbox simulation at any point.

### 2.2 Payment Loop & Tier-Scaled Incentives
1.  Merchant selects a UPI app and clicks **"Approve Payment (Simulated)"** (no PIN entry required).
2.  A 1.2s spinner executes, followed by a green checkmark.
3.  The main dashboard triggers a **Confetti Burst** and pops a modal:
    *   **Tier 1 & 2 Merchants:** Unlock **₹500** in live transaction fee credits.
    *   **Tier 3 Merchants:** Unlock **₹100** in live transaction fee credits.
4.  **Urgency Expiration:** The unlocked credit card displays a countdown timer: *"Expires in 14 Days. Link your bank details to lock in this credit."*

### 2.3 Simulated Transactions List
Instead of a separate tab, a simple table of **"Simulated Sandbox Transactions"** is appended directly inside the sandbox panel.

---

## 3. Production Security & Data Schema

### 3.1 Security Requirement (Production Gate)
While the frontend prototype uses `localStorage` for visual state changes, the production system **must** require a server-side database validation verifying that a payment record exists in the transactions database before unlocking the promotion credits.

### 3.2 Data Schema (Local Storage Structure)
```json
{
  "sandbox_active": "boolean",
  "transactions": [
    {
      "transaction_id": "pay_sb_hash",
      "merchant_id": "sha_hash",
      "amount": 1000,
      "upi_app": "string",
      "timestamp": 1778901234
    }
  ],
  "rewards": {
    "merchant_id": "sha_hash",
    "credit_amount": 50000,
    "expiry_date": "string (timestamp)",
    "activated": "boolean"
  }
}
```

---

## 4. Success Metrics
*   **North Star:** Lift D7 activation rate from 45% to 52% in 6 months.
*   **Do No Harm:** Customer service queries regarding withdrawing mock test funds must remain <0.5%.
