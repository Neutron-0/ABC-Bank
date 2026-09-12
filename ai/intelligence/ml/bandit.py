"""Reinforcement Learning LinUCB Contextual Bandit for Continuous Online Banking Recommendation."""

from __future__ import annotations
from typing import Dict, Any, List
import numpy as np


from pathlib import Path
import json


class LinUCBBandit:
    """Disjoint LinUCB (Linear Upper Confidence Bound) Contextual Bandit in R^32.

    Learns optimal product selection continuously from customer feedback (clicks, dismissals, completions)
    balancing exploration of nascent products and exploitation of high-reward actions.
    """

    DIMENSION: int = 32
    ALPHA_EXPLORATION: float = 0.25

    # Arm state storage: per product_id -> A matrix (d x d) and b vector (d x 1)
    _A: Dict[str, np.ndarray] = {}
    _b: Dict[str, np.ndarray] = {}
    _inv_A: Dict[str, np.ndarray] = {}

    @classmethod
    def _init_arm(cls, product_id: str) -> None:
        """Initializes covariance matrix and reward vector for an arm, using pre-warmed checkpoint if available."""
        if product_id in cls._A:
            return

        cls._A[product_id] = np.identity(cls.DIMENSION, dtype=np.float64)
        cls._b[product_id] = np.zeros(cls.DIMENSION, dtype=np.float64)

        checkpoint_path = Path(__file__).resolve().parent / "checkpoints" / "linucb_bandit_prior_v1.json"
        if checkpoint_path.exists():
            try:
                with open(checkpoint_path, "r", encoding="utf-8") as f:
                    priors = json.load(f)
                if product_id in priors:
                    arm_prior = priors[product_id]
                    if "b" in arm_prior:
                        cls._b[product_id] = np.array(arm_prior["b"], dtype=np.float64)
                    if "A_diag" in arm_prior:
                        np.fill_diagonal(cls._A[product_id], arm_prior["A_diag"])
            except Exception:
                pass

        cls._inv_A[product_id] = np.linalg.inv(cls._A[product_id])

    @classmethod
    def score(cls, product_id: str, vector: np.ndarray, alpha: float | None = None) -> float:
        """Computes Upper Confidence Bound score UCB_a(x) = theta^T x + alpha * sqrt(x^T A_a^-1 x).

        Returns:
            Normalized score in [0.0, 1.0].
        """
        cls._init_arm(product_id)
        if alpha is None:
            alpha = cls.ALPHA_EXPLORATION

        x = np.asarray(vector, dtype=np.float64).reshape(-1)
        if len(x) != cls.DIMENSION:
            padded = np.zeros(cls.DIMENSION, dtype=np.float64)
            copy_len = min(len(x), cls.DIMENSION)
            padded[:copy_len] = x[:copy_len]
            x = padded

        inv_A = cls._inv_A[product_id]
        b = cls._b[product_id]

        # Parameter estimate theta_a = A_a^-1 * b_a
        theta = np.dot(inv_A, b)

        # Expected reward and exploration variance
        expected_reward = float(np.dot(theta, x))
        variance = float(np.dot(x, np.dot(inv_A, x)))
        std_dev = float(np.sqrt(max(0.0, variance)))

        ucb_raw = expected_reward + alpha * std_dev

        # Map typical UCB range [-1.0, 2.0] into calibrated [0.0, 1.0]
        calibrated = float(np.clip((ucb_raw + 0.5) / 2.0, 0.0, 1.0))
        return float(round(calibrated, 4))

    @classmethod
    def update(cls, product_id: str, vector: np.ndarray, reward: float) -> None:
        """Online Sherman-Morrison update of arm covariance and reward vector upon user feedback.

        A_a <- A_a + x * x^T
        b_a <- b_a + r * x
        """
        cls._init_arm(product_id)
        x = np.asarray(vector, dtype=np.float64).reshape(-1)
        if len(x) != cls.DIMENSION:
            padded = np.zeros(cls.DIMENSION, dtype=np.float64)
            copy_len = min(len(x), cls.DIMENSION)
            padded[:copy_len] = x[:copy_len]
            x = padded

        # Update A and b
        cls._A[product_id] += np.outer(x, x)
        cls._b[product_id] += float(reward) * x

        # Update inverted covariance matrix
        cls._inv_A[product_id] = np.linalg.inv(cls._A[product_id])

    @classmethod
    def export_state(cls) -> Dict[str, Any]:
        """Serializes current bandit weights for persistence across runs."""
        state: Dict[str, Any] = {}
        for pid in cls._A:
            state[pid] = {
                "b": cls._b[pid].tolist(),
                "A_diag": np.diag(cls._A[pid]).tolist()
            }
        return state

    @classmethod
    def reset(cls) -> None:
        """Resets all arms to prior distribution (used for testing)."""
        cls._A.clear()
        cls._b.clear()
        cls._inv_A.clear()
