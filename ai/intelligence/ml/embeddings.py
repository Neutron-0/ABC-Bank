"""Dense 32-Dimensional Product Capability Embeddings and Cosine Vector Space."""

from __future__ import annotations
from typing import Dict, List
import numpy as np


class ProductEmbeddingSpace:
    """Maintains 32-dimensional capability embedding vectors for all Bharat Banking products and computes cosine similarities."""

    # 32-dimensional prototype capability vectors aligned with FinancialFeatureVectorizer.FEATURE_NAMES
    PRODUCT_EMBEDDINGS: Dict[str, List[float]] = {
        # 1. Security & Fraud
        "rec_fraud_guard": [
            0.80, 0.90, 0.85, 0.20, 0.30, 0.10,
            0.10, 0.10, 0.05, 0.05, 0.00,
            0.05, 0.05, 0.00, 0.10, 0.98,
            0.90, 0.80, 0.20, 0.90, 0.50,
            0.30, 0.20, 0.20, 0.20, 0.85,
            0.50, 0.40, 0.20, 0.95, 0.40, 0.40
        ],
        # 2. Healthcare Emergency
        "rec_medical_claim": [
            0.40, 0.85, 0.80, 0.35, 0.20, 0.05,
            0.05, 0.50, 0.95, 0.02, 0.00,
            0.02, 0.15, 0.00, 0.05, 0.60,
            0.75, 0.60, 0.10, 0.85, 0.60,
            0.20, 0.15, 0.15, 0.30, 0.80,
            0.60, 0.55, 0.20, 0.30, 0.60, 0.30
        ],
        # 3. Cashflow Stabilization Guidance
        "rec_cashflow_guidance": [
            0.65, 0.80, 0.70, 0.85, 0.10, 0.02,
            0.35, 0.45, 0.10, 0.05, 0.05,
            0.10, 0.75, 0.05, 0.10, 0.30,
            0.80, 0.70, 0.50, 0.40, 0.35,
            0.08, 0.05, 0.20, 0.20, 0.95,
            0.40, 0.30, 0.30, 0.10, 0.25, 0.05
        ],
        # 4. Urban Metro Commute
        "rec_commute_metro": [
            0.70, 0.35, 0.15, 0.25, 0.55, 0.35,
            0.30, 0.40, 0.05, 0.85, 0.00,
            0.02, 0.15, 0.05, 0.98, 0.05,
            0.20, 0.90, 0.40, 0.20, 0.75,
            0.45, 0.40, 0.30, 0.90, 0.05,
            0.85, 0.22, 0.30, 0.05, 0.95, 0.75
        ],
        # 5. Smart Wealth Auto-Sweep
        "rec_smart_savings": [
            0.60, 0.25, 0.10, 0.15, 0.90, 0.85,
            0.30, 0.35, 0.05, 0.05, 0.02,
            0.05, 0.05, 0.05, 0.30, 0.02,
            0.15, 0.80, 0.15, 0.20, 0.85,
            0.85, 0.90, 0.30, 0.85, 0.02,
            0.90, 0.38, 0.25, 0.02, 0.95, 0.95
        ],
        # 6. Personal Credit Loan
        "rec_personal_loan": [
            0.55, 0.40, 0.20, 0.25, 0.65, 0.30,
            0.40, 0.35, 0.05, 0.05, 0.00,
            0.05, 0.20, 0.05, 0.30, 0.05,
            0.25, 0.75, 0.15, 0.40, 0.85,
            0.55, 0.50, 0.30, 0.85, 0.05,
            0.95, 0.35, 0.25, 0.05, 0.90, 0.80
        ],
        # 7. MSME Working Capital Credit Line
        "rec_msme_credit_line": [
            0.50, 0.75, 0.55, 0.35, 0.65, 0.25,
            0.10, 0.25, 0.05, 0.05, 0.02,
            0.85, 0.20, 0.02, 0.15, 0.10,
            0.75, 0.90, 0.25, 0.45, 0.70,
            0.65, 0.35, 0.95, 0.15, 0.15,
            0.95, 0.38, 0.20, 0.10, 0.85, 0.70
        ],
        # 8. Sachet Daily Micro-Insurance
        "rec_sachet_insurance": [
            0.55, 0.65, 0.40, 0.30, 0.20, 0.10,
            0.15, 0.60, 0.15, 0.30, 0.05,
            0.05, 0.15, 0.02, 0.45, 0.05,
            0.55, 0.95, 0.85, 0.15, 0.50,
            0.15, 0.10, 0.50, 0.10, 0.35,
            0.40, 0.16, 0.30, 0.15, 0.70, 0.50
        ],
        # 9. Kisan Credit Card (KCC) Top-up
        "rec_kcc_topup": [
            0.35, 0.45, 0.60, 0.25, 0.40, 0.20,
            0.05, 0.35, 0.05, 0.02, 0.85,
            0.05, 0.15, 0.02, 0.10, 0.05,
            0.70, 0.30, 0.25, 0.45, 0.60,
            0.35, 0.40, 0.20, 0.05, 0.20,
            0.50, 0.42, 0.20, 0.02, 0.80, 0.60
        ],
        # 10. Student Credit Builder
        "rec_credit_builder": [
            0.65, 0.50, 0.30, 0.10, 0.15, 0.05,
            0.50, 0.25, 0.02, 0.10, 0.00,
            0.02, 0.00, 0.35, 0.35, 0.05,
            0.30, 0.98, 0.90, 0.20, 0.40,
            0.10, 0.05, 0.20, 0.10, 0.20,
            0.30, 0.03, 0.40, 0.20, 0.65, 0.55
        ],
        # 11. Senior Citizen SCSS High Yield
        "rec_senior_scss": [
            0.40, 0.25, 0.10, 0.05, 0.90, 0.50,
            0.10, 0.40, 0.30, 0.02, 0.00,
            0.00, 0.02, 0.00, 0.10, 0.05,
            0.15, 0.35, 0.15, 0.20, 0.80,
            0.85, 0.90, 0.20, 0.90, 0.05,
            0.90, 0.72, 0.20, 0.01, 0.95, 0.80
        ],
        # 12. NCMC Transit Reload
        "srv_ncmc_reload": [
            0.70, 0.35, 0.15, 0.25, 0.50, 0.30,
            0.30, 0.40, 0.05, 0.95, 0.00,
            0.02, 0.15, 0.05, 0.98, 0.05,
            0.20, 0.95, 0.50, 0.15, 0.70,
            0.40, 0.35, 0.30, 0.90, 0.05,
            0.80, 0.22, 0.30, 0.05, 0.95, 0.70
        ],
        # 13. CIBIL Bureau Refresh
        "srv_cibil_refresh": [
            0.60, 0.40, 0.20, 0.30, 0.45, 0.30,
            0.30, 0.35, 0.05, 0.10, 0.02,
            0.05, 0.40, 0.05, 0.30, 0.05,
            0.30, 0.80, 0.30, 0.25, 0.70,
            0.40, 0.35, 0.30, 0.70, 0.10,
            0.75, 0.28, 0.25, 0.05, 0.90, 0.70
        ],
        # 14. Credit Card Bill Payment
        "srv_credit_card_bill": [
            0.65, 0.45, 0.25, 0.35, 0.50, 0.25,
            0.40, 0.30, 0.05, 0.08, 0.02,
            0.05, 0.65, 0.05, 0.35, 0.05,
            0.35, 0.85, 0.25, 0.30, 0.75,
            0.45, 0.40, 0.30, 0.80, 0.15,
            0.85, 0.30, 0.30, 0.05, 0.90, 0.70
        ],
        # 15. FASTag Toll Recharge
        "srv_fastag_recharge": [
            0.60, 0.40, 0.20, 0.25, 0.55, 0.30,
            0.30, 0.35, 0.05, 0.60, 0.05,
            0.10, 0.15, 0.02, 0.50, 0.05,
            0.30, 0.85, 0.35, 0.25, 0.75,
            0.50, 0.40, 0.30, 0.70, 0.05,
            0.80, 0.32, 0.45, 0.05, 0.90, 0.70
        ],
        # 16. Mobile & DTH Recharge
        "srv_mobile_recharge": [
            0.60, 0.50, 0.30, 0.20, 0.30, 0.15,
            0.30, 0.45, 0.05, 0.15, 0.05,
            0.05, 0.05, 0.10, 0.30, 0.05,
            0.35, 0.95, 0.70, 0.15, 0.60,
            0.25, 0.20, 0.35, 0.40, 0.15,
            0.50, 0.18, 0.30, 0.10, 0.85, 0.60
        ],
        # 17. Form 15G / 15H TDS Exemption
        "srv_form15g_h": [
            0.35, 0.25, 0.10, 0.05, 0.85, 0.50,
            0.05, 0.40, 0.20, 0.02, 0.02,
            0.02, 0.02, 0.00, 0.10, 0.02,
            0.15, 0.30, 0.15, 0.20, 0.80,
            0.80, 0.85, 0.20, 0.85, 0.02,
            0.90, 0.65, 0.20, 0.01, 0.95, 0.80
        ],
        # 18. Positive Pay Cheque Confirmation
        "srv_positive_pay": [
            0.45, 0.65, 0.40, 0.25, 0.70, 0.35,
            0.10, 0.25, 0.05, 0.02, 0.05,
            0.70, 0.10, 0.02, 0.15, 0.05,
            0.50, 0.50, 0.15, 0.80, 0.80,
            0.70, 0.60, 0.80, 0.40, 0.05,
            0.95, 0.48, 0.20, 0.02, 0.95, 0.75
        ],
        # 19. PMJJBY / PMSBY Micro-Insurance
        "srv_pmjjby_pmsby": [
            0.45, 0.45, 0.40, 0.20, 0.35, 0.20,
            0.10, 0.60, 0.15, 0.10, 0.35,
            0.05, 0.05, 0.05, 0.20, 0.05,
            0.45, 0.50, 0.50, 0.20, 0.55,
            0.25, 0.25, 0.30, 0.15, 0.25,
            0.50, 0.35, 0.25, 0.05, 0.80, 0.60
        ]
    }

    _normalized_embeddings: Dict[str, np.ndarray] = {}

    @classmethod
    def get_embedding(cls, product_id: str) -> np.ndarray:
        """Returns unit-normalized 32D embedding vector for a product."""
        if not cls._normalized_embeddings:
            for pid, raw_vec in cls.PRODUCT_EMBEDDINGS.items():
                v = np.array(raw_vec, dtype=np.float64)
                norm = np.linalg.norm(v)
                cls._normalized_embeddings[pid] = v / max(1e-8, norm)

        if product_id in cls._normalized_embeddings:
            return cls._normalized_embeddings[product_id]

        # Neutral fallback embedding if unseen product
        neutral = np.ones(32, dtype=np.float64) / np.sqrt(32)
        return neutral

    @classmethod
    def compute_cosine_similarity(cls, customer_vector: np.ndarray, product_id: str) -> float:
        """Calculates cosine similarity in [-1.0, 1.0] mapped to [0.0, 1.0]."""
        cust_norm = np.linalg.norm(customer_vector)
        if cust_norm <= 1e-8:
            return 0.5

        u_cust = customer_vector / cust_norm
        v_prod = cls.get_embedding(product_id)

        cos_sim = float(np.dot(u_cust, v_prod))
        # Map from [-1.0, 1.0] to [0.0, 1.0]
        mapped_sim = float(np.clip((cos_sim + 1.0) / 2.0, 0.0, 1.0))
        return float(round(mapped_sim, 4))
