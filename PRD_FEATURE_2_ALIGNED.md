# PRODUCT REQUIREMENTS DOCUMENT
## Merchant Activation IQ - Feature 2: Pre-emptive OCR KYC Checker
*Aligned Version v1.1*

| Metadata | Value |
| :--- | :--- |
| **Product Name** | Merchant Activation IQ - Feature 2: Pre-emptive OCR KYC Checker |
| **Author** | Senior Growth Product Manager, Razorpay |
| **Reviewer** | Rohan Mehta — Director of Product, Growth · Razorpay |
| **Framework** | STEP (Scope → Target → Experiment → Prove) |
| **Version** | v1.1 (Aligned based on Design & Eng feedback) |
| **Status** | Draft — for Executive Review |

---

## 1. Scope & Core Requirements

*   **Goal:** Provide registered merchants stalled at the KYC stage with an instant, client-side, pre-emptive OCR document verification simulator to eliminate manual verification wait loops.
*   **Unified Workspace Drawer:** Refactor the slide-out panel to contain two clean tabs:
    1.  `[💬 Onboarding Sandbox]` (Feature 1: checkout payment and phone simulator).
    2.  `[📝 KYC OCR Sandbox]` (Feature 2: pre-emptive document scanner).
*   **Ingestion Schema Update:** Add an optional column `promoter_name` to the CSV ingestion schema. If empty, Sole Proprietorship owner names fall back to a match against the registered business name prefix.
*   **Unified Storage:** Combine all local storage states (sandbox transactions, rewards, and OCR logs) under a single key: **`maiq_sandbox_state`**.

---

## 2. Interface & Flow Details

### 2.1 Tabbed Drawer Panel
When a merchant is selected and the drawer is opened, the operator can switch between the Checkout sandbox and the KYC scanner.

### 2.2 Drag-and-Drop Dropzone with Test Presets
To remove document hunting friction, the dropzone includes direct click-to-load buttons for simulated assets:
1.  `[Load Blurry Document]` -> Triggers **ERR_OCR_BLUR** warning.
2.  `[Load Mismatched Name Document]` -> Triggers **ERR_NAME_MISMATCH** comparison pane.
3.  `[Load Unsigned GST]` -> Triggers **ERR_SIGNATURE_MISSING** highlight.
4.  `[Load Clean PAN Card]` -> Triggers **APPROVED** success sequence.

### 2.3 Visual Mismatch & Comparisons
For `ERR_NAME_MISMATCH`, show a comparative comparison directly in the UI:
*   *Expected Name:* `Komal Saree Palace`
*   *Extracted Name:* `Komal Sharma` (rendered in red with strikethroughs).

### 2.4 State Sync
A successful OCR scan updates the selected merchant's `kyc_status` to `APPROVED` in-memory and in `localStorage`. The cohort table and funnel visualizer refresh instantly.

---

## 3. Storage Schema Consolidation
All states are managed under `maiq_sandbox_state`:
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
*   **Do No Harm:** Keep false acceptance rate <0.1% to prevent compliance risk.
