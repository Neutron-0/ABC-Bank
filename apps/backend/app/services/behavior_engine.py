from datetime import datetime, time
from typing import List, Dict, Any, Optional
from collections import defaultdict

class BehavioralEngine:
    """
    Engine for recognizing longitudinal habits and evaluating real-time contextual relevance.
    Evaluates:
    - Daily habits (morning breakfast, transit, tea/snack, evening routine)
    - Weekly habits (Sunday dinner, weekend grocery run, Saturday shopping)
    - Periodic patterns (cinema every 8-12 days)
    - Time-window alignment with current context
    """

    @staticmethod
    def analyze_habits(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes historical transactions and extracts behavioral clusters with confidence scores.
        """
        if not transactions:
            return {}

        merchant_counts = defaultdict(int)
        category_counts = defaultdict(int)
        day_category_counts = defaultdict(lambda: defaultdict(int)) # day -> category -> count
        time_category_counts = defaultdict(lambda: defaultdict(int)) # hour_window -> category -> count
        cinema_dates = []

        for tx in transactions:
            merchant = str(tx.get("merchant", "")).strip()
            category = str(tx.get("category", "")).strip().lower()
            ts_str = tx.get("timestamp")
            if not ts_str:
                continue

            try:
                if isinstance(ts_str, datetime):
                    dt = ts_str
                else:
                    dt = datetime.fromisoformat(str(ts_str).replace("Z", "+00:00"))
            except Exception:
                continue

            merchant_counts[merchant] += 1
            category_counts[category] += 1
            day_name = dt.strftime("%A")
            day_category_counts[day_name][category] += 1

            # Time windows: morning (07-11), lunch (12-15), evening (17-22), late_night (23-05)
            hour = dt.hour
            if 7 <= hour < 11:
                tw = "morning"
            elif 12 <= hour < 15:
                tw = "lunch"
            elif 17 <= hour < 22:
                tw = "evening"
            else:
                tw = "other"
            time_category_counts[tw][category] += 1

            # Check cinema/entertainment recurrence
            if category in ["entertainment", "leisure"] or any(k in merchant.lower() for k in ["pvr", "inox", "cinema", "movies"]):
                cinema_dates.append(dt)

        # 1. Detect Sunday Dining Habit
        sunday_dining_count = day_category_counts["Sunday"].get("dining", 0) + day_category_counts["Sunday"].get("food", 0)
        has_sunday_dining = sunday_dining_count >= 3

        # 2. Detect Morning Commute Habit
        morning_transport = time_category_counts["morning"].get("transport", 0)
        has_morning_commute = morning_transport >= 4

        # 3. Detect Periodic Cinema Habit (~8-12 days)
        has_periodic_cinema = False
        avg_cinema_interval = None
        last_cinema_date = None
        if len(cinema_dates) >= 3:
            cinema_dates.sort()
            last_cinema_date = cinema_dates[-1]
            diffs = [(cinema_dates[i] - cinema_dates[i-1]).days for i in range(1, len(cinema_dates))]
            if diffs:
                avg_diff = sum(diffs) / len(diffs)
                if 5 <= avg_diff <= 20:
                    has_periodic_cinema = True
                    avg_cinema_interval = round(avg_diff, 1)

        # 4. Top preferred merchants
        top_merchants = sorted(merchant_counts.items(), key=lambda x: x[1], reverse=True)[:5]

        return {
            "has_sunday_dining": has_sunday_dining,
            "sunday_dining_count": sunday_dining_count,
            "has_morning_commute": has_morning_commute,
            "morning_transport_count": morning_transport,
            "has_periodic_cinema": has_periodic_cinema,
            "avg_cinema_interval_days": avg_cinema_interval,
            "last_cinema_date": last_cinema_date.isoformat() if last_cinema_date else None,
            "top_merchants": [m[0] for m in top_merchants if m[1] >= 2],
        }

    @classmethod
    def extract_habits(cls, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Returns structured list of recognized habit objects with confidence scores."""
        summary = cls.analyze_habits(transactions)
        habits = []
        if summary.get("has_sunday_dining"):
            habits.append({
                "habit": "weekly_sunday_dining",
                "category": "dining",
                "confidence": min(1.0, 0.6 + (summary.get("sunday_dining_count", 0) * 0.08)),
                "typical_spend": 1250.0
            })
        if summary.get("has_morning_commute"):
            habits.append({
                "habit": "morning_commute",
                "category": "transport",
                "confidence": min(1.0, 0.7 + (summary.get("morning_transport_count", 0) * 0.05)),
                "typical_spend": 40.0
            })
        if summary.get("has_periodic_cinema"):
            habits.append({
                "habit": "periodic_cinema",
                "category": "entertainment",
                "confidence": 0.82,
                "interval_days": summary.get("avg_cinema_interval_days")
            })
        return habits

    @classmethod
    def get_context_relevance(
        cls,
        habits: Any,
        current_time: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Calculates real-time contextual relevance score for detected habits.
        Returns ranked habits with relevance_score.
        """
        now = current_time or datetime.now()
        day_name = now.strftime("%A")
        hour = now.hour

        habit_list = habits if isinstance(habits, list) else cls.extract_habits(habits) if isinstance(habits, list) else []
        if isinstance(habits, dict):
            habit_list = []
            if habits.get("has_sunday_dining"):
                habit_list.append({"habit": "weekly_sunday_dining", "category": "dining", "confidence": 0.9})
            if habits.get("has_morning_commute"):
                habit_list.append({"habit": "morning_commute", "category": "transport", "confidence": 0.9})
            if habits.get("has_periodic_cinema"):
                habit_list.append({"habit": "periodic_cinema", "category": "entertainment", "confidence": 0.8})

        scored = []
        for h in habit_list:
            h_name = h.get("habit")
            score = 1.0
            if h_name == "weekly_sunday_dining":
                if day_name == "Sunday" and 17 <= hour <= 23:
                    score = 2.5
                elif day_name == "Sunday":
                    score = 1.5
                else:
                    score = 0.3
            elif h_name == "morning_commute":
                if day_name in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] and 7 <= hour <= 10:
                    score = 2.8
                elif day_name in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
                    score = 1.2
                else:
                    score = 0.2
            elif h_name == "periodic_cinema":
                if day_name in ["Friday", "Saturday", "Sunday"] and 15 <= hour <= 22:
                    score = 1.8
                else:
                    score = 0.6

            item = dict(h)
            item["relevance_score"] = round(score * h.get("confidence", 1.0), 2)
            scored.append(item)

        scored.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
        return scored

    @staticmethod
    def evaluate_current_relevance(
        habits: Any,
        current_time: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Determines what is relevant *right now* based on current day and time.
        Produces contextual recommendation hints for the ExperienceComposer.
        Accepts either a summary dict or a list of habit objects.
        """
        now = current_time or datetime.now()
        day_name = now.strftime("%A")
        hour = now.hour
        minute = now.minute

        # Normalize habits input
        has_sunday_dining = False
        has_morning_commute = False
        has_periodic_cinema = False
        last_cinema_date = None
        avg_cinema_interval = 10

        if isinstance(habits, dict):
            has_sunday_dining = bool(habits.get("has_sunday_dining"))
            has_morning_commute = bool(habits.get("has_morning_commute"))
            has_periodic_cinema = bool(habits.get("has_periodic_cinema"))
            last_cinema_date = habits.get("last_cinema_date")
            avg_cinema_interval = habits.get("avg_cinema_interval_days", 10)
        elif isinstance(habits, list):
            for h in habits:
                if isinstance(h, dict):
                    h_type = h.get("habit") or h.get("category")
                    if h_type in ["weekly_sunday_dining", "dining"]:
                        has_sunday_dining = True
                    elif h_type in ["morning_commute", "transport"]:
                        has_morning_commute = True
                    elif h_type in ["periodic_cinema", "entertainment"]:
                        has_periodic_cinema = True

        contextual_signals = []

        # Context A: Sunday Dinner Window (Sunday 18:30 - 22:30)
        if has_sunday_dining and day_name == "Sunday" and 18 <= hour <= 22:
            contextual_signals.append({
                "id": "rec_context_sunday_dinner",
                "category": "dining",
                "title": "Sunday Dinner Expense & Budget",
                "reason": "You frequently visit your favorite restaurant around this time on Sundays.",
                "priority": 88,
                "action_type": "INSTANT_PAY",
                "action_label": "Scan & Pay",
                "suppressed": False
            })

        # Context B: Weekday Morning Commute Window (Mon-Fri 07:45 - 09:30)
        is_weekday = day_name in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        if has_morning_commute and is_weekday and (hour == 8 or (hour == 7 and minute >= 45) or (hour == 9 and minute <= 30)):
            contextual_signals.append({
                "id": "rec_context_morning_commute",
                "category": "transport",
                "title": "🚇 Morning Commute Quick Top-up",
                "reason": "Regular weekday transit window detected. 1-tap recharge ready.",
                "priority": 91,
                "action_type": "INSTANT_PAY",
                "action_label": "1-Tap Tap & Go",
                "suppressed": False
            })

        # Context C: Upcoming Cinema Window
        if has_periodic_cinema and last_cinema_date:
            try:
                last_dt = datetime.fromisoformat(last_cinema_date)
                days_since = (now.date() - last_dt.date()).days
                if abs(days_since - avg_cinema_interval) <= 2:
                    contextual_signals.append({
                        "id": "rec_context_cinema_habit",
                        "category": "entertainment",
                        "title": "Weekend Movie Routine Approaching",
                        "reason": f"You usually visit the cinema every ~{int(avg_cinema_interval)} days. Upcoming weekend tickets are open.",
                        "priority": 75,
                        "action_type": "OPEN_SCREEN",
                        "action_label": "Check Entertainment Offers",
                        "suppressed": False
                    })
            except Exception:
                pass

        return contextual_signals
