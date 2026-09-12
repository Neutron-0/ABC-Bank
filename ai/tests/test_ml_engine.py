"""Test suite for Scikit-Learn & NumPy Machine Learning Recommendation Engine."""

import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import numpy as np
import pytest

from ai.intelligence.ml.vectorizer import FinancialFeatureVectorizer
from ai.intelligence.ml.clustering import KMeansClusterer
from ai.intelligence.ml.embeddings import ProductEmbeddingSpace
from ai.intelligence.ml.propensity import SupervisedPropensityModel
from ai.intelligence.ml.bandit import LinUCBBandit
from ai.intelligence.personalization.catalog import PRODUCT_CATALOG


def test_feature_vectorizer_shape_and_finite():
    """Verify vectorizer produces 32-dimensional, finite, normalized float64 vector."""
    mock_customer = {
        "customer_id": "cust_test_001",
        "monthly_income": 85000,
        "balance": {"available": 35000, "savings": 120000},
        "credit_score": 760,
        "age": 28,
        "kyc_tier": 2
    }
    mock_features = {
        "transaction_metrics": {
            "total_debit_volume": 45000,
            "total_credit_volume": 85000,
            "total_tx_count": 30,
            "category_volumes": {
                "shopping": 5000,
                "dining": 4000,
                "groceries": 12000,
                "utilities": 4000,
                "transit": 3500,
                "healthcare": 1500
            },
            "upi_tx_count": 25,
            "micro_tx_count": 14,
            "max_debit_amount": 8000
        },
        "dti_ratio": 0.22,
        "savings_rate": 0.35,
        "commute_detected": True
    }
    mock_signals = {
        "debt_to_income_ratio": 0.22,
        "commute_habit_detected": True,
        "anomaly_score": 5,
        "spending_volatility": "low"
    }

    vec = FinancialFeatureVectorizer.vectorize(
        customer_data=mock_customer,
        features=mock_features,
        signals=mock_signals,
        health="stable"
    )

    assert isinstance(vec, np.ndarray)
    assert vec.shape == (32,)
    assert vec.dtype == np.float64
    assert not np.isnan(vec).any(), "Vector must not contain NaN!"
    assert not np.isinf(vec).any(), "Vector must not contain Inf!"
    assert (vec >= 0.0).all() and (vec <= 1.0).all(), "Normalized vector must be bounded in [0.0, 1.0]!"

    # Feature dict inspection
    feat_dict = FinancialFeatureVectorizer.get_feature_dict(vec)
    assert len(feat_dict) == 32
    assert "shannon_spend_entropy" in feat_dict
    assert "burn_velocity" in feat_dict
    assert "periodic_transit_score" in feat_dict
    assert feat_dict["periodic_transit_score"] > 0.8


def test_kmeans_clustering_soft_assignment():
    """Verify unsupervised KMeans model produces valid soft assignment probability distribution."""
    # 1. Create a realistic urban commuter customer profile
    commuter_cust = {
        "customer_id": "cust_commuter",
        "monthly_income": 75000,
        "balance": {"available": 35000, "savings": 100000},
        "credit_score": 750,
        "age": 29
    }
    commuter_feats = {
        "transaction_metrics": {
            "total_debit_volume": 35000,
            "total_tx_count": 28,
            "category_volumes": {"transit": 4500, "groceries": 10000, "dining": 5000},
            "upi_tx_count": 22
        },
        "commute_detected": True
    }
    commuter_signals = {
        "commute_habit_detected": True,
        "debt_to_income_ratio": 0.25
    }
    commuter_vec = FinancialFeatureVectorizer.vectorize(commuter_cust, commuter_feats, commuter_signals, health="stable")

    probs = KMeansClusterer.soft_cluster_probabilities(commuter_vec)
    assert len(probs) == 7
    total_prob = sum(probs.values())
    assert abs(total_prob - 1.0) < 1e-2, f"Probabilities must sum to 1.0, got {total_prob}"

    predicted_arch, confidence = KMeansClusterer.predict_archetype(commuter_vec)
    assert predicted_arch == "urban_commuter"
    assert confidence > 0.20

    # 2. Create a realistic rural farmer customer profile
    farmer_cust = {
        "customer_id": "cust_farmer",
        "monthly_income": 40000,
        "occupation": "Agriculturalist",
        "balance": {"available": 15000, "savings": 40000},
        "credit_score": 680,
        "age": 48
    }
    farmer_feats = {
        "transaction_metrics": {
            "total_debit_volume": 20000,
            "total_tx_count": 12,
            "category_volumes": {"agriculture": 12000, "groceries": 5000},
            "upi_tx_count": 3
        }
    }
    farmer_signals = {"kcc_holder": True}
    farmer_vec = FinancialFeatureVectorizer.vectorize(farmer_cust, farmer_feats, farmer_signals, health="stable")

    farmer_probs = KMeansClusterer.soft_cluster_probabilities(farmer_vec)
    pred_farmer, conf_farmer = KMeansClusterer.predict_archetype(farmer_vec)
    assert pred_farmer == "rural_farmer"


