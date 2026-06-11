// Merchant Activation IQ - Logic & Simulation Engine
// Author: Saurabh Chawda

// --- INITIAL SYNTHETIC DATA ---
const INITIAL_COHORT = [
  {
    merchant_id: "mer_9A2b8D4f",
    business_name: "Zephyr Electronics",
    business_category: "E-Commerce",
    est_monthly_revenue: 6500000,
    signup_date: "2026-06-01",
    last_active_date: "2026-06-07",
    kyc_status: "APPROVED",
    bank_linked: true,
    first_txn_done: false
  },
  {
    merchant_id: "mer_3C9e7F1a",
    business_name: "Komal Saree Palace",
    business_category: "Retail",
    est_monthly_revenue: 120000,
    signup_date: "2026-06-03",
    last_active_date: "2026-06-06",
    kyc_status: "REJECTED",
    bank_linked: false,
    first_txn_done: false
  },
  {
    merchant_id: "mer_5F1a4C8d",
    business_name: "Apex Consulting Services",
    business_category: "Services",
    est_monthly_revenue: 1500000,
    signup_date: "2026-06-04",
    last_active_date: "2026-06-08",
    kyc_status: "PENDING_VERIFICATION",
    bank_linked: false,
    first_txn_done: false
  },
  {
    merchant_id: "mer_8K3f9L0e",
    business_name: "Rahul Hobbies & Crafts",
    business_category: "Individual/Hobby",
    est_monthly_revenue: 15000,
    signup_date: "2026-06-02",
    last_active_date: "2026-06-02",
    kyc_status: "NOT_STARTED",
    bank_linked: false,
    first_txn_done: false
  },
  {
    merchant_id: "mer_2P7d4S8z",
    business_name: "Swift Logistics Solutions",
    business_category: "B2B SaaS",
    est_monthly_revenue: 8500000,
    signup_date: "2026-05-30",
    last_active_date: "2026-06-07",
    kyc_status: "APPROVED",
    bank_linked: true,
    first_txn_done: false
  },
  {
    merchant_id: "mer_1J6x3Y9u",
    business_name: "Mumbai Spices Corner",
    business_category: "Retail",
    est_monthly_revenue: 45000,
    signup_date: "2026-06-05",
    last_active_date: "2026-06-07",
    kyc_status: "APPROVED",
    bank_linked: false,
    first_txn_done: false
  },
  {
    merchant_id: "mer_6N0w7T2v",
    business_name: "Anjali Boutique",
    business_category: "Fashion Retailer",
    est_monthly_revenue: 280000,
    signup_date: "2026-06-04",
    last_active_date: "2026-06-05",
    kyc_status: "APPROVED",
    bank_linked: true,
    first_txn_done: false
  },
  {
    merchant_id: "mer_4B8y1K5m",
    business_name: "Local Kirana Store",
    business_category: "Retail",
    est_monthly_revenue: 30000,
    signup_date: "2026-06-06",
    last_active_date: "2026-06-06",
    kyc_status: "IN_PROGRESS",
    bank_linked: false,
    first_txn_done: false
  }
];

// --- MOCK LLM ENGINE RESPONSES ---
const MOCK_LLM_RESPONSES = {
  "mer_9A2b8D4f": {
    channel: "EMAIL",
    campaign_tag: "maiq_tier1_activation_custom",
    message_body: `Subject: Complete your Razorpay setup: Get paid instantly on Zephyr Electronics

Hello Team Zephyr Electronics,

We noticed you've integrated our APIs and completed your KYC successfully! The final step to unlocking seamless payments for your E-Commerce customers is processing your first live transaction.

To ensure your API configuration is 100% correct, let's trigger a test checkout:
1. Create a quick ₹10 Payment Link in your Razorpay Dashboard.
2. Share it to your phone or check out yourself to see the payment flow in action.

💡 Success Bonus: Complete your first transaction within the next 48 hours, and we will credit ₹500 directly to your settlement account as a welcome incentive.

Need developer support for your API? Reply directly to this email to schedule a 15-minute call with our integrations engineer.

Best regards,
Razorpay Merchant Success Squad`
  },
  "mer_2P7d4S8z": {
    channel: "EMAIL",
    campaign_tag: "maiq_tier1_activation_custom",
    message_body: `Subject: Accelerate Swift Logistics Solutions payments with Razorpay X

Hello Swift Logistics Solutions Team,

Your business category is highly suited for automated payout pipelines. Your KYC verification is fully approved, and your API keys are ready. 

To help you get activated and establish your checkout workflow:
1. Go to your dashboard -> Payment Buttons.
2. Generate a custom B2B payment request widget in 2 minutes.
3. Share the link with your clients.

🚀 Performance Deal: Process your first transaction of any volume this week, and receive 0% Transaction Fee on your first ₹50,000 GMV!

Should you require any customized webhook setups, our specialized technical account managers are standing by.

Best,
Razorpay B2B Growth Team`
  },
  "mer_5F1a4C8d": {
    channel: "SMS",
    campaign_tag: "maiq_tier2_bank_link_nudge",
    message_body: `Hey Apex Consulting Services, your KYC verification is in progress! However, you can't receive payouts until your bank account is linked. Tap here to link securely in 1 click: rzp.io/l/bank-lnk. Link now and get ₹200 cashback on your first transaction!`
  },
  "mer_6N0w7T2v": {
    channel: "SMS",
    campaign_tag: "maiq_tier2_activation_nudge",
    message_body: `Hello Anjali Boutique, your setup is ready to go! Let's get your first payment today. Go to your dashboard, create a Payment Link, and share it on WhatsApp. First transaction gets ₹200 credited to your wallet!`
  }
};

// Global States
let merchants = [...INITIAL_COHORT];
let selectedMerchantId = null;
let currentFilter = "all";
let dslEnabled = false;
let nudgeDelayValue = 2;
let incentiveValue = 200;

// In-Memory Database for Notification History
const NOTIFICATION_HISTORY = {};

// Sandbox Specific State
let selectedUPIApp = "";
let countdownTimerInterval = null;
let soundEnabled = true;

// --- CONSOLIDATED STORAGE STATE ENGINE (Engineering requirement) ---
function getSandboxState() {
  const defaultState = {
    transactions: [],
    rewards: {},
    kyc_overrides: {},
    name_overrides: {},
    payout_balances: {},
    payout_transactions: {},
    vendor_status_overrides: {},
    api_keys: {}
  };
  const raw = localStorage.getItem("maiq_sandbox_state");
  if (!raw) return defaultState;
  
  const state = JSON.parse(raw);
  if (!state.payout_balances) state.payout_balances = {};
  if (!state.payout_transactions) state.payout_transactions = {};
  if (!state.vendor_status_overrides) state.vendor_status_overrides = {};
  if (!state.api_keys) state.api_keys = {};
  return state;
}

function saveSandboxState(state) {
  localStorage.setItem("maiq_sandbox_state", JSON.stringify(state));
}

function syncPersistedState() {
  const state = getSandboxState();
  
  // Sync first txn states
  state.transactions.forEach(tx => {
    const m = merchants.find(mer => mer.merchant_id === tx.merchant_id);
    if (m) m.first_txn_done = true;
  });

  // Sync KYC status overrides
  Object.keys(state.kyc_overrides).forEach(mId => {
    const m = merchants.find(mer => mer.merchant_id === mId);
    if (m) m.kyc_status = state.kyc_overrides[mId];
  });

  // Sync Name corrections
  Object.keys(state.name_overrides).forEach(mId => {
    const m = merchants.find(mer => mer.merchant_id === mId);
    if (m) m.business_name = state.name_overrides[mId];
  });
}

// --- UTILITY FUNCTIONS ---
function sha256Mock(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "sha_" + Math.abs(hash).toString(16).substring(0, 8);
}

function classifyTier(merchant) {
  if (merchant.est_monthly_revenue >= 5000000) return "Tier 1";
  if (merchant.est_monthly_revenue >= 50000) return "Tier 2";
  return "Tier 3";
}

function getFilteredCohort() {
  if (currentFilter === "all") return merchants;
  if (currentFilter === "t1") return merchants.filter(m => classifyTier(m) === "Tier 1");
  if (currentFilter === "t2") return merchants.filter(m => classifyTier(m) === "Tier 2");
  if (currentFilter === "t3") return merchants.filter(m => classifyTier(m) === "Tier 3");
  return merchants;
}

// --- WEB AUDIO API CHIME ---
function playChime() {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (err) {
    console.warn("Audio Context blocked:", err);
  }
}

