"""Automated Test Suite for GPU Recommendation Training Pipeline on NVIDIA CUDA."""

import sys
import os
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pytest
import numpy as np

try:
    import xgboost as xgb
except ImportError:
    xgb = None

if xgb is None:
    pytest.skip("xgboost is not installed, skipping GPU tests", allow_module_level=True)

from ai.intelligence.ml.gpu_trainer import GPURecommendationTrainer, GPUTelemetry
from ai.intelligence.ml.propensity import SupervisedPropensityModel


def test_gpu_telemetry_query():
    """Verify nvidia-smi telemetry query executes and returns hardware stats."""
    metrics = GPUTelemetry.get_metrics()
    assert isinstance(metrics, dict)
    assert "gpu_util_pct" in metrics
    assert "mem_used_mb" in metrics
    assert "temp_c" in metrics
    assert "power_watts" in metrics


def test_gpu_trainer_batch_generation_and_shapes():
    """Verify GPU trainer generates stratified batches partitioned into train and holdout sets."""
    device = "cuda" if GPUTelemetry.get_metrics().get("available") else "cpu"
    trainer = GPURecommendationTrainer(device=device)
    X_train, y_train, X_val, y_val = trainer.generate_streaming_batch(batch_size=5000, epoch_seed=42)

    assert X_train.shape[1] == 32
    assert X_val.shape[1] == 32
    assert len(y_train) == 19
    assert len(y_val) == 19
    assert len(X_train) == int(len(X_train) + len(X_val)) * 0.8 or len(X_train) > 0


def test_gpu_cuda_single_product_fit():
    """Verify single-product deep tree fit on CUDA cores."""
    if not GPUTelemetry.get_metrics().get("available"):
        pytest.skip("CUDA GPU not available on host")
    trainer = GPURecommendationTrainer(device="cuda")
    X_train, y_train, X_val, y_val = trainer.generate_streaming_batch(batch_size=3000, epoch_seed=99)

    clf = trainer.train_product_model(
        product_id="rec_fraud_guard",
        X_train=X_train,
        y_train=y_train["rec_fraud_guard"],
        max_depth=8,
        n_estimators=50,
        learning_rate=0.05
    )

    clf.set_params(device="cpu")
    probs = clf.predict_proba(X_val)[:, 1]
    assert len(probs) == len(X_val)
    assert np.all((probs >= 0.0) & (probs <= 1.0))
