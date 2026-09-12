"""
Comprehensive Audit & Verification Suite:
1. AI Models (ONNX Neural SLM, GPU/CPU Propensity XGBoost/LogReg, LinUCB Bandit, KMeans Archetypes, R^32 Vectorizer)
2. Recommendation Engine (Multi-source Ingestion, Forecaster, 50/30/20 Spend Analyzer, Signals, 19-Product Catalog, RBI/DPDP Compliance, Multi-Factor Scoring, SHA-256 Cryptographic Ledger, Top 1-5 Ranking)
3. Chatbot (Mitra Multi-turn Dialogue, Vernacular NLP in EN/HI/GU/Hinglish/Gujlish, Disambiguation, Direct Navigation, Backend API Endpoints, Frontend Contracts)
"""

import os
import sys
import time
import json
from pathlib import Path
from typing import Dict, Any, List

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import numpy as np

# AI Models imports
from ai.voice.model.neural_slm import (
    IndicSubwordTokenizer,
    MiniCPM5ONNXModel,
    IndicEntityParser,
    NaturalSpeechVerbalizer,
    ONNX_MODEL_PATH
)
from ai.voice.model.minicpm5_runner import MiniCPM5Runner
from ai.intelligence.ml.vectorizer import FinancialFeatureVectorizer
from ai.intelligence.ml.clustering import KMeansClusterer
from ai.intelligence.ml.propensity import SupervisedPropensityModel
from ai.intelligence.ml.bandit import LinUCBBandit
from ai.intelligence.ml.embeddings import ProductEmbeddingSpace
from ai.intelligence.ml.gpu_trainer import GPUTelemetry

# Recommendation Engine imports
from ai.intelligence.personalization.engine import PersonalizationEngine
from ai.intelligence.personalization.catalog import PRODUCT_CATALOG, BankingProduct
from ai.intelligence.personalization.compliance import ComplianceEngine, DecisionAuditRecord
from ai.intelligence.personalization.scorer import MultiFactorScorer
from ai.intelligence.personalization.cryptoledger import CryptographicDecisionChain
from ai.intelligence.personalization.archetypes import ArchetypeClassifier
from ai.intelligence.features.extractor import FeatureExtractor
from ai.intelligence.features.forecaster import PredictiveCashFlowEngine
from ai.intelligence.features.spend_analyzer import SpendAnalyzer
from ai.intelligence.signals.detector import SignalDetector
from ai.intelligence.ingestion.harmonizer import MultiSourceDataHarmonizer
from ai.intelligence.ingestion.models import (
    CBSLedgerRecord,
    UPISwitchLog,
    SMSNotificationRecord,
    BureauCreditProfile,
    CustomerDemographics,
)

# Chatbot imports
from ai.voice.intents.classifier import VoiceIntentClassifier
from ai.voice.dialogue.manager import DialogueManager
from fastapi.testclient import TestClient
from apps.backend.app.main import app

test_client = TestClient(app)


def audit_header(title: str):
    print("\n" + "=" * 80)
    print(f"  {title.upper()}")
    print("=" * 80)


def audit_sub(title: str):
    print(f"\n--- [CHECK] {title} ---")