// --- RENDERING ENGINE ---
function renderFunnel() {
  const filtered = getFilteredCohort();
  const total = filtered.length;
  const funnelEl = document.getElementById("funnel-container");

  if (total === 0) {
    funnelEl.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.75rem; text-align: center; padding: 2.5rem 0;">
        <i class="fas fa-users-slash" style="font-size: 1.5rem; margin-bottom: 0.5rem; opacity: 0.3;"></i>
        <p>No merchants fit this filter</p>
      </div>
    `;
    return;
  }

  const kycDone = filtered.filter(m => ["PENDING_VERIFICATION", "APPROVED"].includes(m.kyc_status)).length;
  const bankLinked = filtered.filter(m => m.bank_linked).length;
  const state = getSandboxState();
  const apiIntegrated = filtered.filter(m => {
    return (state.api_keys && state.api_keys[m.merchant_id]) || m.first_txn_done;
  }).length;
  const activated = filtered.filter(m => m.first_txn_done).length;

  const steps = [
    { label: "1. Registered Signups", count: total, pct: 100 },
    { label: "2. KYC Completed", count: kycDone, pct: Math.round((kycDone / total) * 100) },
    { label: "3. Bank Linked", count: bankLinked, pct: Math.round((bankLinked / total) * 100) },
    { label: "4. API Keys Generated", count: apiIntegrated, pct: Math.round((apiIntegrated / total) * 100) },
    { label: "5. Activated (First Txn)", count: activated, pct: Math.round((activated / total) * 100) }
  ];

  funnelEl.innerHTML = steps.map(step => `
    <div class="funnel-step">
      <div class="funnel-step-header">
        <span class="funnel-step-label">${step.label}</span>
        <span class="funnel-step-value">${step.count} (${step.pct}%)</span>
      </div>
      <div class="funnel-bar-bg">
        <div class="funnel-bar-fill" style="width: ${step.pct}%"></div>
      </div>
    </div>
  `).join("");
}

function renderTable() {
  const tbody = document.getElementById("cohort-table-body");
  tbody.innerHTML = "";

  const filtered = getFilteredCohort();

  filtered.forEach(m => {
    const tier = classifyTier(m);
    const isSelected = m.merchant_id === selectedMerchantId;
    
    const displayId = dslEnabled ? sha256Mock(m.merchant_id) : m.merchant_id;
    const displayName = dslEnabled ? "Merchant (" + m.business_category + ")" : m.business_name;
    const displayCategory = m.business_category;
    
    let displayRev = m.est_monthly_revenue.toLocaleString('en-IN') + " INR";
    if (dslEnabled) {
      if (m.est_monthly_revenue >= 5000000) displayRev = "> 50L INR";
      else if (m.est_monthly_revenue >= 50000) displayRev = "50K - 50L INR";
      else displayRev = "< 50K INR";
    }

    let tierClass = "tag-t3";
    if (tier === "Tier 1") tierClass = "tag-t1";
    if (tier === "Tier 2") tierClass = "tag-t2";

    const tr = document.createElement("tr");
    if (isSelected) tr.classList.add("selected");
    tr.innerHTML = `
      <td>${displayId}</td>
      <td style="font-weight: 500;">${displayName}</td>
      <td>${displayCategory}</td>
      <td>${displayRev}</td>
      <td><span class="tier-tag ${tierClass}">${tier}</span></td>
      <td>${m.kyc_status}</td>
    `;
    
    tr.addEventListener("click", () => {
      selectMerchant(m.merchant_id);
    });
    tbody.appendChild(tr);
  });
}

function renderActiveRewardBadge() {
  const container = document.getElementById("active-reward-container");
  if (!selectedMerchantId) {
    container.innerHTML = "";
    return;
  }

  const state = getSandboxState();
  const reward = state.rewards[selectedMerchantId];

  if (countdownTimerInterval) {
    clearInterval(countdownTimerInterval);
  }

  if (!reward) {
    container.innerHTML = "";
    return;
  }

  const expiry = new Date(reward.expiry_date).getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      container.innerHTML = `
        <div class="reward-card" style="border-color: var(--accent-red); background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(13, 20, 35, 0.85) 100%);">
          <div class="reward-icon" style="color: var(--accent-red); background: rgba(239, 68, 68, 0.1);"><i class="fas fa-times-circle"></i></div>
          <div class="reward-info">
            <h4>Reward Expired</h4>
            <p>Onboarding limit exceeded.</p>
          </div>
        </div>
      `;
      clearInterval(countdownTimerInterval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const timerStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    const formatValue = (reward.credit_amount / 100).toLocaleString('en-IN');

    container.innerHTML = `
      <div class="reward-card">
        <div class="reward-icon"><i class="fas fa-gift"></i></div>
        <div class="reward-info">
          <h4>₹${formatValue} Fee Credit Unlocked!</h4>
          <p>Expires in: <span class="expiry-countdown">${timerStr}</span></p>
        </div>
      </div>
    `;
  }

  updateTimer();
  countdownTimerInterval = setInterval(updateTimer, 1000);
}

function selectMerchant(id) {
  selectedMerchantId = id;
  renderTable();
  renderActiveRewardBadge();
  
  const m = merchants.find(mer => mer.merchant_id === id);
  const engineBadge = document.getElementById("selected-merchant-engine");
  const runBtn = document.getElementById("run-engine-btn");
  const sandboxBtn = document.getElementById("sandbox-trigger-btn");
  
  if (!m) {
    document.getElementById("selected-merchant-info").innerText = "None Selected";
    runBtn.disabled = true;
    sandboxBtn.disabled = true;
    return;
  }

  runBtn.disabled = false;
  
  // Set trigger button state
  const state = getSandboxState();
  const hasKeys = state.api_keys && state.api_keys[m.merchant_id];

  if (m.first_txn_done) {
    sandboxBtn.disabled = false;
    sandboxBtn.innerHTML = `<i class="fas fa-hand-holding-usd"></i> Try Payouts Sandbox`;
    sandboxBtn.style.opacity = "1";
  } else if (hasKeys && m.kyc_status === "APPROVED") {
    sandboxBtn.disabled = false;
    sandboxBtn.innerHTML = `<i class="fas fa-mobile-alt"></i> Try 1-Click Test Onboarding`;
    sandboxBtn.style.opacity = "1";
  } else if (m.bank_linked) {
    sandboxBtn.disabled = false;
    sandboxBtn.innerHTML = `<i class="fas fa-robot"></i> Launch Copilot Dev Setup`;
    sandboxBtn.style.opacity = "1";
  } else if (m.first_txn_done === false && m.kyc_status !== "APPROVED") {
    sandboxBtn.disabled = false;
    sandboxBtn.innerHTML = `<i class="fas fa-file-invoice"></i> Complete KYC Check`;
    sandboxBtn.style.opacity = "1";
  } else {
    sandboxBtn.disabled = false;
    sandboxBtn.innerHTML = `<i class="fas fa-mobile-alt"></i> Try 1-Click Test Onboarding`;
    sandboxBtn.style.opacity = "1";
  }

  // Handle Tab Lockouts based on KYC status (FB-F2-CPO-Lock)
  const ocrTabBtn = document.getElementById("tab-ocr-btn");
  if (m.kyc_status === "APPROVED" || m.kyc_status === "PENDING_VERIFICATION") {
    ocrTabBtn.classList.add("disabled");
    ocrTabBtn.title = "KYC already completed for this merchant";
  } else {
    ocrTabBtn.classList.remove("disabled");
    ocrTabBtn.title = "Check KYC documents";
  }

  // Handle Tab Lockout for Payouts Sandbox (D7 activated constraint)
  const payoutsTabBtn = document.getElementById("tab-payouts-btn");
  if (!m.first_txn_done || m.kyc_status !== "APPROVED") {
    payoutsTabBtn.classList.add("disabled");
    payoutsTabBtn.title = "Complete onboarding checkout and KYC approval to unlock Payouts Sandbox";
  } else {
    payoutsTabBtn.classList.remove("disabled");
    payoutsTabBtn.title = "Simulate automated batch payouts";
  }

  const tier = classifyTier(m);
  let path = "Rule-Based Routing";
  let badgeStyle = "badge-heuristic";
  
  if (m.kyc_status === "REJECTED" || !m.bank_linked) {
    path = "Rule-Based Override";
    badgeStyle = "badge-heuristic";
  } else if (tier === "Tier 1") {
    path = "Dynamic AI Routing";
    badgeStyle = "badge-llm";
  } else if (tier === "Tier 2") {
    path = "Hybrid AI Routing";
    badgeStyle = "badge-hybrid";
  }

  const displayName = dslEnabled ? "Merchant (" + m.business_category + ")" : m.business_name;
  document.getElementById("selected-merchant-info").innerHTML = `
    <strong>${displayName}</strong> [${tier}]
  `;
  
  engineBadge.className = `engine-badge ${badgeStyle}`;
  engineBadge.innerHTML = `<i class="fas fa-microchip"></i> ${path}`;
  
  document.getElementById("preview-box").innerHTML = `
    <div class="preview-box-empty">
      <i class="fas fa-play-circle"></i>
      <p>Click "Generate Campaign Payload" above to run the hybrid engine router</p>
    </div>
  `;
  document.getElementById("payload-code-box").innerText = "[]";
}

// --- ENGINE EXECUTION & ACTIONS ---
function showNotification(text, type = "success") {
  const banner = document.createElement("div");
  banner.className = `alert-banner ${type}`;
  let icon = "fa-check-circle";
  if (type === "error") icon = "fa-exclamation-circle";
  if (type === "warning") icon = "fa-exclamation-triangle";
  
  banner.innerHTML = `<i class="fas ${icon}"></i> <span>${text}</span>`;
  document.body.appendChild(banner);
  setTimeout(() => {
    banner.remove();
  }, 4000);
}

function rebuildPayloadJSON(campaignResult, text) {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  const payload = [
    {
      sanitized_merchant_id: dslEnabled ? sha256Mock(m.merchant_id) : m.merchant_id,
      channel: campaignResult.channel,
      recipient_identifier: dslEnabled ? "hashed_identifier" : "merchant_contact_payload",
      message_body: text,
      campaign_tag: campaignResult.campaign_tag
    }
  ];
  document.getElementById("payload-code-box").innerText = JSON.stringify(payload, null, 2);
}

function runInterventionEngine() {
  if (!selectedMerchantId) {
    showNotification("Please select a merchant from the cohort first.", "error");
    return;
  }

  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  const now = Date.now();
  
  const lastNotified = NOTIFICATION_HISTORY[m.merchant_id];
  if (lastNotified && (now - lastNotified) < 172800000) {
    showNotification("FREQUENCY LIMIT: Message blocked. Merchant was nudged within 48 hours.", "error");
    
    document.getElementById("preview-box").innerHTML = `
      <div style="color: var(--accent-red); text-align: center; padding: 2rem;">
        <i class="fas fa-ban" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
        <h3>Campaign Trigger Blocked</h3>
        <p style="font-size: 0.75rem; margin-top: 0.5rem; color: var(--text-secondary);">
          Rule violation: Max 1 notification campaign per merchant in any 48-hour window.
        </p>
      </div>
    `;
    return;
  }

  NOTIFICATION_HISTORY[m.merchant_id] = now;

  const tier = classifyTier(m);
  const previewBox = document.getElementById("preview-box");
  
  previewBox.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%;">
      <div class="typing-indicator" style="margin-bottom: 0.5rem;">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
      <p style="font-size: 0.7rem; color: var(--text-secondary);">Compliance verification in progress, calling routing algorithm...</p>
    </div>
  `;

  setTimeout(() => {
    let campaignResult = null;

    if (m.kyc_status === "REJECTED") {
      campaignResult = {
        channel: "SMS",
        campaign_tag: "maiq_static_kyc_recovery",
        message_body: `Dear ${dslEnabled ? "Merchant" : m.business_name}, your KYC documents require clarification. Please upload a clear photo of your PAN Card/Bank statement inside your Razorpay dashboard to resume activation: rzp.io/l/kyc-fix`
      };
    } else if (!m.bank_linked) {
      campaignResult = {
        channel: "SMS",
        campaign_tag: "maiq_static_bank_recovery",
        message_body: `Dear ${dslEnabled ? "Merchant" : m.business_name}, your KYC is verified but your bank account is not linked. To prevent payout holds, complete linking in 30 seconds: rzp.io/l/bank-lnk. Incentives wait!`
      };
    } else if (tier === "Tier 1") {
      campaignResult = MOCK_LLM_RESPONSES[m.merchant_id] || {
        channel: "EMAIL",
        campaign_tag: "maiq_tier1_activation_generic",
        message_body: `Subject: Complete your Razorpay setup: Launch ${dslEnabled ? "your retail/e-commerce business" : m.business_name}

Hello Team,

We noticed your account setup is complete. Let's make your integration live.

1. Generate your production API Keys in settings.
2. Replace test credentials with live keys in your plugin or code.
3. Complete your first successful transaction of any amount.

Welcome Offer: Complete activation in the next ${nudgeDelayValue} days, and enjoy 0% payment gateway fees on your first ₹${incentiveValue * 100} GMV.

Best regards,
Razorpay Merchant Success`
      };
    } else if (tier === "Tier 2") {
      campaignResult = MOCK_LLM_RESPONSES[m.merchant_id] || {
        channel: "SMS",
        campaign_tag: "maiq_tier2_activation_hybrid",
        message_body: `Hello ${dslEnabled ? "Merchant" : m.business_name}, your setup is ready! Create a quick Payment Link & share with customers. Activate within ${nudgeDelayValue} days for a ₹${incentiveValue} cashback bonus! rzp.io/l/paylnk`
      };
    } else {
      campaignResult = {
        channel: "SMS",
        campaign_tag: "maiq_tier3_static_nudge",
        message_body: `Setup your Razorpay payments today! Create a Payment Link and receive customer payments immediately. Link to dashboard: rzp.io/l/setup`
      };
    }

    if (campaignResult.message_body.length > 550) {
      showNotification("GUARDRAIL: Message too long. Truncating to safe fallback.", "warning");
      campaignResult.message_body = campaignResult.message_body.substring(0, 500) + "... [Truncated]";
    }

    previewBox.innerHTML = `
      <div style="font-weight: 500; font-size: 0.75rem; color: var(--accent-blue); margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
        <span>CHANNEL: ${campaignResult.channel}</span>
        <span>TAG: ${campaignResult.campaign_tag}</span>
      </div>
      <textarea id="editable-message-input" style="width: 100%; height: 130px; background: rgba(0, 0, 0, 0.3); color: var(--text-primary); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); font-family: inherit; font-size: 0.8rem; resize: none; outline: none; transition: border-color 0.2s; line-height: 1.5;" placeholder="Edit message body here...">${campaignResult.message_body}</textarea>
    `;

    const textarea = document.getElementById("editable-message-input");
    textarea.addEventListener("input", (e) => {
      rebuildPayloadJSON(campaignResult, e.target.value);
    });

    rebuildPayloadJSON(campaignResult, campaignResult.message_body);
    showNotification("Intervention compiled successfully!", "success");
  }, 1000);
}

// --- FEATURE 1: SANDBOX DRAWER ---
function renderSandboxTransactionsTable() {
  const tbody = document.getElementById("sandbox-transactions-log-body");
  const { transactions } = getSandboxState();

  if (transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No simulated payments in this session.</td>
      </tr>
    `;
    return;
  }

  const sortedTxs = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  
  tbody.innerHTML = sortedTxs.map(tx => {
    const m = merchants.find(mer => mer.merchant_id === tx.merchant_id);
    const mName = m ? (dslEnabled ? "Merchant (" + m.business_category + ")" : m.business_name) : "Unknown Merchant";
    return `
      <tr>
        <td style="padding: 0.4rem 0.5rem; font-family: monospace;">${tx.transaction_id}</td>
        <td style="padding: 0.4rem 0.5rem;"><i class="fas fa-wallet"></i> ${tx.upi_app} (${mName})</td>
        <td style="padding: 0.4rem 0.5rem; font-weight: 600; color: var(--accent-green);">₹${(tx.amount/100).toFixed(2)}</td>
        <td style="padding: 0.4rem 0.5rem; color: var(--text-secondary);">${new Date(tx.timestamp).toLocaleTimeString()}</td>
      </tr>
    `;
  }).join("");
}

function openSandboxDrawer() {
  if (!selectedMerchantId) return;
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);

  const displayName = dslEnabled ? "Merchant (" + m.business_category + ")" : m.business_name;
  document.getElementById("checkout-merchant-title").innerText = displayName;
  document.getElementById("phone-merchant-title").innerText = displayName;
  
  const vpaBase = dslEnabled ? sha256Mock(m.merchant_id) : m.merchant_id.substring(4);
  document.getElementById("checkout-merchant-vpa").innerText = `pay-${vpaBase}@razorpay`;

  // Reset phone UI states
  document.getElementById("phone-screen-apps").classList.add("active");
  document.getElementById("phone-screen-auth").classList.remove("active");
  document.getElementById("phone-screen-success").classList.remove("active");
  document.getElementById("phone-success-spinner").style.display = "flex";
  document.getElementById("phone-success-check").style.display = "none";

  // Smart navigation routing based on KYC and API Keys state (PRD Feature 4 routing)
  const state = getSandboxState();
  const hasKeys = state.api_keys && state.api_keys[m.merchant_id];

  if (m.first_txn_done && m.kyc_status === "APPROVED") {
    switchTab("payouts");
  } else if (m.bank_linked && !hasKeys) {
    switchTab("copilot");
  } else if (["REJECTED", "NOT_STARTED", "IN_PROGRESS"].includes(m.kyc_status)) {
    switchTab("ocr");
  } else {
    switchTab("checkout");
  }

  // Show drawer
  document.getElementById("sandbox-overlay").classList.add("active");
  document.getElementById("sandbox-drawer").classList.add("active");

  renderSandboxTransactionsTable();
}

let isPayoutAnimating = false;
let payoutTimeouts = [];

function closeSandboxDrawer() {
  if (isPayoutAnimating) {
    if (!confirm("A batch payout is in progress. Are you sure you want to cancel and exit?")) {
      return;
    }
    // Cancel timeouts
    payoutTimeouts.forEach(t => clearTimeout(t));
    payoutTimeouts = [];
    isPayoutAnimating = false;
    
    // Log cancelled payouts
    logCancelledPayouts();
  }
  document.getElementById("sandbox-overlay").classList.remove("active");
  document.getElementById("sandbox-drawer").classList.remove("active");
}

function switchTab(tabName) {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;

  const checkoutTabBtn = document.getElementById("tab-checkout-btn");
  const ocrTabBtn = document.getElementById("tab-ocr-btn");
  const payoutsTabBtn = document.getElementById("tab-payouts-btn");
  const copilotTabBtn = document.getElementById("tab-copilot-btn");
  const checkoutView = document.getElementById("sandbox-checkout-tab-view");
  const ocrView = document.getElementById("sandbox-ocr-tab-view");
  const payoutsView = document.getElementById("sandbox-payouts-tab-view");
  const copilotView = document.getElementById("sandbox-copilot-tab-view");

  if (tabName === "ocr" && (m.kyc_status === "APPROVED" || m.kyc_status === "PENDING_VERIFICATION")) {
    showNotification("KYC Document verification is already completed.", "warning");
    return; // Block entry (FB-F2-Lock)
  }

  if (tabName === "payouts" && (!m.first_txn_done || m.kyc_status !== "APPROVED")) {
    showNotification("Complete onboarding checkout and KYC approval to unlock Payouts Sandbox.", "warning");
    return; // Block entry (D7 activated constraint)
  }

  // Deactivate all
  checkoutTabBtn.classList.remove("active");
  ocrTabBtn.classList.remove("active");
  payoutsTabBtn.classList.remove("active");
  copilotTabBtn.classList.remove("active");
  checkoutView.classList.remove("active");
  ocrView.classList.remove("active");
  payoutsView.classList.remove("active");
  copilotView.classList.remove("active");

  if (tabName === "ocr") {
    ocrTabBtn.classList.add("active");
    ocrView.classList.add("active");
    resetOCRPanel();
  } else if (tabName === "payouts") {
    payoutsTabBtn.classList.add("active");
    payoutsView.classList.add("active");
    initPayoutsPanel();
  } else if (tabName === "copilot") {
    copilotTabBtn.classList.add("active");
    copilotView.classList.add("active");
    initCopilotPanel();
  } else {
    checkoutTabBtn.classList.add("active");
    checkoutView.classList.add("active");
  }
}

// --- FEATURE 3: RAZORPAY X PAYOUTS SANDBOX SIMULATOR ---
const PAYOUT_VENDORS = [
  { id: "vendor1", name: "Gupta Logistics", bank: "HDFC Bank", account: "xxxxxxx5920", amountPaise: 1250000, status: "Verified" },
  { id: "vendor2", name: "Apex Raw Materials", bank: "ICICI Bank", account: "xxxxxxx1024", amountPaise: 2200000, status: "Verified" },
  { id: "vendor3", name: "SaaS Infrastructure", bank: "SBI", account: "xxxxxxx8844", amountPaise: 350000, status: "Verified" },
  { id: "vendor4", name: "Freelance Designer", bank: "Axis Bank", account: "xxxxxxx3000", amountPaise: 300000, status: "Mismatched" }
];

function getMerchantWalletBalance(merchantId) {
  const state = getSandboxState();
  if (state.payout_balances[merchantId] === undefined) {
    state.payout_balances[merchantId] = 5000000; // default ₹50,000.00
    saveSandboxState(state);
  }
  return state.payout_balances[merchantId];
}

function updatePayoutWalletDisplay() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;
  const balance = getMerchantWalletBalance(m.merchant_id);
  const displayVal = (balance / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById("payout-wallet-balance-display").innerText = "₹" + displayVal;
}

function rechargeMerchantWallet() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;
  
  const state = getSandboxState();
  state.payout_balances[m.merchant_id] = 5000000; // Reset to ₹50,000.00
  saveSandboxState(state);
  
  updatePayoutWalletDisplay();
  recalculatePayoutTotal();
  showNotification("Wallet balance recharged to ₹50,000.00!", "success");
}

function renderPayoutVendors() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;
  
  const container = document.getElementById("payout-vendors-container");
  container.innerHTML = "";
  
  const state = getSandboxState();
  
  PAYOUT_VENDORS.forEach(v => {
    let currentStatus = v.status;
    if (v.id === "vendor4") {
      currentStatus = state.vendor_status_overrides[m.merchant_id + "_vendor4"] || "Mismatched";
    }
    
    let currentName = v.name;
    if (v.id === "vendor4" && currentStatus === "Verified") {
      currentName = "Suresh Kumar";
    }
    
    let statusClass = "diff-val-ok";
    if (currentStatus === "Mismatched") {
      statusClass = "diff-val-bad";
    } else if (currentStatus === "ForceHold") {
      statusClass = "diff-val-bad";
    }
    
    const row = document.createElement("div");
    row.className = "payout-vendor-row";
    row.style.display = "flex";
    row.style.flexDirection = "column";
    row.style.gap = "0.2rem";
    row.style.padding = "0.4rem";
    row.style.background = "rgba(255, 255, 255, 0.02)";
    row.style.border = "1px solid rgba(255, 255, 255, 0.04)";
    row.style.borderRadius = "6px";
    
    let statusLabel = currentStatus;
    if (currentStatus === "ForceHold") {
      statusLabel = "Risk Hold";
    }
    
    row.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.65rem; font-weight: 500; cursor: pointer;">
          <input type="checkbox" class="payout-vendor-checkbox" data-vendor-id="${v.id}">
          <span class="payout-vendor-name" style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${currentName}</span>
        </label>
        <span style="font-size: 0.55rem; font-weight: 500;" class="${statusClass}">${statusLabel}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.55rem; color: var(--text-secondary); margin-left: 1.15rem;">
        <span>${v.bank} · ${v.account}</span>
        <div style="display: flex; align-items: center; gap: 0.15rem;">
          <span>₹</span>
          <input type="number" class="payout-amount-input" data-vendor-id="${v.id}" value="${(v.amountPaise / 100).toFixed(2)}" style="width: 65px; font-size: 0.55rem; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.1rem 0.2rem; border-radius: 4px; text-align: right; outline: none;" step="0.01" min="1">
        </div>
      </div>
    `;
    
    container.appendChild(row);
  });
  
  // Bind change/input listeners
  const checkboxes = container.querySelectorAll(".payout-vendor-checkbox");
  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      recalculatePayoutTotal();
      updatePayAllHeaderCheckbox();
    });
  });
  
  const amountInputs = container.querySelectorAll(".payout-amount-input");
  amountInputs.forEach(input => {
    input.addEventListener("input", (e) => {
      let val = parseFloat(e.target.value) || 0;
      const balance = getMerchantWalletBalance(m.merchant_id);
      const balanceLimit = balance / 100;
      
      if (val < 1) {
        val = 1;
      } else if (val > balanceLimit) {
        val = balanceLimit;
      }
      recalculatePayoutTotal();
    });
    
    input.addEventListener("blur", (e) => {
      let val = parseFloat(e.target.value) || 0;
      const balance = getMerchantWalletBalance(m.merchant_id);
      const balanceLimit = balance / 100;
      
      if (val < 1) val = 1;
      if (val > balanceLimit) val = balanceLimit;
      
      e.target.value = val.toFixed(2);
      recalculatePayoutTotal();
    });
  });
}

