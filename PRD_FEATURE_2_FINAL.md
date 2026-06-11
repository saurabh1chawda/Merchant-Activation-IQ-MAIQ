# FINAL PRODUCT REQUIREMENTS DOCUMENT
## Merchant Activation IQ - Feature 2: Pre-emptive OCR KYC Checker
*Version v1.2 (Final Aligned Version)*

| Metadata | Value |
| :--- | :--- |
| **Product Name** | Merchant Activation IQ - Feature 2: Pre-emptive OCR KYC Checker |
| **Author** | Senior Growth Product Manager, Razorpay |
| **Reviewer** | Rohan Mehta — Director of Product, Growth · Razorpay |
| **Framework** | STEP (Scope → Target → Experiment → Prove) |
| **Version** | v1.2 (Final Aligned Version) |
| **Status** | Approved & Signed Off by Product Trio & Executives |

---

## 1. Scope & Core Requirements

*   **Goal:** Provide registered merchants stalled at the KYC stage with an instant, client-side, pre-emptive OCR document verification simulator to eliminate manual verification wait loops.
*   **Unified Workspace Drawer:** Refactor the slide-out panel to contain two clean tabs:
    1.  `[💬 Onboarding Sandbox]` (Feature 1: checkout payment and phone simulator).
    2.  `[📝 KYC OCR Sandbox]` (Feature 2: pre-emptive document scanner).
*   **KYC State Locks:** If the selected merchant's `kyc_status` == `APPROVED` or `PENDING_VERIFICATION`, the OCR Sandbox tab displays a read-only badge `✓ KYC Document Verified` and locks file inputs to prevent redundant uploads.
*   **Unified Storage:** Combine all local storage states (sandbox transactions, rewards, OCR logs, and custom overrides) under a single key: **`maiq_sandbox_state`**.

---

## 2. Interface & Flow Details

### 2.1 Drag-and-Drop Dropzone with Test Presets
To remove document hunting friction, the dropzone includes click-to-load buttons for simulated assets:
1.  `[Load Blurry Document]` -> Triggers **ERR_OCR_BLUR** warning.
2.  `[Load Mismatched Name Document]` -> Triggers **ERR_NAME_MISMATCH** comparison pane.
3.  `[Load Unsigned GST]` -> Triggers **ERR_SIGNATURE_MISSING** highlight.
4.  `[Load Clean PAN Card]` -> Triggers **APPROVED** success sequence.

### 2.2 Visual Mismatch & Comparisons
For `ERR_NAME_MISMATCH`, show a comparative comparison directly in the UI:
*   *Expected Name:* `Komal Saree Palace`
*   *Extracted Name:* `Komal Sharma` (rendered in red with strikethroughs).
*   **Actionable Remediation:** Include an **"Update Profile Name to Match Document"** button. Clicking this dynamically updates the merchant's business name in our database to "Komal Sharma", instantly clearing the mismatch.

### 2.3 Success Sequence & Operational Guardrails
1.  Successful OCR verification plays a success sound and runs confetti.
2.  **Expectation Warning:** Dashboard displays: *"Pre-Verification Success! KYC documents match. Account pending final banking gateway activation (Est. Time: 2 Hours)."*
3.  **State Sync:** Updates the merchant's `kyc_status` to `APPROVED` in-memory and in `localStorage`. Cohort table and funnel views refresh instantly.

### 2.4 UAT Loop Refinements (Step 12 Releases)
1.  **Dropzone Hover State (`FB-F2-01`):** Added border transitions and glowing neon colors on dropzone `dragover` events.
2.  **Smart Routing (`FB-F2-02`):** Auto-selects the KYC Document Check tab if the merchant's KYC status is stalled (`REJECTED`, `IN_PROGRESS`, `NOT_STARTED`) upon drawer opening.
3.  **Validation Alert (`FB-F2-03`):** Warns users via a custom notification if unsupported file types are dropped into the OCR area.
4.  **Remediation Lag Staging (`FB-F2-04`):** Displays a `0.6s` intermediate checkmark success card inside the mismatch widget showing that the registered name was updated before trigger-starting the clean OCR scan.

---

## 3. Consolidated Data Schema (`maiq_sandbox_state`)
All simulation logs are stored under a single local storage namespace:
```json
{
  "transactions": [],
  "rewards": {},
  "ocr_scans": [
    {
      "merchant_id": "sha_hash",
      "status": "APPROVED | FAILED",
      "error_code": "ERR_NAME_MISMATCH | ERR_OCR_BLUR | ERR_SIGNATURE_MISSING | null"
    }
  ],
  "kyc_overrides": {
    "mer_3C9e7F1a": "APPROVED"
  }
}
```
---

## 4. Success Metrics
*   **Primary Conversion:** Lift KYC Approval rate from 68% to 85% in 3 months.
*   **Funnel Impact:** Lift D7 activation rate from 45% to 52%.
*   **Do No Harm:** Keep false acceptance rate <0.1%.