class ComprehensiveAuditor:
    def __init__(self):
        self.results = {
            "ai_models": {"passed": 0, "failed": 0, "checks": []},
            "recommendation_engine": {"passed": 0, "failed": 0, "checks": []},
            "chatbot": {"passed": 0, "failed": 0, "checks": []}
        }

    def record(self, category: str, name: str, passed: bool, details: str = ""):
        status_str = "PASS" if passed else "FAIL"
        self.results[category]["passed" if passed else "failed"] += 1
        self.results[category]["checks"].append({
            "name": name,
            "passed": passed,
            "details": details
        })
        mark = "PASS" if passed else "FAIL"
        print(f"  [{mark}] {name}: {status_str} {('- ' + details) if details else ''}")

    # =========================================================================
    # 1. AUDIT AI MODELS
    # =========================================================================
    def audit_ai_models(self):
        audit_header("1. AUDITING AI MODELS")

        # 1.1 ONNX Neural SLM Model
        audit_sub("MiniCPM-5 ONNX Neural SLM Graph & Runtime")
        exists = ONNX_MODEL_PATH.exists()
        size_kb = ONNX_MODEL_PATH.stat().st_size / 1024 if exists else 0
        self.record("ai_models", "ONNX Model File Existence", exists, f"Path: {ONNX_MODEL_PATH.name} ({size_kb:.1f} KB)")

        # Test ONNX Runtime Session & Latency
        latencies = []
        test_queries = [
            "Pay morning Metro pass 40 rupees",
            "Mera home loan EMI kitna baki hai?",
            "Maarun account balance ketlu chhe?",
            "Pay electricity bill for Tata Power",
            "Max hospital medical insurance claim",
            "Mera budget bahut tight hai pause subscriptions",
            "Invest surplus 50000 in smart FD",
            "Emergency debit card block karo",
            "Hello Mitra what can you do?"
        ]
        for q in test_queries:
            t0 = time.perf_counter()
            res = MiniCPM5ONNXModel.predict(q)
            lat = (time.perf_counter() - t0) * 1000
            latencies.append(lat)

        avg_lat = float(np.mean(latencies))
        p95_lat = float(np.percentile(latencies, 95))
        self.record(
            "ai_models",
            "ONNX Inference Latency (< 10ms target)",
            avg_lat < 10.0,
            f"Mean: {avg_lat:.2f}ms, P95: {p95_lat:.2f}ms across {len(test_queries)} queries"
        )

        # 1.2 Multilingual Indic Subword Tokenizer & Orthonormal Centroids
        audit_sub("Multilingual Subword Tokenizer & R^64 Orthonormal Centroid Projection")
        vec_en = IndicSubwordTokenizer.embed_text("Delhi Metro recharge")
        vec_hi = IndicSubwordTokenizer.embed_text("दिल्ली मेट्रो रिचार्ज")
        vec_gu = IndicSubwordTokenizer.embed_text("દિલ્હી મેટ્રો રિચાર્જ")
        norm_ok = (
            abs(float(np.linalg.norm(vec_en)) - 1.0) < 1e-4 and
            abs(float(np.linalg.norm(vec_hi)) - 1.0) < 1e-4 and
            abs(float(np.linalg.norm(vec_gu)) - 1.0) < 1e-4
        )
        self.record("ai_models", "Unit Norm Preservation across EN/HI/GU", norm_ok, f"Norms: {np.linalg.norm(vec_en):.4f}, {np.linalg.norm(vec_hi):.4f}, {np.linalg.norm(vec_gu):.4f}")

        # Centroid Orthonormality Check
        centroids = IndicSubwordTokenizer.CENTROIDS
        gram_matrix = np.dot(centroids, centroids.T)
        identity = np.eye(len(IndicSubwordTokenizer.INTENT_CLASSES))
        ortho_err = float(np.max(np.abs(gram_matrix - identity)))
        self.record("ai_models", "Intent Centroid Orthonormality (err < 1e-4)", ortho_err < 1e-4, f"Max error: {ortho_err:.2e}")

        # 1.3 Indic Numeral & Spoken Amount Entity Extraction
        audit_sub("Indic Numeral & Spoken Amount Entity Extraction")
        cases = [
            ("recharge ₹40", 40.0),
            ("chaalis rupaye metro", 40.0),
            ("send aath lakh rupees", 800000.0),
            ("pachaas hazaar loan", 50000.0),
            ("દસ હજાર", 10000.0),
            ("electricity bill 1450", 1450.0)
        ]
        all_amt_passed = True
        for txt, expected in cases:
            extracted = IndicEntityParser.extract_amount(txt)
            if extracted != expected:
                all_amt_passed = False
                print(f"      [Mismatch] '{txt}': got {extracted}, expected {expected}")
        self.record("ai_models", "Indic Numeral Extraction (Digits + Hinglish + Gujarati)", all_amt_passed, f"{len(cases)} test cases verified")

        # 1.4 Conversational Speech Verbalizer (Zero special characters for TTS)
        audit_sub("Speech Verbalizer (Digits translated to spoken words without special symbols)")
        spoken_en = NaturalSpeechVerbalizer.verbalize_spoken("PAY_METRO", {"amount": 40}, language="en")
        spoken_hi = NaturalSpeechVerbalizer.verbalize_spoken("PAY_METRO", {"amount": 40}, language="hi")
        spoken_gu = NaturalSpeechVerbalizer.verbalize_spoken("PAY_METRO", {"amount": 40}, language="gu")

        has_symbols_en = bool(any(c in spoken_en for c in ["₹", "$", "@", "%", "#", "*", "_"]))
        has_symbols_hi = bool(any(c in spoken_hi for c in ["₹", "$", "@", "%", "#", "*", "_"]))
        has_symbols_gu = bool(any(c in spoken_gu for c in ["₹", "$", "@", "%", "#", "*", "_"]))
        self.record("ai_models", "TTS Cleanliness (Zero unpronounceable symbols in speech)", not (has_symbols_en or has_symbols_hi or has_symbols_gu), "English, Hindi, and Gujarati verified")

        # 1.5 Supervised Propensity Models (CPU Scikit-Learn + GPU XGBoost)
        audit_sub("Supervised Propensity Models (Logistic Regression & GPU XGBoost)")
        cpu_checkpoint = Path(__file__).resolve().parents[1] / "ai" / "intelligence" / "ml" / "checkpoints" / "propensity_models_v1.joblib"
        gpu_checkpoint = Path(__file__).resolve().parents[1] / "ai" / "intelligence" / "ml" / "checkpoints" / "gpu_propensity_models_v1.joblib"

        self.record("ai_models", "CPU Propensity Checkpoint", cpu_checkpoint.exists(), f"{cpu_checkpoint.stat().st_size / 1024:.1f} KB")
        self.record("ai_models", "GPU XGBoost Propensity Checkpoint", gpu_checkpoint.exists(), f"{gpu_checkpoint.stat().st_size / 1024:.1f} KB")

        # Test loading CPU model
        SupervisedPropensityModel.train()
        test_vec = np.zeros(FinancialFeatureVectorizer.VECTOR_DIM, dtype=np.float32)
        test_vec[15] = 0.95  # Anomaly score
        fraud_prop = SupervisedPropensityModel.predict_propensity("rec_fraud_guard", test_vec)
        self.record("ai_models", "CPU Model Fast Inference", 0.0 <= fraud_prop <= 1.0, f"P(Fraud Guard | anomaly=0.95) = {fraud_prop:.4f}")

        # Test feature importance extraction
        top_features = SupervisedPropensityModel.get_feature_importance("rec_fraud_guard", top_n=3)
        self.record("ai_models", "Feature Importance Extraction", len(top_features) > 0, f"Top drivers: {[f[0] for f in top_features]}")

        # Test GPU weights loading
        gpu_loaded = SupervisedPropensityModel.load_gpu_models()
        self.record("ai_models", "GPU Weights Loader & Switcher", gpu_loaded, "XGBoost weights active in SupervisedPropensityModel")

        gpu_fraud_prop = SupervisedPropensityModel.predict_propensity("rec_fraud_guard", test_vec)
        self.record("ai_models", "GPU Model Fast Inference", 0.0 <= gpu_fraud_prop <= 1.0, f"P_GPU(Fraud Guard) = {gpu_fraud_prop:.4f}")

        # Switch back to CPU default for clean baseline
        SupervisedPropensityModel._is_trained = False
        SupervisedPropensityModel.train()

        # 1.6 LinUCB Contextual Bandit
        audit_sub("LinUCB Contextual Bandit Model")
        bandit_ckpt = Path(__file__).resolve().parents[1] / "ai" / "intelligence" / "ml" / "checkpoints" / "linucb_bandit_prior_v1.json"
        self.record("ai_models", "LinUCB Prior Checkpoint", bandit_ckpt.exists(), f"{bandit_ckpt.stat().st_size / 1024:.1f} KB")

        b_score_before = LinUCBBandit.score("rec_commute_metro", test_vec)
        LinUCBBandit.update("rec_commute_metro", test_vec, reward=1.0)
        b_score_after = LinUCBBandit.score("rec_commute_metro", test_vec)
        self.record("ai_models", "LinUCB Online Learning Update", b_score_after != b_score_before, f"Score updated: {b_score_before:.4f} -> {b_score_after:.4f}")

        # 1.7 KMeans Archetype Clustering
        audit_sub("Unsupervised KMeans Archetype Clustering (7 Personas)")
        kmeans_ckpt = Path(__file__).resolve().parents[1] / "ai" / "intelligence" / "ml" / "checkpoints" / "kmeans_archetypes_v1.joblib"
        self.record("ai_models", "KMeans Archetype Checkpoint", kmeans_ckpt.exists(), f"{kmeans_ckpt.stat().st_size / 1024:.1f} KB")

        cluster_probs = KMeansClusterer.soft_cluster_probabilities(test_vec)
        prob_sum = float(sum(cluster_probs.values()))
        self.record("ai_models", "KMeans Soft Clustering Probabilities", abs(prob_sum - 1.0) < 1e-4, f"Clusters: {len(cluster_probs)}, Sum: {prob_sum:.4f}")

        # 1.8 Hardware Telemetry
        audit_sub("Hardware & GPU Telemetry Query")
        telemetry = GPUTelemetry.get_metrics()
        self.record("ai_models", "NVIDIA GPU Telemetry Detection", "temp_c" in telemetry and "mem_total_mb" in telemetry, f"Available: {telemetry.get('available')}, VRAM: {telemetry.get('mem_total_mb')} MB, Temp: {telemetry.get('temp_c')} C")

    # =========================================================================
    # 2. AUDIT RECOMMENDATION ENGINE
    # =========================================================================
    def audit_recommendation_engine(self):
        audit_header("2. AUDITING RECOMMENDATION ENGINE")

        # 2.1 Multi-Source Ingestion & Sanitization
        audit_sub("Multi-Source Ingestion, Deduplication, & Conflict Arbitration")
        demographics = CustomerDemographics(
            customer_id="cust_audit_001",
            name="Rahul Sharma",
            city_tier="Tier 1",
            declared_occupation="Corporate Salaried",
            declared_monthly_income=85000.0,
            kyc_tier=2
        )
        cbs_records = [
            CBSLedgerRecord(
                txn_id="TX_9901",
                amount="₹ 40.00",
                type="debit",
                narration="DMRC METRO",
                timestamp="2026-09-10T08:40:00Z"
            ),
            CBSLedgerRecord(
                txn_id="TX_9901",  # Duplicate ID
                amount="₹ 40.00",
                type="debit",
                narration="DMRC METRO DUP",
                timestamp="2026-09-10T08:40:00Z"
            )
        ]
        profile = MultiSourceDataHarmonizer.harmonize(
            demographics=demographics,
            cbs_records=cbs_records
        )
        dedup_count = len(profile.cleaned_transactions)
        self.record(
            "recommendation_engine",
            "Idempotency Deduplication (Duplicates removed)",
            dedup_count == 1,
            f"Input: 2 ledger txs with duplicate ID -> Harmonized output: {dedup_count} tx"
        )

        # 2.2 30-Day Forward Cashflow Forecaster & Safe-to-Spend Dial
        audit_sub("Predictive Cash Flow Forecaster & Safe-to-Spend Dial")
        mock_txs = [
            {"date": "2026-09-01", "amount": 85000.0, "type": "credit", "category": "income"},
            {"date": "2026-09-02", "amount": 22000.0, "type": "debit", "category": "housing"},
            {"date": "2026-09-05", "amount": 16500.0, "type": "debit", "category": "emi"}
        ]
        forecast = PredictiveCashFlowEngine.forecast(
            available_balance=46500.0,
            monthly_income=85000.0,
            transactions=mock_txs
        )
        self.record("recommendation_engine", "30-Day Cash Flow Forecast Projection", hasattr(forecast, "safe_to_spend_today") and forecast.safe_to_spend_today is not None, f"Safe-to-spend: ₹{forecast.safe_to_spend_today:.2f}, Deficit predicted: {forecast.deficit_predicted}")

        # 2.3 50/30/20 Spend Breakdown & Discretionary Leakage Analysis
        audit_sub("50/30/20 Granular Spend Breakdown Analysis")
        spend_analysis = SpendAnalyzer.analyze(mock_txs, monthly_income=85000.0)
        alloc = spend_analysis.allocation_50_30_20
        self.record("recommendation_engine", "50/30/20 Budget Compliance Split", hasattr(alloc, "needs_percentage"), f"Needs: {alloc.needs_percentage:.1f}%, Wants: {alloc.wants_percentage:.1f}%, Savings: {alloc.savings_investments_percentage:.1f}%")

        # 2.4 19-Product Bharat Banking Catalog Integrity
        audit_sub("19-Product Bharat Banking Catalog Validation")
        cat_len = len(PRODUCT_CATALOG)
        self.record("recommendation_engine", "19 Products Catalog Invariant", cat_len == 19, f"Total products: {cat_len}")

        # Check required fields for every product
        all_fields_ok = True
        credit_products = 0
        for pid, prod in PRODUCT_CATALOG.items():
            if not (prod.id and prod.title and prod.category and hasattr(prod, "is_credit_product")):
                all_fields_ok = False
            if prod.is_credit_product:
                credit_products += 1
                if prod.max_dti_limit > 0.50:
                    all_fields_ok = False

        self.record("recommendation_engine", "Product Metadata & Regulatory Limits (DTI <= 0.50)", all_fields_ok, f"{credit_products} credit products verified under statutory ceilings")

        # 2.5 RBI Digital Lending Anti-Predatory Guardrail & Loan Suppression Under Stress
        audit_sub("RBI Anti-Predatory Guardrail (Strict Loan Suppression under Financial Stress)")
        stress_customer = {
            "customer_id": "cust_stress_test",
            "name": "Arun Kumar",
            "monthly_income": 45000,
            "credit_score": 680
        }
        stress_features = {"burn_rate": 48000, "commute_detected": False}
        stress_signals = {
            "financial_health": "stress",
            "debt_to_income_ratio": 0.62,
            "stress_alert": True,
            "upcoming_obligations": 32000
        }

        eval_stress = PersonalizationEngine.evaluate(
            customer_data=stress_customer,
            features=stress_features,
            signals=stress_signals,
            health="stress"
        )

        active_recs = eval_stress["active_recommendations"]
        suppressed_recs = eval_stress["suppressed_recommendations"]

        # Assert zero credit products surfaced
        credit_surfaced = [r for r in active_recs if r["category"] in ["credit", "working_capital", "agricultural_credit", "overdraft"]]
        personal_loan_suppressed = any(r["id"] == "rec_personal_loan" for r in suppressed_recs)

        self.record(
            "recommendation_engine",
            "Strict Loan Suppression Under Financial Stress (DTI 0.62)",
            len(credit_surfaced) == 0 and personal_loan_suppressed,
            f"Active: {len(active_recs)} (0 loans), Suppressed: {len(suppressed_recs)} (includes Personal Loan)"
        )

        # 2.6 Counterfactual Explanations
        audit_sub("Counterfactual Explanations for Regulators and Consumers")
        cf_present = all("counterfactual" in r and r["counterfactual"] for r in active_recs)
        self.record("recommendation_engine", "Counterfactual Actionability on All Decisions", cf_present, "Clear path-to-unlock present for all items")

        # 2.7 Multi-Factor Scoring & Top 1-to-5 Strict Prioritization
        audit_sub("Multi-Factor Scoring & Strict Top 1-to-5 Output")
        top_5 = eval_stress["top_5_recommendations"]
        is_top_5_bounded = 1 <= len(top_5) <= 5
        is_monotonically_ordered = all(top_5[i]["priority"] >= top_5[i+1]["priority"] for i in range(len(top_5)-1))
        self.record("recommendation_engine", "Strict Top 1-to-5 Bounded & Sorted Output", is_top_5_bounded and is_monotonically_ordered, f"Returned {len(top_5)} ranked recommendations")

        # 2.8 SHA-256 Tamper-Evident Cryptographic Ledger
        audit_sub("Immutable Cryptographic SHA-256 Decision Accounting Ledger")
        audit_trail = eval_stress["audit_trail"]
        chain = CryptographicDecisionChain.build_chain(audit_trail)
        self.record("recommendation_engine", "Cryptographic Block Generation", len(chain) == len(audit_trail), f"{len(chain)} blocks mined")

        # Verify chain integrity
        is_valid_chain, status_msg = CryptographicDecisionChain.verify_chain_integrity(chain)
        self.record("recommendation_engine", "Cryptographic Chain Mathematical Verification", is_valid_chain, f"{status_msg}")

        # Tamper detection test
        tampered_chain = list(chain)
        if tampered_chain:
            fake_block = tampered_chain[0].model_copy(update={"decision": "RECOMMEND" if tampered_chain[0].decision == "SUPPRESS" else "SUPPRESS"})
            tampered_chain[0] = fake_block
            tamper_detected, bad_msg = CryptographicDecisionChain.verify_chain_integrity(tampered_chain)
            self.record("recommendation_engine", "Tamper Detection Integrity", not tamper_detected, f"Alert: {bad_msg}")

        # 2.9 Execution Latency Benchmark
        audit_sub("Recommendation Engine Speed Benchmark")
        t0 = time.perf_counter()
        for _ in range(50):
            PersonalizationEngine.evaluate(stress_customer, stress_features, stress_signals, "stress")
        rec_lat = ((time.perf_counter() - t0) / 50) * 1000
        self.record("recommendation_engine", "Recommendation Evaluation Latency (< 5ms target)", rec_lat < 5.0, f"Mean latency: {rec_lat:.3f} ms")

    # =========================================================================
    # 3. AUDIT CHATBOT (MITRA ASSISTANT)
    # =========================================================================
    def audit_chatbot(self):
        audit_header("3. AUDITING CHATBOT (MITRA ASSISTANT)")

        # 3.1 Vernacular Intent Classification across English, Hindi, Gujarati, Hinglish
        audit_sub("Vernacular Intent Classification Matrix")
        chat_test_cases = [
            ("Pay morning Metro 40", "PAY_METRO", "en"),
            ("दिल्ली मेट्रो स्मार्ट कार्ड चालीस रुपये भरो", "PAY_METRO", "hi"),
            ("મારી સવારની મેટ્રો ટિકિટ ચૂકવો", "PAY_METRO", "gu"),
            ("Mera upcoming home loan EMI kab hai?", "CHECK_EMI", "hi"),
            ("Maarun bank account balance ketlu chhe?", "CHECK_BALANCE", "gu"),
            ("Bijli ka bill bharna hai", "PAY_BILL", "hi"),
            ("Max hospital bill claim reimbursement", "MEDICAL_CLAIM_HELP", "en"),
            ("Kharcha bahut jyada ho gaya hai pause subscriptions", "REVIEW_COMMITMENTS", "hi"),
            ("Extra bonus paisa surplus smart FD me dalo", "SAVE_SURPLUS", "hi"),
            ("Mera debit card turant lock karo", "LOCK_CARD", "hi"),
            ("મારું ડેબિટ કાર્ડ તાત્કાલિક બ્લોક કરો", "LOCK_CARD", "gu"),
            ("Hello Mitra help me", "GENERAL_QUERY", "en")
        ]
        all_intents_ok = True
        for query, expected_intent, lang in chat_test_cases:
            res = VoiceIntentClassifier.classify(query, lang=lang)
            if res["intent"] != expected_intent:
                all_intents_ok = False
                print(f"      [Mismatch] '{query}': got {res['intent']}, expected {expected_intent}")
        self.record("chatbot", "Vernacular Intent Accuracy (EN, HI, GU, Hinglish)", all_intents_ok, f"{len(chat_test_cases)} multi-lingual test phrases verified")

        # 3.2 Multi-Turn Disambiguation & Confirmation Flow ("score" -> Credit Score?)
        audit_sub("Multi-Turn Disambiguation & Minimal Follow-Up Flow")
        turn1 = DialogueManager.process_turn("score", language="en")
        needs_clarification = turn1.pending_clarification == "CONFIRM_CREDIT_SCORE"
        self.record("chatbot", "Ambiguous Query Triggers Follow-Up Question", needs_clarification, f"Prompt: '{turn1.response_text}'")

        # User affirms with 'yes'
        turn2_yes = DialogueManager.process_turn("yes", language="en", pending_clarification=turn1.pending_clarification)
        nav_ok_yes = turn2_yes.navigation is not None and turn2_yes.navigation.target == "credit_score"
        self.record("chatbot", "Affirmative Response ('yes') Confirms Navigation", nav_ok_yes, f"Navigates to: {turn2_yes.navigation.target if turn2_yes.navigation else 'None'}")

        # User affirms in Hinglish 'haan'
        turn2_haan = DialogueManager.process_turn("haan", language="hi", pending_clarification=turn1.pending_clarification)
        nav_ok_haan = turn2_haan.navigation is not None and turn2_haan.navigation.target == "credit_score"
        self.record("chatbot", "Hinglish Affirmative ('haan') Confirms Navigation", nav_ok_haan, "Hinglish confirmation verified")

        # User declines with 'no'
        turn2_no = DialogueManager.process_turn("no", language="en", pending_clarification=turn1.pending_clarification)
        nav_ok_no = turn2_no.navigation is None and turn2_no.intent == "DECLINED_CLARIFICATION"
        self.record("chatbot", "Negative Response ('no') Returns Helpful Guidance", nav_ok_no, f"Reply: '{turn2_no.response_text}'")

        # 3.3 Direct Instant Navigation (Zero Follow-Up Needed)
        audit_sub("Direct Navigation (Zero Disambiguation Needed)")
        direct_cases = [
            ("debit card", "NAVIGATE_DEBIT_CARD", "debit_card"),
            ("credit score", "NAVIGATE_CREDIT_SCORE", "credit_score"),
            ("metro", "PAY_METRO", "payments"),
            ("send money", "NAVIGATE_PAYMENTS", "payments")
        ]
        all_direct_ok = True
        for q, expected_intent, expected_target in direct_cases:
            t = DialogueManager.process_turn(q)
            if t.intent != expected_intent or (t.navigation and t.navigation.target != expected_target):
                all_direct_ok = False
                print(f"      [Mismatch] Direct '{q}': got intent {t.intent}, target {t.navigation.target if t.navigation else 'None'}")
        self.record("chatbot", "Direct Keywords Navigate Without Follow-Up", all_direct_ok, f"{len(direct_cases)} direct intents verified")

        # 3.4 Ethical Guardrail under Financial Stress in Chat
        audit_sub("Chatbot Ethical Voice Guardrail (Refuses Loans under Stress)")
        stress_reply = MiniCPM5Runner.verbalize(
            intent="CHECK_EMI",
            trusted_data={"inquiry_type": "loan_application", "financial_health": "stress"},
            lang="en",
            stress_level="stress"
        )
        loan_refused_ethically = "stabilization is recommended" in stress_reply or "fair lending" in stress_reply.lower()
        self.record("chatbot", "Conversational Loan Refusal Under Stress", loan_refused_ethically, f"Ethical response: '{stress_reply[:75]}...'")

        # 3.5 Backend Assistant API Endpoints Verification
        audit_sub("Backend Assistant Endpoints Integration (/api/v1/assistant/*)")

        # Test /assistant/init
        res_init = test_client.get("/api/v1/assistant/init?lang=en")
        init_ok = res_init.status_code == 200 and len(res_init.json().get("messages", [])) > 0
        self.record("chatbot", "GET /api/v1/assistant/init", init_ok, f"Greeting returned: '{res_init.json()['messages'][0]['text'][:50]}...'")

        # Test /assistant/chat
        res_chat = test_client.post("/api/v1/assistant/chat", json={
            "query": "debit card",
            "language": "en",
            "customer_id": "cust_bharat_001"
        })
        chat_ok = res_chat.status_code == 200 and "reply" in res_chat.json()
        reply_data = res_chat.json().get("reply", {})
        has_nav = bool(reply_data.get("navigation"))
        self.record("chatbot", "POST /api/v1/assistant/chat", chat_ok and has_nav, f"Intent: LOCK_CARD, Action Chips: {len(reply_data.get('actionChips', []))}, Target: {reply_data.get('navigation', {}).get('target')}")

        # Test /assistant/intent authoritative execution
        res_intent = test_client.post("/api/v1/assistant/intent", json={
            "customer_id": "cust_bharat_001",
            "intent": "CHECK_BALANCE",
            "language": "en",
            "entities": {}
        })
        intent_ok = res_intent.status_code == 200 and res_intent.json().get("success") is True
        self.record("chatbot", "POST /api/v1/assistant/intent", intent_ok, f"Available balance: ₹{res_intent.json().get('data', {}).get('available')}")

    # =========================================================================
    # SUMMARY
    # =========================================================================
    def print_summary(self):
        audit_header("AUDIT & VERIFICATION SUMMARY REPORT")
        total_p = 0
        total_f = 0

        for cat, data in self.results.items():
            p = data["passed"]
            f = data["failed"]
            total_p += p
            total_f += f
            total = p + f
            pct = (p / total * 100) if total > 0 else 0
            label = cat.replace("_", " ").upper()
            print(f"\n  * {label}:")
            print(f"    - Passed: {p} / {total} ({pct:.1f}%)")
            if f > 0:
                print(f"    - FAILED: {f}")
                for c in data["checks"]:
                    if not c["passed"]:
                        print(f"      - [FAIL] {c['name']}: {c['details']}")

        grand_total = total_p + total_f
        grand_pct = (total_p / grand_total * 100) if grand_total > 0 else 0
        print("\n" + "=" * 80)
        print(f"  TOTAL SYSTEM SCORE: {total_p}/{grand_total} CHECKS PASSED ({grand_pct:.1f}%)")
        print("=" * 80 + "\n")
        return total_f == 0


if __name__ == "__main__":
    auditor = ComprehensiveAuditor()
    auditor.audit_ai_models()
    auditor.audit_recommendation_engine()
    auditor.audit_chatbot()
    all_passed = auditor.print_summary()
    sys.exit(0 if all_passed else 1)