function updatePayAllHeaderCheckbox() {
  const container = document.getElementById("payout-vendors-container");
  const checkboxes = container.querySelectorAll(".payout-vendor-checkbox");
  const checked = container.querySelectorAll(".payout-vendor-checkbox:checked");
  const payAll = document.getElementById("payout-select-all-vendors");
  
  if (checkboxes.length > 0 && checked.length === checkboxes.length) {
    payAll.checked = true;
  } else {
    payAll.checked = false;
  }
}

function toggleAllPayoutVendors(checked) {
  const container = document.getElementById("payout-vendors-container");
  const checkboxes = container.querySelectorAll(".payout-vendor-checkbox");
  checkboxes.forEach(cb => {
    cb.checked = checked;
  });
  recalculatePayoutTotal();
}

function recalculatePayoutTotal() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;
  
  const balance = getMerchantWalletBalance(m.merchant_id);
  const container = document.getElementById("payout-vendors-container");
  const checkedBoxes = container.querySelectorAll(".payout-vendor-checkbox:checked");
  
  let totalPaise = 0;
  checkedBoxes.forEach(cb => {
    const row = cb.closest(".payout-vendor-row");
    const amountInput = row.querySelector(".payout-amount-input");
    const val = parseFloat(amountInput.value) || 0;
    totalPaise += Math.round(val * 100);
  });
  
  const warningBanner = document.getElementById("payouts-balance-warning");
  const execBtn = document.getElementById("btn-execute-payout");
  
  if (totalPaise > balance) {
    warningBanner.style.display = "block";
    execBtn.disabled = true;
  } else {
    warningBanner.style.display = "none";
    execBtn.disabled = checkedBoxes.length === 0;
  }
}

