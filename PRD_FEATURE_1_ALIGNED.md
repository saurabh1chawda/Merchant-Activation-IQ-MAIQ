# PRODUCT REQUIREMENTS DOCUMENT
## Merchant Activation IQ - Feature 1: 1-Click "Live Test Checkout" Sandbox
*Aligned Version v1.1*

| Metadata | Value |
| :--- | :--- |
| **Product Name** | Merchant Activation IQ - Feature 1: 1-Click "Live Test Checkout" Sandbox |
| **Author** | Senior Growth Product Manager, Razorpay |
| **Reviewer** | Rohan Mehta — Director of Product, Growth · Razorpay |
| **Framework** | STEP (Scope → Target → Experiment → Prove) |
| **Version** | v1.1 (Aligned based on Design & Eng feedback) |
| **Status** | Draft — for Executive Review |

---

## 1. Scope & Clarifying Questions

*   **Goal:** Provide registered non-activated merchants with a zero-risk sandbox checkout to remove integration anxiety and drive activation.
*   **Infrastructure:** Run entirely client-side using simulated responses; no real money movement or banking APIs.
*   **Access Point:** Direct CTA banner in the dashboard onboarding checklist when a merchant is selected.
*   **In-Scope for MVP:**
    *   Unified side-by-side desktop layout hosting both checkout modal and simulated mobile UPI phone frame (avoiding visual window overlaps).
    *   Mock QR Code checkout with pre-loaded ₹10.00 transaction.
    *   Simplified mobile UPI apps selector (GPay, PhonePe, Paytm).
    *   Single-click "Approve Mock Payment" bypass (removes numeric PIN typing friction).
    *   `localStorage` persistence for completed transactions and unlocked credits to prevent data loss on page reload.
    *   Synchronized state updating: completing a mock checkout changes the active merchant's `first_txn_done` flag to `true`, instantly updating the Cohort Manager table and Onboarding Funnel.
*   **Out-of-Scope for MVP:**
    *   Developer Webhook compilation panel (removed to streamline MVP engineering).
    *   Real card networks, Netbanking redirects, or SMS dispatch networks.

---

## 2. Target Segment & User Pain Points

*   **Target Segment:** Registered Non-Activators (RNAs) who have completed KYC/bank verification but have processed 0 live payments. Particularly targets non-technical Tier 2 & 3 SME owners.
*   **Key Pain Points:**
    *   *Testing Anxiety:* Fear of losing real money during integration testing.
    *   *Documentation Friction:* Lack of developer resources to configure API endpoints.
    *   *Delayed Gratification:* Dashboards remain blank and dry without a visual confirmation of success.

---

## 3. Detailed Interface & Core Flow Specifications

### 3.1 Side-by-Side Unified Sandbox Panel
To prevent window layering issues on desktop viewports, the Sandbox triggers a slide-out drawer containing:
*   **Left Half (Razorpay Checkout Frame):** Shows a standard payment modal with an embedded static SVG QR Code for ₹10.00.
*   **Right Half (UPI App Simulator):** Shows a realistic mobile phone mockup.

### 3.2 Simplified Payment Loop
1.  Merchant clicks **"Try 1-Click Live Test Checkout"**.
2.  The Sandbox panel opens. The phone mockup shows a lock screen that transitions to the UPI App selector (Google Pay, PhonePe, Paytm).
3.  Merchant selects an app. The phone mockup displays a transaction summary of ₹10.00.
4.  Merchant clicks **"Approve Payment (Simulated)"** (no manual pin entry required).
5.  A progress spinner spins for 1.2 seconds, followed by a green checkmark success sound.
6.  The checkout modal closes, and the main dashboard triggers:
    *   **Confetti Burst Animation** in the browser viewport.
    *   **Welcome Bonus Unlocked Alert**: A card showing: *"Welcome Reward Active! You've unlocked ₹500 in live transaction fee credits. Complete bank linking to activate."*
    *   **Cohort database update**: Handovers success back to `app.js`, updating the selected merchant's `first_txn_done` to `true`.

### 3.3 Sandbox State Database (Stored in `localStorage`)
```json
{
  "sandbox_session_active": "boolean",
  "completed_payments": [
    {
      "transaction_id": "pay_sb_hash",
      "merchant_id": "sha_hash",
      "amount": 1000,
      "timestamp": 1778901234
    }
  ],
  "unlocked_rewards": [
    {
      "merchant_id": "sha_hash",
      "reward_amount": 50000,
      "unlocked": true
    }
  ]
}
```

---

## 4. Success Metrics
*   **North Star:** Lift D7 activation rate from 45% to 52% in 6 months.
*   **Signposts:** Sandbox conversion rate (open to finish) >80%; dashboard bank linking CTA click-through >35%.
*   **Do No Harm:** Customer support inquiries regarding sandbox cash withdrawals must remain <0.5% due to prominent "TEST FUNDS ONLY" warnings in the ledger.
