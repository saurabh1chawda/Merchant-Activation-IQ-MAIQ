# PRODUCT REQUIREMENTS DOCUMENT
## Merchant Activation IQ - Feature 4: AI Integration Copilot (Technical Onboarding)
*Version v1.0 (Draft Version)*

| Metadata | Value |
| :--- | :--- |
| **Product Name** | Merchant Activation IQ - Feature 4: AI Integration Copilot |
| **Author** | Senior Growth Product Manager, Razorpay |
| **Reviewer** | Rohan Mehta — Director of Product, Growth · Razorpay |
| **Framework** | STEP (Scope → Target → Experiment → Prove) |
| **Version** | v1.0 (Draft Version) |
| **Status** | In Review / Draft |

---

## 1. Scope & Core Requirements (S)

### 1.1 Goal
Provide an interactive, zero-friction **AI Integration Copilot** (conversational chatbot + developer utility) as the fourth tab (`[🤖 AI Copilot]`) in the sliding sandbox drawer. The goal is to assist non-technical SME merchants who have linked their bank accounts but are stuck before generating API keys (D7 bank linked, API keys pending), thereby increasing the "API Keys Generated" conversion rate.

### 1.2 Target Audience & Pain Points
*   **Target Segment:** SME merchants who have linked their bank account (`bank_linked` == `true`) but haven't generated API keys (`api_keys_generated` == `false`) or processed a transaction.
*   **Pain Points:**
    *   Confusion around API credential management (copying public vs secret keys).
    *   Lack of developer resources to write integration code (PHP, Node, Python).
    *   Friction in testing webhooks without a backend server.

### 1.3 Core Specifications
1.  **Tab Integration & Routing**:
    *   Integrated as the fourth tab `[🤖 AI Copilot]` inside the sandbox drawer.
    *   **Smart Routing:** If a selected merchant has `bank_linked` == `true` but has not generated API keys, the drawer defaults to the `AI Copilot` tab upon opening.
2.  **Conversational Chat Interface**:
    *   Displays a mock chat window with preloaded quick-prompts:
        *   `"How do I generate API Keys?"`
        *   `"Give me a Node.js integration script."`
        *   `"How do webhooks work?"`
    *   Generates interactive, stylized chat bubbles simulating real-time typing indicators (0.8s lag).
3.  **Interactive API Key Generator**:
    *   When the user asks to generate keys, the Copilot renders an inline **"Generate API Credentials"** action card.
    *   Clicking it triggers a loading spinner and produces a mock `Key ID` (e.g. `rzp_test_copilot_9A2b8D`) and `Key Secret` (masked).
    *   Automatically updates the cohort list database, setting `api_keys_generated` to `true`, and saves credentials under `maiq_sandbox_state.api_keys[merchant_id]`.
4.  **Mock Webhook Sandbox Utility**:
    *   Provides an input field for the merchant to enter their mock endpoint URL (e.g. `https://my-store.com/webhook`).
    *   A **"Send Test Webhook"** button dispatches a mock JSON payload (`payment.captured`) with visual animations showing connection, dispatch, and simulated `200 OK` response.
5.  **Interactive Code Generators**:
    *   Provides tabbed selector inside the chat for Node.js, PHP, and Python code blocks.
    *   Includes a copy button and dynamically updates the placeholder API key inside the snippet to the generated merchant key.

---

## 2. Interface & Flow Details

### 2.1 UI Layout
*   **Left Column (Chat Assistant)**: A scrollable message history box showing system prompts, user queries, copilot responses, and interactive cards. Includes a text input field and a submit button.
*   **Right Column (Developer Utilities)**:
    *   *API Key Display Widget:* Shows current API keys (or "Not Generated" status with an action button).
    *   *Webhook Tester Card:* Endpoint URL input and test dispatcher.
    *   *Code Snippet Terminal:* Read-only syntax-highlighted code blocks dynamically updating to use the generated API Key.

### 2.2 Typing and Success Animations
*   Typing indicator dots animate for 0.8 seconds before responses print.
*   Generating API keys fires a mini-confetti burst and plays a synthesized success tone.
*   Test webhooks show a glowing connection pulse before marking success.

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
  "payout_balances": {},
  "payout_transactions": {},
  "vendor_status_overrides": {},
  "api_keys": {
    "mer_9A2b8D4f": {
      "key_id": "rzp_test_copilot_9A2b8D4f",
      "key_secret": "sk_test_copilot_9A2b8D4fxxxxxxxx",
      "webhook_url": "https://example.com/webhook",
      "generated_at": 1778901234000
    }
  }
}
```

---

## 4. Edge Cases & Failure States

### 4.1 Missing Bank Connection
*   If a merchant has `bank_linked` == `false`, the Copilot will guide them with a warning card: `⚠️ Bank account must be linked before keys can be generated.` and show a button redirecting them to link their bank.

### 4.2 Webhook URL Validation
*   Validates that the entered URL is in a proper format. Displays an error bubble if a malformed URL is supplied.

### 4.3 Key Expiration/Regeneration
*   Provides a **"Regenerate Keys"** button. Warns that old credentials will be revoked, prompting confirmation.