function initPayoutsPanel() {
  isPayoutAnimating = false;
  payoutTimeouts.forEach(t => clearTimeout(t));
  payoutTimeouts = [];
  
  document.getElementById("payouts-empty-state").style.display = "flex";
  document.getElementById("payouts-progress-container").style.display = "none";
  document.getElementById("payouts-mismatch-panel").style.display = "none";
  document.getElementById("payouts-success-panel").style.display = "none";
  document.getElementById("payouts-balance-warning").style.display = "none";
  
  document.getElementById("btn-execute-payout").disabled = true;
  document.getElementById("payout-select-all-vendors").checked = false;
  document.getElementById("payout-select-all-vendors").disabled = false;
  
  updatePayoutWalletDisplay();
  renderPayoutVendors();
  renderPayoutTransactionsLog();
}

function logCancelledPayouts() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;
  
  const container = document.getElementById("payout-vendors-container");
  if (!container) return;
  
  const checkedBoxes = container.querySelectorAll(".payout-vendor-checkbox:checked");
  if (checkedBoxes.length === 0) return;
  
  const state = getSandboxState();
  if (!state.payout_transactions[m.merchant_id]) {
    state.payout_transactions[m.merchant_id] = [];
  }
  
  checkedBoxes.forEach(cb => {
    const vendorId = cb.dataset.vendorId;
    const vendor = PAYOUT_VENDORS.find(v => v.id === vendorId);
    if (!vendor) return;
    
    const row = cb.closest(".payout-vendor-row");
    const amountInput = row.querySelector(".payout-amount-input");
    const val = parseFloat(amountInput.value) || 0;
    const amountPaise = Math.round(val * 100);
    
    const newTx = {
      payout_id: "pout_sb_" + Math.random().toString(36).substring(2, 8),
      vendor_name: vendor.name,
      amount: amountPaise,
      status: "CANCELLED",
      timestamp: Date.now()
    };
    
    state.payout_transactions[m.merchant_id].unshift(newTx);
  });
  
  state.payout_transactions[m.merchant_id] = state.payout_transactions[m.merchant_id].slice(0, 10);
  
  saveSandboxState(state);
  renderPayoutTransactionsLog();
}

function renderPayoutTransactionsLog() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;
  
  const tbody = document.getElementById("payout-transactions-log-body");
  const state = getSandboxState();
  const txs = state.payout_transactions[m.merchant_id] || [];
  
  if (txs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 0.8rem;">No payouts executed in this session.</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = txs.map(tx => {
    let statusClass = "diff-val-ok";
    let statusLabel = tx.status;
    let styleAttr = "";
    
    if (tx.status === "RISK_REVIEW_HOLD") {
      statusLabel = "RISK HOLD";
      styleAttr = `style="color: var(--accent-yellow); font-weight: 600;"`;
    } else if (tx.status === "CANCELLED") {
      styleAttr = `style="color: var(--accent-red); font-weight: 600; text-decoration: none; background: none; padding: 0;"`;
    } else {
      styleAttr = `style="color: var(--accent-green); font-weight: 600;"`;
    }
    
    return `
      <tr>
        <td style="padding: 0.3rem 0.4rem; font-family: monospace;">${tx.payout_id}</td>
        <td style="padding: 0.3rem 0.4rem;">${tx.vendor_name}</td>
        <td style="padding: 0.3rem 0.4rem; font-weight: 600;">₹${(tx.amount/100).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td style="padding: 0.3rem 0.4rem;" ${styleAttr}>${statusLabel}</td>
        <td style="padding: 0.3rem 0.4rem; color: var(--text-secondary);">${new Date(tx.timestamp).toLocaleTimeString()}</td>
      </tr>
    `;
  }).join("");
}

