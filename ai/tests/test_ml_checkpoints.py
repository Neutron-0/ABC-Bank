"""Test suite for Pre-Trained Machine Learning Model Checkpoints & Serialization."""

import sys
import time
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import numpy as np
import pytest
import joblib

from ai.intelligence.ml.vectorizer import FinancialFeatureVectorizer
from ai.intelligence.ml.clustering import KMeansClusterer
from ai.intelligence.ml.propensity import SupervisedPropensityModel
from ai.intelligence.ml.bandit import LinUCBBandit
from ai.intelligence.personalization.engine import PersonalizationEngine
from ai.intelligence.personalization.catalog import PRODUCT_CATALOG


CHECKPOINTS_DIR = ROOT_DIR / "ai" / "intelligence" / "ml" / "checkpoints"


def test_checkpoints_exist_and_metadata_valid():
    """Verify all 4 model checkpoint artifacts exist and exhibit high-fidelity training metrics."""
    assert CHECKPOINTS_DIR.exists(), "Checkpoints directory must exist!"

    kmeans_path = CHECKPOINTS_DIR / "kmeans_archetypes_v1.joblib"
    propensity_path = CHECKPOINTS_DIR / "propensity_models_v1.joblib"
    bandit_path = CHECKPOINTS_DIR / "linucb_bandit_prior_v1.json"
    metadata_path = CHECKPOINTS_DIR / "metadata.json"

    assert kmeans_path.exists() and kmeans_path.stat().st_size > 1000
    assert propensity_path.exists() and propensity_path.stat().st_size > 1000
    assert bandit_path.exists() and bandit_path.stat().st_size > 1000
    assert metadata_path.exists()

    with open(metadata_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert meta["training_samples_count"] >= 10000, f"Expected >=10000 samples, got {meta['training_samples_count']}"
    assert meta["mean_roc_auc"] >= 0.95, f"Expected high mean ROC-AUC, got {meta['mean_roc_auc']}"
    assert meta["feature_dimension"] == 32
    assert meta["archetypes_count"] == 7
    assert meta["products_count"] == 19
    assert meta["status"] == "PRODUCTION_READY"


def test_kmeans_checkpoint_loading_and_soft_clustering():
    """Verify KMeans model loads from disk and calculates valid soft probabilities."""
    KMeansClusterer._model = None  # Force reload from checkpoint
    model = KMeansClusterer.get_model()

    assert model is not None
    assert model.n_clusters == 7
    assert model.cluster_centers_.shape == (7, 32)

    # Test soft probability inference
    test_vec = np.random.uniform(0.1, 0.9, size=32)
    probs = KMeansClusterer.soft_cluster_probabilities(test_vec)
    assert len(probs) == 7
    assert abs(sum(probs.values()) - 1.0) < 1e-2


def test_propensity_checkpoint_instant_prediction():
    """Verify pre-trained propensity models load instantly without re-training and predict calibrated outputs."""
    SupervisedPropensityModel._is_trained = False
    SupervisedPropensityModel._models.clear()

    test_vec = np.random.uniform(0.1, 0.9, size=32)

    t0 = time.perf_counter()
    all_props = SupervisedPropensityModel.predict_all(test_vec)
    latency_ms = (time.perf_counter() - t0) * 1000.0

    assert SupervisedPropensityModel._is_trained is True
    assert len(all_props) == len(PRODUCT_CATALOG)
    assert latency_ms < 10.0, f"Inference with checkpoints must be fast, took {latency_ms:.2f}ms"

    for pid, prob in all_props.items():
        assert 0.0 <= prob <= 1.0, f"Propensity for {pid} must be in [0, 1], got {prob}"


def test_linucb_bandit_prewarmed_from_checkpoint():
    """Verify LinUCB contextual bandit initializes with pre-warmed prior matrices from historical CTR logs."""
    LinUCBBandit.reset()
    test_vec = np.random.uniform(0.1, 0.9, size=32)

    score = LinUCBBandit.score("rec_commute_metro", test_vec)
    assert 0.0 <= score <= 1.0

    # Ensure arm b-vector has been pre-warmed with non-zero prior weights
    b_vec = LinUCBBandit._b.get("rec_commute_metro")
    assert b_vec is not None
    assert np.linalg.norm(b_vec) > 0.0, "Bandit arm must be pre-warmed from historical checkpoint!"


def test_end_to_end_recommendation_with_checkpoints():
    """Verify complete PersonalizationEngine evaluation operates seamlessly using pre-trained ML checkpoints."""
    mock_customer = {
        "customer_id": "cust_pre_trained_test",
        "monthly_income": 95000,
        "balance": {"available": 55000, "savings": 220000},
        "credit_score": 790,
        "age": 32
    }
    mock_features = {
        "transaction_metrics": {
            "total_debit_volume": 40000,
            "total_tx_count": 35,
            "category_volumes": {"transit": 6000, "groceries": 15000, "dining": 8000},
            "upi_tx_count": 30
        },
        "commute_detected": True
    }
    mock_signals = {
        "commute_habit_detected": True,
        "debt_to_income_ratio": 0.18,
        "savings_trend": "positive"
    }

    res = PersonalizationEngine.evaluate(
        customer_data=mock_customer,
        features=mock_features,
        signals=mock_signals,
        health="stable"
    )

    assert "active_recommendations" in res
    assert "top_5_recommendations" in res
    assert len(res["top_5_recommendations"]) <= 5
    assert "ml_metadata" in res

    ml_meta = res["ml_metadata"]
    assert ml_meta["vector_dimension"] == 32
    assert len(ml_meta["cluster_probabilities"]) == 7
    assert len(ml_meta["feature_summary"]) == 32
