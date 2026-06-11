# PRODUCT REQUIREMENTS DOCUMENT (ALIGNED V1)
## Merchant Activation IQ (MAIQ)
*An AI-powered SME merchant activation, retention & monetisation platform*

| Metadata | Value |
| :--- | :--- |
| **Product Name** | Merchant Activation IQ (MAIQ) |
| **Author** | Saurabh Chawda — Candidate, Senior PM (Growth), Razorpay |
| **Reviewer** | Rohan Mehta — Director of Product, Growth · Razorpay |
| **Framework** | STEP (Scope → Target → Experiment → Prove) |
| **Version** | v1.2 (Aligned V1) |
| **Status** | Approved by Executive & Product Trio |

---

## STEP 1: Clarifying Questions & Scope Assumptions

*   **Q1: Business Context** - Growth layer on Razorpay's existing SME merchant database.
*   **Q2: Constraints** - 2-week MVP interactive prototype. 4-week production target.
*   **Q3: Internal vs. External** - Internal PM tool for campaign configuration and deployment.
*   **Q4: Data Privacy** - Strict VPC boundaries. Synthetic mock data for prototype.
*   **Q5: Out of Scope** - Core KYC changes, core payment gateway changes, and Jira integrations (PMs will manually export markdown/JSON payloads).

---

## STEP 2: Goals & Success Metrics

### Refined Activation Metrics
*   **North Star Metric:** Lift 30-day SME merchant activation rate from **45% to 52%** within 6 months specifically via targeted communication/nudges (with a long-term goal of 65% when paired with product onboarding self-serve upgrades).
*   **Guardrail Metric:** LLM API run cost < ₹0.10 per merchant through Heuristic & Tier-based Routing.
*   **Do No Harm:** Merchant communication unsubscribe rates must remain under 1.5%.

---

## STEP 3: User Segmentation & Tier-Based Value Routing

To maximize ROI and prevent billing spikes, cohorts are routed by **Merchant Potential Tier** (calculated using business category, estimated monthly revenue, and registration signals):

```
       [Raw Merchant Signals Ingested]
                      │
           [Data Sanitization Layer]
                      │
           [Tier & Behavior Routing]
             /        │        \
            /         │         \
    [Tier 1: High] [Tier 2: Mid] [Tier 3: Low]
         │            │            │
     Dynamic LLM    Hybrid      Pure Heuristic
    Intervention   Template     Static Nudge
```

1.  **Tier 1 (High Potential - e.g., established e-commerce, B2B SaaS):** Receives fully dynamic, context-specific LLM-generated campaigns.
2.  **Tier 2 (Mid Potential - e.g., retail shop, services):** Receives hybrid template customization (LLM adapts pre-existing templates).
3.  **Tier 3 (Low Potential - e.g., hobbies, micro-merchants):** Routed to pure static heuristic campaign triggers. No LLM calls.

---

## STEP 4: Solutions & Architecture Flow

### Core Modules (Slashed & Refined MVP)

1.  **Cohort Signals Ingestion (Simulated):** A table displaying a list of simulated merchants, their behavioral signals (e.g., stage dropped, time elapsed, logins), and calculated potential tiers.
2.  **Data Sanitization Layer (DSL):** Shows how raw PII is stripped/hashed before any analysis is run.
3.  **Hybrid Campaign Engine:**
    *   *Static Rule Branch:* Maps simple signals directly to template campaigns.
    *   *LLM Prompt Branch:* Generates highly targeted SMS/Email context for Tier 1 and 2 merchants using Claude 3.5 Sonnet.
4.  **Frequency Cap & Brand Voice Filter:** Programmatic check verifying that:
    *   No merchant gets >1 message per 48 hours.
    *   No vulgar or out-of-character text is generated.
5.  **Comms Hub Export Payload:** Generates a copyable JSON payload containing sanitized merchant IDs and tailored message bodies ready to be pasted into Razorpay’s communication dispatcher.

---

## STEP 5: Prioritized Features

| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Merchant Tier Cohort View** | Interactive table showing simulated merchants, tiers, and signals. | MVP |
| **DSL Visual Mock** | Toggle to see how data is scrubbed before processing. | MVP |
| **Hybrid Campaign Generator** | Trigger heuristic or LLM-based interventions based on tier. | MVP |
| **Comms Hub Export Payload** | Copyable JSON payload output for campaign delivery. | MVP |
| **Simulated Lever Controls** | Slider for nudge delay (D1-D7) and incentive adjustments. | MVP |
| **Funnel Visualizer (Simplified)** | 5-stage text/graphic representation of drop-offs (Mixpanel-lite). | MVP |