function executeBatchPayout() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;
  
  const balance = getMerchantWalletBalance(m.merchant_id);
  const container = document.getElementById("payout-vendors-container");
  const checkedBoxes = container.querySelectorAll(".payout-vendor-checkbox:checked");
  if (checkedBoxes.length === 0) return;
  
  let totalPaise = 0;
  checkedBoxes.forEach(cb => {
    const row = cb.closest(".payout-vendor-row");
    const amountInput = row.querySelector(".payout-amount-input");
    const val = parseFloat(amountInput.value) || 0;
    totalPaise += Math.round(val * 100);
  });
  
  if (totalPaise > balance) {
    showNotification("Insufficient balance for this batch payout.", "error");
    return;
  }
  
  isPayoutAnimating = true;
  payoutTimeouts = [];
  
  document.getElementById("payout-select-all-vendors").disabled = true;
  document.getElementById("btn-execute-payout").disabled = true;
  document.getElementById("btn-recharge-wallet").disabled = true;
  container.querySelectorAll(".payout-vendor-checkbox").forEach(cb => cb.disabled = true);
  container.querySelectorAll(".payout-amount-input").forEach(inp => inp.disabled = true);
  
  document.getElementById("payouts-empty-state").style.display = "none";
  document.getElementById("payouts-mismatch-panel").style.display = "none";
  document.getElementById("payouts-success-panel").style.display = "none";
  document.getElementById("payouts-balance-warning").style.display = "none";
  
  const progressContainer = document.getElementById("payouts-progress-container");
  const progressText = document.getElementById("payouts-progress-text");
  const progressBar = document.getElementById("payouts-progress-bar");
  
  progressContainer.style.display = "flex";
  progressBar.style.width = "0%";
  progressText.innerText = "Verifying vendor accounts...";
  
  // Phase 1 (Verification - 0.5s): Progress bar 0%-25%
  let t1 = setTimeout(() => {
    progressBar.style.width = "25%";
    
    const vendor4Check = container.querySelector(".payout-vendor-checkbox[data-vendor-id='vendor4']");
    const state = getSandboxState();
    const vendor4Status = state.vendor_status_overrides[m.merchant_id + "_vendor4"] || "Mismatched";
    
    if (vendor4Check && vendor4Check.checked && vendor4Status === "Mismatched") {
      progressContainer.style.display = "none";
      document.getElementById("payouts-mismatch-panel").style.display = "flex";
      showNotification("Beneficiary Name Mismatch Detected", "error");
    } else {
      runPhase2And3(totalPaise);
    }
  }, 500);
  payoutTimeouts.push(t1);
}

function runPhase2And3(totalPaise) {
  const progressContainer = document.getElementById("payouts-progress-container");
  const progressText = document.getElementById("payouts-progress-text");
  const progressBar = document.getElementById("payouts-progress-bar");
  
  progressContainer.style.display = "flex";
  document.getElementById("payouts-mismatch-panel").style.display = "none";
  
  // Phase 2 (Debit - 0.4s): Progress bar 25%-50%
  progressText.innerText = "Debiting wallet balance...";
  let t2 = setTimeout(() => {
    progressBar.style.width = "50%";
    
    // Phase 3 (Disbursement - 0.6s): Progress bar 50%-100%
    progressText.innerText = "Sending instant IMPS payouts...";
    let t3 = setTimeout(() => {
      progressBar.style.width = "100%";
      
      setTimeout(() => {
        completeSuccessfulPayouts(totalPaise);
      }, 200);
      
    }, 600);
    payoutTimeouts.push(t3);
  }, 400);
  payoutTimeouts.push(t2);
}

function completeSuccessfulPayouts(totalPaise) {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;
  
  isPayoutAnimating = false;
  payoutTimeouts = [];
  
  const state = getSandboxState();
  
  const currentBalance = getMerchantWalletBalance(m.merchant_id);
  state.payout_balances[m.merchant_id] = currentBalance - totalPaise;
  
  const container = document.getElementById("payout-vendors-container");
  const checkedBoxes = container.querySelectorAll(".payout-vendor-checkbox:checked");
  
  if (!state.payout_transactions[m.merchant_id]) {
    state.payout_transactions[m.merchant_id] = [];
  }
  
  let sVendorCount = 0;
  checkedBoxes.forEach(cb => {
    const vendorId = cb.dataset.vendorId;
    const vendor = PAYOUT_VENDORS.find(v => v.id === vendorId);
    if (!vendor) return;
    
    const row = cb.closest(".payout-vendor-row");
    const amountInput = row.querySelector(".payout-amount-input");
    const val = parseFloat(amountInput.value) || 0;
    const amountPaise = Math.round(val * 100);
    
    let txnStatus = "SUCCESS";
    if (vendorId === "vendor4") {
      const currentStatus = state.vendor_status_overrides[m.merchant_id + "_vendor4"] || "Mismatched";
      if (currentStatus === "ForceHold") {
        txnStatus = "RISK_REVIEW_HOLD";
      }
    }
    
    let displayName = vendor.name;
    if (vendorId === "vendor4") {
      const currentStatus = state.vendor_status_overrides[m.merchant_id + "_vendor4"] || "Mismatched";
      if (currentStatus === "Verified") {
        displayName = "Suresh Kumar";
      }
    }
    
    const newTx = {
      payout_id: "pout_sb_" + Math.random().toString(36).substring(2, 8),
      vendor_name: displayName,
      amount: amountPaise,
      status: txnStatus,
      timestamp: Date.now()
    };
    
    state.payout_transactions[m.merchant_id].unshift(newTx);
    sVendorCount++;
  });
  
  state.payout_transactions[m.merchant_id] = state.payout_transactions[m.merchant_id].slice(0, 10);
  
  saveSandboxState(state);
  
  playChime();
  if (window.confetti) {
    window.confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  }
  
  document.getElementById("payouts-progress-container").style.display = "none";
  const successPanel = document.getElementById("payouts-success-panel");
  successPanel.style.display = "flex";
  
  const formattedDebit = (totalPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById("payouts-success-message").innerHTML = `
    Batch payout of <strong>₹${formattedDebit}</strong> for ${sVendorCount} vendors processed successfully.
  `;
  
  updatePayoutWalletDisplay();
  renderPayoutVendors();
  renderPayoutTransactionsLog();
  
  document.getElementById("payout-select-all-vendors").disabled = false;
  document.getElementById("btn-recharge-wallet").disabled = false;
  
  showNotification("Batch payout completed successfully!", "success");
}

function handleVendorRemediation(action) {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;
  
  const container = document.getElementById("payout-vendors-container");
  const vendor4Check = container.querySelector(".payout-vendor-checkbox[data-vendor-id='vendor4']");
  const state = getSandboxState();
  
  if (action === "correct") {
    state.vendor_status_overrides[m.merchant_id + "_vendor4"] = "Verified";
    saveSandboxState(state);
    
    showNotification("Vendor profile name updated to Suresh Kumar!", "success");
    
    renderPayoutVendors();
    const newV4Check = container.querySelector(".payout-vendor-checkbox[data-vendor-id='vendor4']");
    if (newV4Check) newV4Check.checked = true;
    
    let totalPaise = 0;
    const checkedBoxes = container.querySelectorAll(".payout-vendor-checkbox:checked");
    checkedBoxes.forEach(cb => {
      const row = cb.closest(".payout-vendor-row");
      const amountInput = row.querySelector(".payout-amount-input");
      const val = parseFloat(amountInput.value) || 0;
      totalPaise += Math.round(val * 100);
    });
    
    document.getElementById("payouts-mismatch-panel").style.display = "none";
    runPhase2And3(totalPaise);
    
  } else if (action === "skip") {
    if (vendor4Check) {
      vendor4Check.checked = false;
    }
    
    showNotification("Vendor Freelance Designer skipped from batch.", "warning");
    
    let totalPaise = 0;
    const checkedBoxes = container.querySelectorAll(".payout-vendor-checkbox:checked");
    checkedBoxes.forEach(cb => {
      const row = cb.closest(".payout-vendor-row");
      const amountInput = row.querySelector(".payout-amount-input");
      const val = parseFloat(amountInput.value) || 0;
      totalPaise += Math.round(val * 100);
    });
    
    document.getElementById("payouts-mismatch-panel").style.display = "none";
    
    if (checkedBoxes.length === 0) {
      initPayoutsPanel();
      showNotification("Batch payout cancelled: no remaining vendors selected.", "warning");
    } else {
      runPhase2And3(totalPaise);
    }
    
  } else if (action === "force") {
    state.vendor_status_overrides[m.merchant_id + "_vendor4"] = "ForceHold";
    saveSandboxState(state);
    
    showNotification("Transfer forced. Risk review hold applied.", "warning");
    
    let totalPaise = 0;
    const checkedBoxes = container.querySelectorAll(".payout-vendor-checkbox:checked");
    checkedBoxes.forEach(cb => {
      const row = cb.closest(".payout-vendor-row");
      const amountInput = row.querySelector(".payout-amount-input");
      const val = parseFloat(amountInput.value) || 0;
      totalPaise += Math.round(val * 100);
    });
    
    document.getElementById("payouts-mismatch-panel").style.display = "none";
    runPhase2And3(totalPaise);
  }
}

function selectUPIAppForSim(appName) {
  selectedUPIApp = appName;
  document.getElementById("phone-app-header-title").innerText = appName;
  document.getElementById("phone-screen-apps").classList.remove("active");
  document.getElementById("phone-screen-auth").classList.add("active");
}

function executeSimulatedPayment() {
  if (!selectedMerchantId) return;
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);

  document.getElementById("phone-screen-auth").classList.remove("active");
  document.getElementById("phone-screen-success").classList.add("active");

  setTimeout(() => {
    playChime();
    
    if (window.confetti) {
      window.confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }

    document.getElementById("phone-success-spinner").style.display = "none";
    document.getElementById("phone-success-check").style.display = "flex";

    const state = getSandboxState();
    const newTxId = "pay_sb_" + Math.random().toString(36).substring(2, 10);
    
    state.transactions.push({
      transaction_id: newTxId,
      merchant_id: m.merchant_id,
      amount: 1000,
      upi_app: selectedUPIApp,
      timestamp: Date.now()
    });

    const isTier3 = classifyTier(m) === "Tier 3";
    const rewardVal = isTier3 ? 10000 : 50000;

    state.rewards[m.merchant_id] = {
      merchant_id: m.merchant_id,
      credit_amount: rewardVal,
      expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      activated: true
    };

    saveSandboxState(state);
    m.first_txn_done = true;

    setTimeout(() => {
      closeSandboxDrawer();
      selectMerchant(m.merchant_id);
      renderTable();
      renderFunnel();
      renderActiveRewardBadge();
      showNotification(`Simulation Success! Welcome credit unlocked.`, "success");
    }, 1200);

  }, 1200);
}

function toggleSandboxSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById("sandbox-mute-btn");
  if (soundEnabled) {
    btn.innerHTML = `<i class="fas fa-volume-up"></i>`;
    btn.title = "Mute sandbox sounds";
    showNotification("Sandbox sound effects enabled", "success");
  } else {
    btn.innerHTML = `<i class="fas fa-volume-mute"></i>`;
    btn.title = "Unmute sandbox sounds";
    showNotification("Sandbox sound effects muted", "warning");
  }
}

// --- FEATURE 2: OCR TESTING MODULES ---
function resetOCRPanel() {
  document.getElementById("ocr-drop-prompt").style.display = "flex";
  document.getElementById("ocr-drop-loader").style.display = "none";
  document.getElementById("ocr-empty-state").style.display = "flex";
  document.getElementById("ocr-result-content").style.display = "none";
  document.getElementById("ocr-presets-container").style.opacity = "1";
}

function simulateOCRCheck(scenario) {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;

  // Show scanning loading state
  document.getElementById("ocr-drop-prompt").style.display = "none";
  document.getElementById("ocr-drop-loader").style.display = "flex";
  document.getElementById("ocr-presets-container").style.opacity = "0.4";
  
  document.getElementById("ocr-empty-state").style.display = "none";
  document.getElementById("ocr-result-content").style.display = "none";

  setTimeout(() => {
    document.getElementById("ocr-drop-loader").style.display = "none";
    document.getElementById("ocr-drop-prompt").style.display = "flex";
    document.getElementById("ocr-presets-container").style.opacity = "1";

    const resultContent = document.getElementById("ocr-result-content");
    resultContent.style.display = "flex";

    if (scenario === "blur") {
      resultContent.innerHTML = `
        <div style="padding: 0.5rem; background: rgba(245, 158, 11, 0.1); border: 1px solid var(--accent-yellow); border-radius: 8px; color: var(--accent-yellow);">
          <h4 style="font-weight:600;"><i class="fas fa-exclamation-triangle"></i> OCR Document Blur Alert (ERR_OCR_BLUR)</h4>
          <p style="font-size:0.65rem; margin-top:0.25rem; color: var(--text-primary);">
            The scanned document is blurry (confidence index 42%). Ensure the lighting is bright and card text is legible.
          </p>
        </div>
      `;
      showNotification("Document Blur Warning", "warning");
    } else if (scenario === "unsigned") {
      resultContent.innerHTML = `
        <div style="padding: 0.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-red); border-radius: 8px; color: var(--accent-red);">
          <h4 style="font-weight:600;"><i class="fas fa-signature"></i> Signature Missing (ERR_SIGNATURE_MISSING)</h4>
          <p style="font-size:0.65rem; margin-top:0.25rem; color: var(--text-primary);">
            The signature box on your PAN Card/GST certificate is empty. Please sign the card physically and re-upload.
          </p>
        </div>
      `;
      showNotification("Signature Box Missing", "error");
    } else if (scenario === "mismatch") {
      const displayProfileName = m.business_name;
      resultContent.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          <div style="padding: 0.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-red); border-radius: 8px; color: var(--accent-red);">
            <h4 style="font-weight:600;"><i class="fas fa-id-card"></i> Name Mismatch (ERR_NAME_MISMATCH)</h4>
            <p style="font-size:0.65rem; margin-top:0.25rem; color: var(--text-primary);">
              The legal name extracted from the document does not match your registered profile.
            </p>
          </div>
          <div class="name-diff-card">
            <div class="diff-row">
              <span class="diff-label">Registered Name:</span>
              <span class="diff-val-ok">${displayProfileName}</span>
            </div>
            <div class="diff-row">
              <span class="diff-label">Extracted OCR PAN Name:</span>
              <span class="diff-val-bad">Komal Sharma</span>
            </div>
          </div>
          <button id="btn-remediate-profile-name" class="btn-remediate-name">
            <i class="fas fa-edit"></i> Update Registered Profile Name to Match Document
          </button>
        </div>
      `;
      
      document.getElementById("btn-remediate-profile-name").addEventListener("click", () => {
        executeProfileNameCorrection("Komal Sharma");
      });
      showNotification("Name Mismatch Detected", "error");
    } else if (scenario === "clean") {
      playChime();
      if (window.confetti) {
        window.confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      }

      resultContent.innerHTML = `
        <div style="padding: 0.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid var(--accent-green); border-radius: 8px; color: var(--accent-green); display:flex; flex-direction:column; gap:0.4rem;">
          <h4 style="font-weight:600;"><i class="fas fa-check-circle"></i> pre-verification Success!</h4>
          <p style="font-size:0.65rem; color: var(--text-primary);">
            KYC document matches legal criteria. Pending final processing queues.
          </p>
          <span style="font-size:0.55rem; color: var(--text-muted); font-style:italic;">*Est. Settlement Processing: 2 Hours</span>
        </div>
      `;

      // Save APPROVED override to localStorage
      const state = getSandboxState();
      state.kyc_overrides[m.merchant_id] = "APPROVED";
      saveSandboxState(state);

      // Update in-memory
      m.kyc_status = "APPROVED";
      
      // Update UI components
      renderTable();
      renderFunnel();
      selectMerchant(m.merchant_id);
      
      showNotification("OCR pre-verification Successful!", "success");
    }
  }, 1200);
}

function executeProfileNameCorrection(correctedName) {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;

  const state = getSandboxState();
  state.name_overrides[m.merchant_id] = correctedName;
  saveSandboxState(state);

  m.business_name = correctedName;

  // Display a transitional success state inside the result box (FB-F2-04)
  const resultContent = document.getElementById("ocr-result-content");
  resultContent.innerHTML = `
    <div style="padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border: 1px solid var(--accent-green); border-radius: 8px; color: var(--accent-green); display:flex; flex-direction:column; gap:0.2rem; align-items:center; text-align:center; animation: popScale 0.3s ease;">
      <h4 style="font-weight:600;"><i class="fas fa-check-double"></i> ✓ Registered Profile Name Updated</h4>
      <p style="font-size:0.6rem; color: var(--text-primary);">
        Name updated to "${correctedName}". Synchronizing database and re-triggering scan...
      </p>
    </div>
  `;

  showNotification("Profile name successfully synchronized!", "success");
  
  // Delay 0.6 seconds before auto-running the clean check (FB-F2-04)
  setTimeout(() => {
    selectMerchant(m.merchant_id);
    renderTable();
    simulateOCRCheck("clean");
  }, 600);
}

// --- CSV/JSON UPLOADER & DOWNLOAD TEMPLATE MODULE ---
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    
    if (file.name.endsWith(".json")) {
      try {
        const data = JSON.parse(text);
        processUploadedData(data);
      } catch (err) {
        showNotification("INVALID FILE: Corrupt JSON structure.", "error");
      }
    } else if (file.name.endsWith(".csv")) {
      parseCSV(text);
    } else {
      showNotification("UNSUPPORTED FILE: Please upload CSV or JSON.", "error");
    }
  };
  reader.readAsText(file);
}

function parseCSV(text) {
  const lines = text.split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  const results = [];
  let isFaulty = false;

  const requiredHeaders = ["merchant_id", "business_name", "business_category", "est_monthly_revenue", "kyc_status", "bank_linked", "first_txn_done"];
  const hasHeaders = requiredHeaders.every(h => headers.includes(h));

  if (!hasHeaders) {
    showNotification("VALIDATION ERROR: Missing required headers in CSV.", "error");
    return;
  }

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(",").map(v => v.trim());
    
    if (values.length !== headers.length) {
      isFaulty = true;
      continue;
    }

    const row = {};
    headers.forEach((h, index) => {
      row[h] = values[index];
    });

    row.est_monthly_revenue = parseFloat(row.est_monthly_revenue) || 0;
    row.bank_linked = row.bank_linked === "true" || row.bank_linked === "1";
    row.first_txn_done = row.first_txn_done === "true" || row.first_txn_done === "1";

    results.push(row);
  }

  if (isFaulty) {
    showNotification("WARNING: Skipped malformed rows during ingestion.", "warning");
  }

  processUploadedData(results);
}

function processUploadedData(data) {
  if (!Array.isArray(data)) {
    showNotification("VALIDATION ERROR: Uploaded dataset must be an array.", "error");
    return;
  }

  const isValid = data.every(row => {
    return row.merchant_id && row.business_name && row.business_category && row.kyc_status;
  });

  if (!isValid) {
    showNotification("SCHEMA ERROR: Missing critical columns on uploaded items.", "error");
    return;
  }

  data.forEach(item => {
    const idx = merchants.findIndex(m => m.merchant_id === item.merchant_id);
    if (idx >= 0) {
      merchants[idx] = item;
    } else {
      merchants.push(item);
    }
  });

  showNotification(`Successfully ingested ${data.length} merchants!`, "success");
  renderTable();
  renderFunnel();
}

function copyPayload() {
  const codeBox = document.getElementById("payload-code-box");
  navigator.clipboard.writeText(codeBox.innerText);
  showNotification("JSON payload copied to clipboard!", "success");
}

// --- EVENT BINDINGS & INIT ---
document.addEventListener("DOMContentLoaded", () => {
  // Sync state from consolidated storage
  syncPersistedState();
  
  renderFunnel();
  renderTable();

  const dslSwitch = document.getElementById("dsl-switch");
  dslSwitch.addEventListener("change", (e) => {
    dslEnabled = e.target.checked;
    renderTable();
    if (selectedMerchantId) {
      selectMerchant(selectedMerchantId);
    }
  });

  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTable();
      renderFunnel();
    });
  });

  const delaySlider = document.getElementById("delay-slider");
  const delayVal = document.getElementById("delay-val");
  delaySlider.addEventListener("input", (e) => {
    nudgeDelayValue = e.target.value;
    delayVal.innerText = nudgeDelayValue + " Days";
  });

  const incentiveSlider = document.getElementById("incentive-slider");
  const incentiveVal = document.getElementById("incentive-val");
  incentiveSlider.addEventListener("input", (e) => {
    incentiveValue = e.target.value;
    incentiveVal.innerText = "₹" + incentiveValue;
  });

  document.getElementById("csv-file-input").addEventListener("change", handleFileUpload);

  document.getElementById("download-template-link").addEventListener("click", (e) => {
    e.preventDefault();
    const csvContent = "merchant_id,business_name,business_category,est_monthly_revenue,kyc_status,bank_linked,first_txn_done,promoter_name\n" +
                       "mer_custom01,Delhi Craft Store,Retail,85000,APPROVED,true,false,Raj Kumar\n" +
                       "mer_custom02,Sita Garments,Individual/Hobby,12000,REJECTED,false,false,Sita Devi";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "maiq_cohort_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("CSV Template downloaded!", "success");
  });

  document.getElementById("run-engine-btn").addEventListener("click", runInterventionEngine);
  document.getElementById("copy-payload-btn").addEventListener("click", copyPayload);

  // --- DRAWER LAYOUT CONTROLS ---
  document.getElementById("sandbox-trigger-btn").addEventListener("click", openSandboxDrawer);
  document.getElementById("exit-sandbox-btn").addEventListener("click", closeSandboxDrawer);
  document.getElementById("sandbox-overlay").addEventListener("click", closeSandboxDrawer);
  document.getElementById("sandbox-mute-btn").addEventListener("click", toggleSandboxSound);

  // Drawer Tabs switcher listeners (Feature 2, 3 & 4)
  document.getElementById("tab-checkout-btn").addEventListener("click", () => switchTab("checkout"));
  document.getElementById("tab-ocr-btn").addEventListener("click", () => switchTab("ocr"));
  document.getElementById("tab-payouts-btn").addEventListener("click", () => switchTab("payouts"));
  document.getElementById("tab-copilot-btn").addEventListener("click", () => switchTab("copilot"));

  // AI Copilot triggers & listeners
  document.getElementById("btn-copilot-generate-keys").addEventListener("click", generateSandboxAPIKeys);
  document.getElementById("btn-copilot-test-webhook").addEventListener("click", simulateWebhookTest);
  
  document.getElementById("copilot-chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("copilot-chat-input");
    handleCopilotMessageSubmit(input.value);
  });

  const quickPrompts = document.querySelectorAll(".quick-prompt-btn");
  quickPrompts.forEach(btn => {
    btn.addEventListener("click", () => {
      handleCopilotMessageSubmit(btn.dataset.prompt);
    });
  });

  const langBtns = document.querySelectorAll("#copilot-code-langs button");
  langBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      activeCodeLang = btn.dataset.lang;
      updateCodeLangButtonsUI();
      updateCopilotCodeView();
    });
  });

  document.getElementById("btn-copilot-copy-code").addEventListener("click", () => {
    const pre = document.getElementById("copilot-code-pre");
    navigator.clipboard.writeText(pre.innerText);
    showNotification("Integration code copied to clipboard!", "success");
  });

  // Payout Sandbox triggers
  document.getElementById("btn-execute-payout").addEventListener("click", executeBatchPayout);
  document.getElementById("btn-recharge-wallet").addEventListener("click", rechargeMerchantWallet);
  
  document.getElementById("payout-select-all-vendors").addEventListener("change", (e) => {
    toggleAllPayoutVendors(e.target.checked);
  });
  
  // Payout Mismatch Remediation Console buttons
  document.getElementById("btn-payout-remediate-correct").addEventListener("click", () => handleVendorRemediation("correct"));
  document.getElementById("btn-payout-remediate-skip").addEventListener("click", () => handleVendorRemediation("skip"));
  document.getElementById("btn-payout-remediate-force").addEventListener("click", () => handleVendorRemediation("force"));

  const phoneAppBtns = document.querySelectorAll(".upi-app-btn");
  phoneAppBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      selectUPIAppForSim(btn.dataset.app);
    });
  });

  document.getElementById("btn-approve-payment").addEventListener("click", executeSimulatedPayment);

  // --- OCR PRESET WORKSPACE TRIGGERS (Feature 2) ---
  document.getElementById("btn-load-blur").addEventListener("click", () => simulateOCRCheck("blur"));
  document.getElementById("btn-load-unsigned").addEventListener("click", () => simulateOCRCheck("unsigned"));
  document.getElementById("btn-load-mismatch").addEventListener("click", () => simulateOCRCheck("mismatch"));
  document.getElementById("btn-load-clean").addEventListener("click", () => simulateOCRCheck("clean"));

  // Drag and drop event listeners for visual hover state & file validation (FB-F2-01 & FB-F2-03)
  const dropzone = document.getElementById("ocr-dropzone");
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
        if (m && (m.kyc_status === "APPROVED" || m.kyc_status === "PENDING_VERIFICATION")) {
          // Locked state (FB-F2-CPO-Lock)
          return;
        }
        dropzone.classList.add("dragover");
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("dragover");
      }, false);
    });

    dropzone.addEventListener("drop", (e) => {
      const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
      if (m && (m.kyc_status === "APPROVED" || m.kyc_status === "PENDING_VERIFICATION")) {
        showNotification("KYC is already completed for this merchant.", "warning");
        return; // Locked state (FB-F2-CPO-Lock)
      }
      
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        const file = files[0];
        const name = file.name.toLowerCase();
        if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".pdf")) {
          showNotification("Mock file detected. Scanning...", "success");
          simulateOCRCheck("clean");
        } else {
          showNotification("UNSUPPORTED FILE: Only PDF, PNG, and JPEG formats are accepted.", "error");
        }
      }
    }, false);
  }
});

// --- FEATURE 4: AI INTEGRATION COPILOT SIMULATOR ---
let activeCodeLang = "node";

const COPILOT_CODE_TEMPLATES = {
  node: `const Razorpay = require('razorpay');
const rzp = new Razorpay({
  key_id: 'KEY_ID_PLACEHOLDER',
  key_secret: 'YOUR_KEY_SECRET'
});

// Create Order
rzp.orders.create({
  amount: 1000, // in paise (₹10.00)
  currency: 'INR',
  receipt: 'receipt_order_1'
}, (err, order) => {
  console.log("Order Created:", order.id);
});`,

  php: `<?php
require('razorpay-php/Razorpay.php');
use Razorpay\\Api\\Api;

$api = new Api('KEY_ID_PLACEHOLDER', 'YOUR_KEY_SECRET');

// Create Order
$order = $api->order->create([
  'receipt' => 'receipt_order_1',
  'amount' => 1000, // in paise
  'currency' => 'INR'
]);
echo "Order ID: " . $order['id'];
?>`,

  py: `import razorpay
client = razorpay.Client(auth=("KEY_ID_PLACEHOLDER", "YOUR_KEY_SECRET"))

# Create Order
order = client.order.create({
  "amount": 1000, # in paise
  "currency": "INR",
  "receipt": "receipt_order_1"
})
print("Order ID:", order["id"])`
};

function initCopilotPanel() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;

  // Reset Webhook log display
  document.getElementById("copilot-webhook-log").style.display = "none";
  document.getElementById("copilot-webhook-log").innerHTML = "";
  document.getElementById("copilot-webhook-url").value = "";
  document.getElementById("btn-copilot-test-webhook").disabled = true;

  // Set default code lang
  activeCodeLang = "node";
  updateCodeLangButtonsUI();
  updateCopilotCodeView();

  // Clear chat
  const chatMessages = document.getElementById("copilot-chat-messages");
  chatMessages.innerHTML = "";

  const state = getSandboxState();
  const hasKeys = state.api_keys && state.api_keys[m.merchant_id];

  // Welcome message
  let welcomeText = `Hi! I am your AI Integration Copilot. I can help you with your technical setup, generate API credentials, show integration scripts, or test mock webhooks. What would you like to build today?`;
  if (hasKeys) {
    welcomeText = `I see you've already generated your API credentials! You can view your credentials ID in the widget on the right, copy your customized integration code snippets, or trigger a test webhook.`;
  }
  
  appendCopilotChatBubble("copilot", welcomeText);
  updateCopilotKeysWidget();
}

function updateCodeLangButtonsUI() {
  const container = document.getElementById("copilot-code-langs");
  if (!container) return;
  container.querySelectorAll("button").forEach(btn => {
    if (btn.dataset.lang === activeCodeLang) {
      btn.style.background = "var(--accent-blue-glow)";
      btn.style.color = "var(--accent-blue)";
      btn.style.borderColor = "var(--border-highlight)";
      btn.classList.add("active-lang-btn");
    } else {
      btn.style.background = "";
      btn.style.color = "";
      btn.style.borderColor = "";
      btn.classList.remove("active-lang-btn");
    }
  });
}

function updateCopilotKeysWidget() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;

  const state = getSandboxState();
  const hasKeys = state.api_keys && state.api_keys[m.merchant_id];

  const statusEl = document.getElementById("copilot-keys-status");
  const detailsEl = document.getElementById("copilot-keys-details");
  const idEl = document.getElementById("copilot-key-id-val");
  const genBtn = document.getElementById("btn-copilot-generate-keys");
  const webhookBtn = document.getElementById("btn-copilot-test-webhook");

  if (hasKeys) {
    statusEl.innerHTML = `Status: <span style="color: var(--accent-green);">Generated</span>`;
    detailsEl.style.display = "flex";
    idEl.innerText = state.api_keys[m.merchant_id].key_id;
    genBtn.innerText = "Regenerate API Keys";
    genBtn.className = "btn-remediate-name";
    genBtn.style.background = "rgba(245, 158, 11, 0.1)";
    genBtn.style.borderColor = "rgba(245, 158, 11, 0.4)";
    genBtn.style.color = "var(--accent-yellow)";
    webhookBtn.disabled = false;
  } else {
    statusEl.innerHTML = `Status: <span style="color: var(--accent-yellow);">Not Generated</span>`;
    detailsEl.style.display = "none";
    genBtn.innerText = "Generate API Keys";
    genBtn.className = "btn-remediate-name";
    genBtn.style.background = "rgba(16, 185, 129, 0.15)";
    genBtn.style.borderColor = "rgba(16, 185, 129, 0.4)";
    genBtn.style.color = "var(--accent-green)";
    webhookBtn.disabled = true;
  }
  updateCopilotCodeView();
}

function updateCopilotCodeView() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;

  const state = getSandboxState();
  const hasKeys = state.api_keys && state.api_keys[m.merchant_id];
  const keyId = hasKeys ? state.api_keys[m.merchant_id].key_id : "KEY_ID_PLACEHOLDER";

  const pre = document.getElementById("copilot-code-pre");
  if (!pre) return;
  let template = COPILOT_CODE_TEMPLATES[activeCodeLang];
  template = template.replace("KEY_ID_PLACEHOLDER", keyId);

  pre.innerText = template;
}