def test_product_capability_embeddings():
    """Verify 32D embeddings exist for all catalog products and calculate bounded cosine similarities."""
    for product_id in PRODUCT_CATALOG:
        emb = ProductEmbeddingSpace.get_embedding(product_id)
        assert isinstance(emb, np.ndarray)
        assert emb.shape == (32,)
        norm = np.linalg.norm(emb)
        assert abs(norm - 1.0) < 1e-4, f"Embedding for {product_id} must be unit-normalized, got {norm}"

    # Test similarity computation
    test_vec = np.ones(32, dtype=np.float64) / np.sqrt(32)
    sim = ProductEmbeddingSpace.compute_cosine_similarity(test_vec, "rec_commute_metro")
    assert 0.0 <= sim <= 1.0


def test_supervised_propensity_calibration():
    """Verify supervised LogisticRegression models predict calibrated probabilities in [0.0, 1.0]."""
    # 1. High anomaly / fraud scenario
    fraud_cust = {"customer_id": "cust_fraud", "monthly_income": 80000}
    fraud_feats = {
        "transaction_metrics": {
            "total_debit_volume": 90000,
            "total_tx_count": 10,
            "odd_hours_volume": 60000,
            "max_debit_amount": 50000
        }
    }
    fraud_signals = {"anomaly_score": 96, "fraud_alert_detected": True}
    fraud_vec = FinancialFeatureVectorizer.vectorize(fraud_cust, fraud_feats, fraud_signals, health="stable")

    p_fraud = SupervisedPropensityModel.predict_propensity("rec_fraud_guard", fraud_vec)
    assert 0.0 <= p_fraud <= 1.0
    assert p_fraud > 0.60, f"Expected high fraud propensity, got {p_fraud}"

    # 2. Commute metro scenario
    commuter_cust = {"customer_id": "cust_commuter", "monthly_income": 75000}
    commuter_feats = {
        "transaction_metrics": {
            "total_debit_volume": 35000,
            "category_volumes": {"transit": 5000},
            "total_tx_count": 30
        },
        "commute_detected": True
    }
    commuter_signals = {"commute_habit_detected": True}
    metro_vec = FinancialFeatureVectorizer.vectorize(commuter_cust, commuter_feats, commuter_signals, health="stable")

    p_metro = SupervisedPropensityModel.predict_propensity("rec_commute_metro", metro_vec)
    assert 0.0 <= p_metro <= 1.0
    assert p_metro > 0.60, f"Expected high metro propensity, got {p_metro}"

    # Check batch prediction
    all_props = SupervisedPropensityModel.predict_all(metro_vec)
    assert len(all_props) == len(PRODUCT_CATALOG)

    # Feature importance
    top_feats = SupervisedPropensityModel.get_feature_importance("rec_commute_metro", top_n=3)
    assert len(top_feats) == 3


def test_linucb_online_learning_update():
    """Verify LinUCB contextual bandit updates covariance and adapts score upon reward signals."""
    LinUCBBandit.reset()
    vec = np.random.uniform(0.1, 0.9, size=32)

    # 1. Cold arm online learning: initial score starts at prior, positive rewards increase score
    initial_score = LinUCBBandit.score("test_arm_online", vec)
    assert 0.0 <= initial_score <= 1.0

    # User repeatedly accepts product recommendation (reward = +1.0)
    for _ in range(5):
        LinUCBBandit.update("test_arm_online", vec, reward=1.0)

    updated_score = LinUCBBandit.score("test_arm_online", vec)
    assert updated_score > initial_score, f"Score must increase after repeated positive reward (got {initial_score} -> {updated_score})"

    # 2. Pre-warmed catalog arm maintains strong baseline
    metro_score = LinUCBBandit.score("rec_commute_metro", vec)
    assert metro_score >= 0.70

    # Export state verification
    state = LinUCBBandit.export_state()
    assert "test_arm_online" in state
    assert len(state["test_arm_online"]["b"]) == 32


def test_ml_inference_latency():
    """Verify complete ML pipeline execution latency is strictly under 15ms per customer."""
    vec = np.random.uniform(0.1, 0.9, size=32)

    # Warmup
    _ = KMeansClusterer.soft_cluster_probabilities(vec)
    _ = SupervisedPropensityModel.predict_all(vec)

    start_time = time.perf_counter()
    iterations = 50
    for _ in range(iterations):
        _ = KMeansClusterer.soft_cluster_probabilities(vec)
        _ = SupervisedPropensityModel.predict_all(vec)
        for pid in PRODUCT_CATALOG:
            _ = ProductEmbeddingSpace.compute_cosine_similarity(vec, pid)
            _ = LinUCBBandit.score(pid, vec)
    elapsed = time.perf_counter() - start_time
    avg_latency_ms = (elapsed / iterations) * 1000.0

    assert avg_latency_ms < 15.0, f"Average ML inference latency must be <15ms, took {avg_latency_ms:.2f}ms"
