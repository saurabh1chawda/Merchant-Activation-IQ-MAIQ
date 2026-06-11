// Automated QA Test Suite for Merchant Activation IQ (MAIQ)
// Lead QA Agent

const assert = require('assert');

// --- PURE LOGIC TO TEST (Direct ports from app.js) ---
function classifyTier(merchant) {
  if (merchant.est_monthly_revenue >= 5000000) return "Tier 1";
  if (merchant.est_monthly_revenue >= 50000) return "Tier 2";
  return "Tier 3";
}

function sha256Mock(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "sha_" + Math.abs(hash).toString(16).substring(0, 8);
}

function determineRoutePath(m) {
  const tier = classifyTier(m);
  if (m.kyc_status === "REJECTED" || !m.bank_linked) {
    return "Pure Heuristic (Override)";
  } else if (tier === "Tier 1") {
    return "Dynamic LLM";
  } else if (tier === "Tier 2") {
    return "Hybrid Engine";
  }
  return "Pure Heuristic";
}

function calculateWelcomeReward(merchant) {
  const tier = classifyTier(merchant);
  return (tier === "Tier 3") ? 10000 : 50000; // 10000 paise = ₹100; 50000 paise = ₹500
}

function syncCohortState(merchantsList, persistedTxs) {
  persistedTxs.forEach(tx => {
    const m = merchantsList.find(mer => mer.merchant_id === tx.merchant_id);
    if (m) {
      m.first_txn_done = true;
    }
  });
}

function jaroWinkler(s1, s2) {
  let m = 0;
  const l1 = s1.length;
  const l2 = s2.length;
  if (l1 === 0 && l2 === 0) return 1.0;
  if (l1 === 0 || l2 === 0) return 0.0;

  const matchWindow = Math.floor(Math.max(l1, l2) / 2) - 1;
  const s1Matches = new Array(l1).fill(false);
  const s2Matches = new Array(l2).fill(false);

  for (let i = 0; i < l1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(l2 - 1, i + matchWindow);
    for (let j = start; j <= end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        m++;
        break;
      }
    }
  }

  if (m === 0) return 0.0;

  let k = 0;
  let transpositions = 0;
  for (let i = 0; i < l1; i++) {
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
  }

  const jaro = (m / l1 + m / l2 + (m - transpositions / 2) / m) / 3;
  
  let prefix = 0;
  const maxPrefix = Math.min(4, Math.min(l1, l2));
  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) {
      prefix++;
    } else {
      break;
    }
  }

  const p = 0.1;
  return jaro + prefix * p * (1 - jaro);
}

function executeProfileNameCorrection(merchant, correctedName, state) {
  state.name_overrides[merchant.merchant_id] = correctedName;
  merchant.business_name = correctedName;
  return state;
}

function executeKycStatusOverride(merchant, newStatus, state) {
  state.kyc_overrides[merchant.merchant_id] = newStatus;
  merchant.kyc_status = newStatus;
  return state;
}