function appendCopilotChatBubble(sender, text) {
  const container = document.getElementById("copilot-chat-messages");
  if (!container) return;
  const msg = document.createElement("div");
  msg.className = `copilot-msg ${sender}`;
  
  if (sender === "copilot") {
    let formattedText = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    formattedText = formattedText.replace(/\n/g, "<br>");
    msg.innerHTML = formattedText;
  } else {
    msg.innerText = text;
  }
  
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function handleCopilotMessageSubmit(text) {
  if (!text.trim()) return;
  
  appendCopilotChatBubble("user", text);
  document.getElementById("copilot-chat-input").value = "";

  const typing = document.getElementById("copilot-chat-typing");
  typing.style.display = "flex";
  
  const container = document.getElementById("copilot-chat-messages");
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    typing.style.display = "none";
    const reply = getCopilotResponseText(text);
    appendCopilotChatBubble("copilot", reply);
    
    // Add inline button to message if prompt was about key generation
    if (text.toLowerCase().includes("key") && text.toLowerCase().includes("generate")) {
      appendGenerateKeyInlineButton();
    }
  }, 800);
}

function appendGenerateKeyInlineButton() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;

  const state = getSandboxState();
  const hasKeys = state.api_keys && state.api_keys[m.merchant_id];
  if (hasKeys) return;

  const container = document.getElementById("copilot-chat-messages");
  const btnCard = document.createElement("div");
  btnCard.style.alignSelf = "flex-start";
  btnCard.style.marginTop = "0.2rem";
  btnCard.innerHTML = `
    <button class="btn-remediate-name" style="padding: 0.35rem 0.5rem; font-size: 0.65rem; margin-top:0;" onclick="generateSandboxAPIKeys()">
      <i class="fas fa-key"></i> Generate API Credentials
    </button>
  `;
  container.appendChild(btnCard);
  container.scrollTop = container.scrollHeight;
}

