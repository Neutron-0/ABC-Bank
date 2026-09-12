"""Recommendation ranker with strict ethical constraints and anti-predatory loan suppression."""

from __future__ import annotations
from typing import List, Dict, Any
from ai.intelligence.recommendations.rules import RecommendationRules
from ai.intelligence.recommendations.scorer import RecommendationScorer


class RecommendationRanker:
    """Evaluates catalog against customer signals, enforces ethical guardrails, and ranks actions."""

    @classmethod
    def rank(cls, signals: Dict[str, Any], health: str, include_suppressed: bool = False) -> List[Dict[str, Any]]:
        candidates: List[Dict[str, Any]] = []

        for action_id, action_def in RecommendationRules.CATALOG.items():
            scored = RecommendationScorer.score(action_def, signals, health)
            if scored is not None:
                candidates.append(scored)

        if include_suppressed:
            # Return all items sorted with active items first
            candidates.sort(key=lambda x: (not x.get("suppressed", False), x.get("priority", 0)), reverse=True)
            return candidates

        # Default: Filter out suppressed items and sort by priority descending
        active = [r for r in candidates if not r.get("suppressed")]
        active.sort(key=lambda x: x["priority"], reverse=True)
        return active