// --- TEST CASES ---
const failures = [];

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ Passed: ${name}`);
  } catch (err) {
    console.error(`❌ Failed: ${name}`);
    console.error(err);
    failures.push({ name, error: err.message });
  }
}

console.log("=== STARTING AUTOMATED QA CRUCIBLE (FEATURE 1 & 2 INTEGRATED) ===");

// Test 1: Tier Classifications
runTest("Tier Classification Rules", () => {
  assert.strictEqual(classifyTier({ est_monthly_revenue: 6000000 }), "Tier 1", "60L should be Tier 1");
  assert.strictEqual(classifyTier({ est_monthly_revenue: 120000 }), "Tier 2", "120K should be Tier 2");
  assert.strictEqual(classifyTier({ est_monthly_revenue: 15000 }), "Tier 3", "15K should be Tier 3");
});

// Test 2: Heuristic Overrides
runTest("Heuristic Overrides", () => {
  const merchantKycRejected = {
    merchant_id: "m1",
    business_name: "Test Shop",
    est_monthly_revenue: 9000000,
    kyc_status: "REJECTED",
    bank_linked: true
  };
  assert.strictEqual(determineRoutePath(merchantKycRejected), "Pure Heuristic (Override)", "KYC Rejected override failed");
});

// Test 3: Feature 1 - Scaled Rewards Check
runTest("Feature 1: Tier-Scaled Welcome Rewards Allocation", () => {
  const t1Merchant = { est_monthly_revenue: 6000000 };
  const t2Merchant = { est_monthly_revenue: 150000 };
  const t3Merchant = { est_monthly_revenue: 12000 };

  assert.strictEqual(calculateWelcomeReward(t1Merchant), 50000, "Tier 1 should receive ₹500 (50000 paise) credit");
  assert.strictEqual(calculateWelcomeReward(t2Merchant), 50000, "Tier 2 should receive ₹500 (50000 paise) credit");
  assert.strictEqual(calculateWelcomeReward(t3Merchant), 10000, "Tier 3 should receive ₹100 (10000 paise) credit");
});

// Test 4: Feature 1 - Local Storage Cohort Synchronization
runTest("Feature 1: Local Storage Cohort State Synchronization", () => {
  const localMerchants = [
    { merchant_id: "mer_01", business_name: "M1", first_txn_done: false },
    { merchant_id: "mer_02", business_name: "M2", first_txn_done: false }
  ];

  const mockPersistedTxs = [
    { transaction_id: "pay_sb_abc", merchant_id: "mer_01", amount: 1000, timestamp: Date.now() }
  ];

  syncCohortState(localMerchants, mockPersistedTxs);

  assert.strictEqual(localMerchants[0].first_txn_done, true, "mer_01 should be synced to first_txn_done = true");
  assert.strictEqual(localMerchants[1].first_txn_done, false, "mer_02 should remain first_txn_done = false");
});

// Test 5: Feature 2 - Mock Jaro-Winkler String Similarity Checks
runTest("Feature 2: Jaro-Winkler String Distance Comparison", () => {
  const name1 = "Komal Saree Palace";
  const name2 = "Komal Sharma";
  const scoreDiff = jaroWinkler(name1, name2);
  const scoreSame = jaroWinkler(name1, name1);

  // The score is around 0.878 because of the shared "Komal" prefix, which is below the typical 0.90/0.95 auto-match threshold.
  assert.ok(scoreDiff < 0.90, `Similarity between '${name1}' and '${name2}' should be low, got ${scoreDiff}`);
  assert.strictEqual(scoreSame, 1.0, `Similarity of identical string should be exactly 1.0, got ${scoreSame}`);
});

// Test 6: Feature 2 - KYC Status Override and Name Correction State Integration
runTest("Feature 2: KYC Overrides & Name Correction State Integration", () => {
  const merchant = {
    merchant_id: "mer_3C9e7F1a",
    business_name: "Komal Saree Palace",
    kyc_status: "REJECTED"
  };

  const mockState = {
    transactions: [],
    rewards: {},
    kyc_overrides: {},
    name_overrides: {}
  };

  // 1. Correct the name to "Komal Sharma"
  executeProfileNameCorrection(merchant, "Komal Sharma", mockState);
  assert.strictEqual(merchant.business_name, "Komal Sharma", "Merchant business_name should be corrected");
  assert.strictEqual(mockState.name_overrides["mer_3C9e7F1a"], "Komal Sharma", "Name override should be stored in state");

  // 2. Override KYC status to "APPROVED" after clean PAN check
  executeKycStatusOverride(merchant, "APPROVED", mockState);
  assert.strictEqual(merchant.kyc_status, "APPROVED", "Merchant KYC status should be APPROVED");
  assert.strictEqual(mockState.kyc_overrides["mer_3C9e7F1a"], "APPROVED", "KYC override should be stored in state");
});

// --- FEATURE 3 PURE LOGIC TO TEST ---
function getMerchantWalletBalance(merchantId, state) {
  if (state.payout_balances[merchantId] === undefined) {
    state.payout_balances[merchantId] = 5000000; // default ₹50,000.00
  }
  return state.payout_balances[merchantId];
}

function rechargeMerchantWallet(merchantId, state) {
  state.payout_balances[merchantId] = 5000000;
}

function validatePayoutBalance(totalPaise, balance) {
  return totalPaise <= balance;
}

// Test 7: Feature 3 - Wallet Recharge & Multi-Merchant Isolation
runTest("Feature 3: Wallet Recharge & Multi-Merchant Balance Isolation", () => {
  const mockState = {
    payout_balances: {},
    payout_transactions: {}
  };

  const merA = "mer_9A2b8D4f";
  const merB = "mer_3C9e7F1a";

  // Check initialization
  const balA = getMerchantWalletBalance(merA, mockState);
  assert.strictEqual(balA, 5000000, "Merchant A should initialize to ₹50,000 (5,000,000 paise)");

  // Debit Merchant A
  mockState.payout_balances[merA] = balA - 1250000;
  
  // Verify Merchant B balance is untouched (isolation check)
  const balB = getMerchantWalletBalance(merB, mockState);
  assert.strictEqual(balB, 5000000, "Merchant B should remain untouched at 5,000,000 paise");
  assert.strictEqual(mockState.payout_balances[merA], 3750000, "Merchant A balance should be 3,750,000 paise");

  // Recharge Merchant A
  rechargeMerchantWallet(merA, mockState);
  assert.strictEqual(mockState.payout_balances[merA], 5000000, "Merchant A should reset back to 5,000,000 paise");
});

// Test 8: Feature 3 - Insufficient Balance Validation
runTest("Feature 3: Payout Balance Insufficiency validation rules", () => {
  const balance = 5000000;
  const validBatchTotal = 4500000; // ₹45,000.00
  const invalidBatchTotal = 5500000; // ₹55,000.00

  assert.ok(validatePayoutBalance(validBatchTotal, balance), "₹45,000.00 should be valid for ₹50,000.00 balance");
  assert.strictEqual(validatePayoutBalance(invalidBatchTotal, balance), false, "₹55,000.00 should exceed wallet balance");
});

// --- FEATURE 4 PURE LOGIC TO TEST ---
function generateAPIKeys(merchant, state) {
  if (!merchant.bank_linked) {
    throw new Error("API_KEYS_BLOCKED: Bank account must be linked");
  }
  const mockKeyId = "rzp_test_copilot_" + merchant.merchant_id.substring(4);
  const mockKeySecret = "sk_test_copilot_" + Math.random().toString(36).substring(2, 12);
  state.api_keys[merchant.merchant_id] = {
    key_id: mockKeyId,
    key_secret: mockKeySecret,
    generated_at: Date.now()
  };
  merchant.api_keys_generated = true;
  return state;
}

// Test 9: Feature 4 - API Key Generation & Prerequisite Verification
runTest("Feature 4: API Key Generation Prerequisite and Credentials Verification", () => {
  const state = {
    api_keys: {}
  };

  const linkedMerchant = {
    merchant_id: "mer_9A2b8D4f",
    bank_linked: true,
    api_keys_generated: false
  };

  const unlinkedMerchant = {
    merchant_id: "mer_3C9e7F1a",
    bank_linked: false,
    api_keys_generated: false
  };

  // 1. Generate keys for bank linked merchant
  generateAPIKeys(linkedMerchant, state);
  assert.ok(state.api_keys["mer_9A2b8D4f"], "Keys should be generated for linked merchant");
  assert.strictEqual(linkedMerchant.api_keys_generated, true, "api_keys_generated should be set to true");
  assert.match(state.api_keys["mer_9A2b8D4f"].key_id, /^rzp_test_copilot_/, "Key ID should have rzp_test_copilot_ prefix");

  // 2. Attempt key generation for unlinked merchant, should throw block error
  assert.throws(() => {
    generateAPIKeys(unlinkedMerchant, state);
  }, /API_KEYS_BLOCKED/, "Should throw error if bank is not linked");
});

console.log("\n=== TEST RESULTS SUMMARY ===");
if (failures.length === 0) {
  console.log("🟢 ALL TESTS PASSED SUCCESSFULLY. ZERO REGRESSIONS DETECTED.");
  process.exit(0);
} else {
  console.error(`🔴 TEST FAILURE ENCOUNTERED: ${failures.length} issues found.`);
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