function getCopilotResponseText(msg) {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  const lowercase = msg.toLowerCase();
  
  if (lowercase.includes("key") || lowercase.includes("credential")) {
    const state = getSandboxState();
    const hasKeys = state.api_keys && state.api_keys[m.merchant_id];
    if (hasKeys) {
      return `Your API keys are already generated! The Key ID is \`${state.api_keys[m.merchant_id].key_id}\`. You can check details or copy templates from the right panel.`;
    }
    return `To interface with our REST APIs, you need to generate API credentials. Click the button below or use the "Generate API Keys" panel on the right to build them instantly.`;
  }
  
  if (lowercase.includes("node") || lowercase.includes("php") || lowercase.includes("python") || lowercase.includes("code") || lowercase.includes("script") || lowercase.includes("integration")) {
    return `I have loaded your custom snippets in the right side code workspace. You can toggle between Node.js, PHP, and Python. The code blocks automatically include your generated Key ID once generated!`;
  }
  
  if (lowercase.includes("webhook") || lowercase.includes("payload") || lowercase.includes("captured")) {
    return `Webhooks are HTTP POST callbacks that allow you to receive automated settlement notifications. Input your web service URL in the Mock Webhook Tester on the right and click "Send Test Webhook" to dispatch a payment event.`;
  }
  
  return `I can help you complete your integration setup. You can ask me how to generate API credentials, show code integration files, or how to test webhooks using the tester panel.`;
}

function generateSandboxAPIKeys() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;

  // Prerequisite check: Must link bank account first
  if (!m.bank_linked) {
    showNotification("API Keys Blocked: Please link your bank account first.", "error");
    appendCopilotChatBubble("copilot", "⚠️ API Keys cannot be generated yet. You must link your bank account first so we can settle your funds. Go to the Onboarding Sandbox checkouts and link your bank account to continue.");
    return;
  }

  const state = getSandboxState();
  const isRegen = state.api_keys && state.api_keys[m.merchant_id];
  
  if (isRegen) {
    if (!confirm("Regenerating API Keys will revoke your existing credentials. Are you sure you want to continue?")) {
      return;
    }
  }

  const mockKeyId = "rzp_test_copilot_" + m.merchant_id.substring(4);
  const mockKeySecret = "sk_test_copilot_" + Math.random().toString(36).substring(2, 12);

  state.api_keys[m.merchant_id] = {
    key_id: mockKeyId,
    key_secret: mockKeySecret,
    generated_at: Date.now()
  };
  
  saveSandboxState(state);
  
  playChime();
  if (window.confetti) {
    window.confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
  }

  showNotification(isRegen ? "API Keys Regenerated!" : "API Keys Generated successfully!", "success");
  updateCopilotKeysWidget();

  // Update cohort table cell & funnel (Funnel calculates API Keys Generated rate instantly!)
  renderTable();
  renderFunnel();

  // Dynamic Trigger Button Text sync
  selectMerchant(m.merchant_id);

  appendCopilotChatBubble("copilot", `🎉 Success! I have generated your sandbox API keys. Your Key ID is \`${mockKeyId}\`. You can see the credentials and pasteable code scripts on the right side.`);
}

function simulateWebhookTest() {
  const m = merchants.find(mer => mer.merchant_id === selectedMerchantId);
  if (!m) return;

  const urlInput = document.getElementById("copilot-webhook-url");
  const urlVal = urlInput.value.trim();

  // Basic regex check
  const urlRegex = /^(https?:\/\/)?(localhost|(\d{1,3}\.){3}\d{1,3}|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,63})(:\d+)?(\/.*)?$/i;
  if (!urlVal || !urlRegex.test(urlVal)) {
    showNotification("INVALID URL: Please supply a valid webhook endpoint.", "error");
    const logBox = document.getElementById("copilot-webhook-log");
    logBox.style.display = "block";
    logBox.innerHTML = `<div class="webhook-log-entry error">[ERROR] Invalid webhook URL structure.</div>`;
    return;
  }

  const testBtn = document.getElementById("btn-copilot-test-webhook");
  testBtn.disabled = true;
  urlInput.disabled = true;

  const logBox = document.getElementById("copilot-webhook-log");
  logBox.style.display = "block";
  logBox.innerHTML = "";

  function addLog(text, type = "info") {
    const entry = document.createElement("div");
    entry.className = `webhook-log-entry ${type}`;
    entry.innerText = text;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
  }

  addLog(`[INFO] Initiating mock webhook request to: ${urlVal}`, "info");

  setTimeout(() => {
    addLog(`[INFO] Resolving host and checking security policies...`, "info");
    
    setTimeout(() => {
      addLog(`[INFO] Dispatching event: payment.captured (Payload Size: 450 bytes)`, "info");
      
      setTimeout(() => {
        playChime();
        addLog(`[SUCCESS] Webhook delivered! Server returned: 200 OK`, "success");
        testBtn.disabled = false;
        urlInput.disabled = false;
        showNotification("Mock Webhook Test Dispatched Successfully!", "success");
      }, 600);
      
    }, 400);

  }, 400);
}
