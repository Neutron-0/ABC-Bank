"""Unsupervised KMeans Clustering Engine for Bharat Banking Archetypes."""

from __future__ import annotations
from pathlib import Path
from typing import Dict, Any, List, Tuple
import numpy as np
from sklearn.cluster import KMeans
from scipy.special import softmax

from ai.intelligence.personalization.archetypes import ArchetypeId


class KMeansClusterer:
    """Unsupervised 7-Cluster KMeans model partitioning customer vectors into Bharat archetypes with soft assignment."""

    ARCHETYPE_ORDER: List[ArchetypeId] = [
        ArchetypeId.URBAN_COMMUTER,
        ArchetypeId.MSME_MERCHANT,
        ArchetypeId.GIG_WORKER,
        ArchetypeId.RURAL_FARMER,
        ArchetypeId.STUDENT_FIRST_EARNER,
        ArchetypeId.SENIOR_PENSIONER,
        ArchetypeId.HOMEMAKER_SHG,
    ]

    _model: KMeans | None = None
    _archetype_centroid_map: Dict[int, ArchetypeId] = {}

    @classmethod
    def _generate_synthetic_seed_profiles(cls) -> Tuple[np.ndarray, np.ndarray]:
        """Generates domain-grounded training distributions across all 7 archetypes in R^32."""
        rng = np.random.default_rng(42)
        n_samples_per_cluster = 40
        x_list = []
        y_list = []

        # Feature order reference (32 dims):
        # 0: entropy, 1: burn_vel, 2: burn_acc, 3: dti, 4: buffer, 5: savings_rate
        # 6: disc_ratio, 7: ess_ratio, 8: health_ratio, 9: transit_ratio, 10: agri_ratio
        # 11: merch_ratio, 12: debt_ratio, 13: edu_ratio, 14: periodic_transit, 15: anomaly
        # 16: volatility, 17: upi_idx, 18: micro_ratio, 19: max_debit_conc, 20: cibil
        # 21: bal_income, 22: reserve_ratio, 23: credit_cnt, 24: corp_sal, 25: deficit
        # 26: kyc, 27: age, 28: weekend, 29: odd_hours, 30: punctuality, 31: health_score

        prototype_archetypes = {
            # Urban Commuter: high transit, metro periodic, high corp salary, moderate cibil
            ArchetypeId.URBAN_COMMUTER: [
                0.75, 0.40, 0.20, 0.30, 0.50, 0.30,
                0.35, 0.45, 0.05, 0.15, 0.00,
                0.02, 0.20, 0.05, 0.95, 0.05,
                0.20, 0.85, 0.30, 0.25, 0.75,
                0.40, 0.40, 0.30, 0.95, 0.05,
                0.90, 0.22, 0.30, 0.05, 0.95, 0.75
            ],
            # MSME Merchant: high merchant vendor, high credit count, high volatility, low corp salary
            ArchetypeId.MSME_MERCHANT: [
                0.60, 0.70, 0.50, 0.35, 0.60, 0.25,
                0.15, 0.30, 0.05, 0.05, 0.02,
                0.60, 0.15, 0.02, 0.20, 0.10,
                0.70, 0.90, 0.25, 0.35, 0.70,
                0.60, 0.35, 0.90, 0.10, 0.15,
                0.90, 0.35, 0.25, 0.10, 0.85, 0.70
            ],
            # Gig Worker: high micro spends, high upi, low buffer, high burn
            ArchetypeId.GIG_WORKER: [
                0.55, 0.65, 0.45, 0.35, 0.20, 0.10,
                0.20, 0.55, 0.10, 0.25, 0.00,
                0.05, 0.15, 0.02, 0.40, 0.05,
                0.50, 0.95, 0.80, 0.15, 0.50,
                0.15, 0.10, 0.50, 0.10, 0.40,
                0.40, 0.15, 0.30, 0.15, 0.70, 0.50
            ],
            # Rural Farmer: high agri, low upi, seasonal inflow, rural age
            ArchetypeId.RURAL_FARMER: [
                0.40, 0.45, 0.60, 0.25, 0.40, 0.20,
                0.10, 0.40, 0.08, 0.02, 0.55,
                0.05, 0.10, 0.02, 0.10, 0.05,
                0.65, 0.30, 0.30, 0.40, 0.60,
                0.35, 0.45, 0.20, 0.05, 0.20,
                0.50, 0.42, 0.20, 0.02, 0.80, 0.60
            ],
            # Student First Earner: young age, low income/buffer, high entertainment, micro spends
            ArchetypeId.STUDENT_FIRST_EARNER: [
                0.65, 0.50, 0.30, 0.10, 0.15, 0.05,
                0.55, 0.30, 0.02, 0.10, 0.00,
                0.02, 0.00, 0.30, 0.30, 0.05,
                0.30, 0.98, 0.85, 0.20, 0.45,
                0.10, 0.05, 0.20, 0.10, 0.25,
                0.30, 0.03, 0.40, 0.20, 0.65, 0.55
            ],
            # Senior Pensioner: older age, low volatility, high reserve, high healthcare/pharmacy
            ArchetypeId.SENIOR_PENSIONER: [
                0.45, 0.30, 0.10, 0.05, 0.85, 0.45,
                0.10, 0.45, 0.35, 0.02, 0.00,
                0.00, 0.02, 0.00, 0.10, 0.05,
                0.15, 0.40, 0.20, 0.20, 0.80,
                0.80, 0.85, 0.20, 0.90, 0.05,
                0.90, 0.70, 0.20, 0.01, 0.95, 0.80
            ],
            # Homemaker SHG: low formal credit, micro savings, high groceries/essentials
            ArchetypeId.HOMEMAKER_SHG: [
                0.50, 0.35, 0.20, 0.15, 0.35, 0.25,
                0.15, 0.65, 0.10, 0.05, 0.05,
                0.05, 0.05, 0.05, 0.15, 0.02,
                0.25, 0.60, 0.45, 0.15, 0.55,
                0.25, 0.30, 0.25, 0.10, 0.15,
                0.40, 0.30, 0.25, 0.02, 0.85, 0.60
            ]
        }

        for arch_idx, arch_id in enumerate(cls.ARCHETYPE_ORDER):
            base_proto = np.array(prototype_archetypes[arch_id], dtype=np.float64)
            for _ in range(n_samples_per_cluster):
                noise = rng.normal(0.0, 0.04, size=32)
                sample = np.clip(base_proto + noise, 0.0, 1.0)
                x_list.append(sample)
                y_list.append(arch_idx)

        return np.array(x_list), np.array(y_list)

    @classmethod
    def get_model(cls) -> KMeans:
        """Lazily initializes or loads the pre-trained KMeans model from checkpoints."""
        if cls._model is not None:
            return cls._model

        checkpoint_path = Path(__file__).resolve().parent / "checkpoints" / "kmeans_archetypes_v1.joblib"
        if checkpoint_path.exists():
            try:
                import joblib
                artifact = joblib.load(checkpoint_path)
                cls._model = artifact["model"]
                raw_map = artifact["centroid_map"]
                cls._archetype_centroid_map = {int(k): ArchetypeId(v) for k, v in raw_map.items()}
                return cls._model
            except Exception:
                pass

        # Fallback: train on the fly deterministically
        x_train, y_train = cls._generate_synthetic_seed_profiles()
        initial_centers = []
        for arch_idx in range(len(cls.ARCHETYPE_ORDER)):
            cluster_samples = x_train[y_train == arch_idx]
            initial_centers.append(np.mean(cluster_samples, axis=0))
        init_matrix = np.array(initial_centers)

        kmeans = KMeans(
            n_clusters=7,
            init=init_matrix,
            n_init=1,
            max_iter=300,
            random_state=42
        )
        kmeans.fit(x_train)

        # Bipartite matching ensures exact 1-to-1 optimal assignment between cluster centers and archetypes
        from scipy.optimize import linear_sum_assignment
        cost_matrix = np.zeros((7, 7), dtype=np.float64)
        for c_idx, center in enumerate(kmeans.cluster_centers_):
            for a_idx, proto in enumerate(init_matrix):
                cost_matrix[c_idx, a_idx] = np.linalg.norm(center - proto)

        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        cls._archetype_centroid_map = {int(r): cls.ARCHETYPE_ORDER[int(c)] for r, c in zip(row_ind, col_ind)}

        cls._model = kmeans
        return cls._model

    @classmethod
    def soft_cluster_probabilities(cls, vector: np.ndarray, temperature: float = 0.5) -> Dict[str, float]:
        """Calculates soft assignment probability distribution across Bharat archetypes via temperature softmax.

        p(cluster_j | x) = softmax(-||x - mu_j||^2 / (2 * temperature^2))
        """
        model = cls.get_model()
        x = np.asarray(vector, dtype=np.float64).reshape(1, -1)

        # Distances to each centroid
        centroids = model.cluster_centers_
        squared_distances = np.sum((centroids - x) ** 2, axis=1)

        # Scale by temperature and apply softmax
        scaled_logits = -squared_distances / (2.0 * max(0.05, temperature ** 2))
        probs = softmax(scaled_logits)

        prob_dict: Dict[str, float] = {}
        for cluster_idx, p in enumerate(probs):
            arch_id = cls._archetype_centroid_map.get(cluster_idx, cls.ARCHETYPE_ORDER[cluster_idx])
            prob_dict[arch_id.value] = float(round(p, 4))

        # Normalize to strictly 1.00 sum
        total_p = sum(prob_dict.values())
        if total_p > 0:
            prob_dict = {k: float(round(v / total_p, 4)) for k, v in prob_dict.items()}

        return prob_dict

    @classmethod
    def predict_archetype(cls, vector: np.ndarray) -> Tuple[str, float]:
        """Predicts the single most probable archetype and its posterior confidence probability."""
        probs = cls.soft_cluster_probabilities(vector)
        top_arch = max(probs.items(), key=lambda item: item[1])
        return top_arch[0], top_arch[1]
