"""Automated Test Suite for Recommendation Engine Models Trained on Full PostgreSQL Dataset."""

import time
import json
from pathlib import Path
import numpy as np
import pytest
import joblib

from ai.intelligence.ml.vectorizer import FinancialFeatureVectorizer
from ai.intelligence.ml.clustering import KMeansClusterer
from ai.intelligence.ml.bandit import LinUCBBandit
from ai.intelligence.ml.propensity import SupervisedPropensityModel
from ai.intelligence.personalization.catalog import PRODUCT_CATALOG

CHECKPOINT_DIR = Path(__file__).resolve().parents[1] / "intelligence" / "ml" / "checkpoints"


def test_kmeans_checkpoint_trained_on_db():
    """Verify KMeans model loaded from checkpoint has 7 clusters and assigns calibrated soft probabilities."""
    kmeans_path = CHECKPOINT_DIR / "kmeans_archetypes_v1.joblib"
    assert kmeans_path.exists(), "KMeans checkpoint must exist"

    artifact = joblib.load(kmeans_path)
    assert "model" in artifact
    assert "centroid_map" in artifact
    model = artifact["model"]

    assert model.n_clusters == 7
    assert model.cluster_centers_.shape == (7, 32)
    assert len(artifact["centroid_map"]) == 7

    # Test soft probability calculation
    test_vec = np.random.uniform(0.1, 0.9, size=32)
    probs = KMeansClusterer.soft_cluster_probabilities(test_vec)
    assert len(probs) == 7
    assert abs(sum(probs.values()) - 1.0) < 1e-2


def test_propensity_models_trained_on_db():
    """Verify supervised propensity models load and predict across all 19 products."""
    cpu_path = CHECKPOINT_DIR / "propensity_models_v1.joblib"
    assert cpu_path.exists(), "CPU propensity checkpoint must exist"

    artifact = joblib.load(cpu_path)
    models = artifact["models"]
    assert len(models) == 19

    # Re-warm in SupervisedPropensityModel
    SupervisedPropensityModel._is_trained = False
    SupervisedPropensityModel._models.clear()
    SupervisedPropensityModel.train()

    test_vec = np.random.uniform(0.1, 0.9, size=32)
    t0 = time.perf_counter()
    all_props = SupervisedPropensityModel.predict_all(test_vec)
    latency_ms = (time.perf_counter() - t0) * 1000.0

    assert len(all_props) == 19
    assert latency_ms < 10.0, f"Propensity scoring across all 19 products must be <10ms, took {latency_ms:.2f}ms"

    for pid, prob in all_props.items():
        assert 0.0 <= prob <= 1.0, f"Probability for {pid} must be in [0, 1], got {prob}"


def test_gpu_propensity_models_checkpoint():
    """Verify GPU-trained XGBoost models checkpoint loads cleanly."""
    gpu_path = CHECKPOINT_DIR / "gpu_propensity_models_v1.joblib"
    assert gpu_path.exists(), "GPU propensity checkpoint must exist"

    artifact = joblib.load(gpu_path)
    assert "models" in artifact
    models = artifact["models"]
    assert len(models) == 19

    test_vec = np.random.uniform(0.1, 0.9, size=(1, 32)).astype(np.float32)
    for pid, clf in models.items():
        prob = float(clf.predict_proba(test_vec)[0, 1])
        assert 0.0 <= prob <= 1.0


def test_linucb_bandit_priors_on_db():
    """Verify LinUCB bandit priors are pre-warmed with observations from PostgreSQL dataset."""
    bandit_path = CHECKPOINT_DIR / "linucb_bandit_prior_v1.json"
    assert bandit_path.exists(), "Bandit priors JSON must exist"

    with open(bandit_path, "r", encoding="utf-8") as f:
        priors = json.load(f)

    assert len(priors) == 19
    for pid, data in priors.items():
        assert len(data["b"]) == 32
        assert len(data["A_diag"]) == 32
        assert data["total_observations"] == 1200
        assert data["positive_interactions"] > 0
        # Diagonals of covariance matrix A = I + sum(x x^T) must be >= 1.0
        for diag_val in data["A_diag"]:
            assert diag_val >= 1.0


def test_metadata_json_metrics():
    """Verify metadata.json contains full accuracy, precision, recall, F1, and ROC-AUC metrics."""
    meta_path = CHECKPOINT_DIR / "metadata.json"
    assert meta_path.exists(), "Metadata JSON must exist"

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert meta["n_samples"] == 1200
    assert meta["n_products"] == 19
    assert "evaluation_metrics" in meta

    eval_m = meta["evaluation_metrics"]
    assert eval_m["mean_accuracy"] > 0.85
    assert eval_m["mean_f1"] > 0.70
    assert eval_m["mean_roc_auc"] > 0.85

    for pid, p_m in eval_m["per_product"].items():
        assert p_m["accuracy"] > 0.75
        assert p_m["roc_auc"] > 0.75
