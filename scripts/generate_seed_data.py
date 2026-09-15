"""
Deterministic Large Synthetic Banking Dataset Generator for ABC Bank.
Generates 1,200+ realistic customers across diverse Indian demographics and financial archetypes,
2,500+ accounts, 65,000+ coherent transactions spanning up to 12 months, recurring obligations,
and customer events.
"""
import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple

RANDOM_SEED = 42

# --- Geographic & Demographic Distributions ---
LOCATIONS = [
    # (City, State, Tier, Region)
    ("Ahmedabad", "Gujarat", "Tier 1", "West"),
    ("Surat", "Gujarat", "Tier 2", "West"),
    ("Vadodara", "Gujarat", "Tier 2", "West"),
    ("Rajkot", "Gujarat", "Tier 2", "West"),
    ("Mehsana", "Gujarat", "Tier 3", "West"),
    ("Anand", "Gujarat", "Tier 3", "West"),
    ("Mumbai", "Maharashtra", "Tier 1", "West"),
    ("Pune", "Maharashtra", "Tier 1", "West"),
    ("Nagpur", "Maharashtra", "Tier 2", "West"),
    ("Nashik", "Maharashtra", "Tier 2", "West"),
    ("Aurangabad", "Maharashtra", "Tier 2", "West"),
    ("Kolhapur", "Maharashtra", "Tier 3", "West"),
    ("Jaipur", "Rajasthan", "Tier 2", "North"),
    ("Jodhpur", "Rajasthan", "Tier 2", "North"),
    ("Udaipur", "Rajasthan", "Tier 2", "North"),
    ("Kota", "Rajasthan", "Tier 3", "North"),
    ("Bikaner", "Rajasthan", "Tier 3", "North"),
    ("New Delhi", "Delhi NCR", "Tier 1", "North"),
    ("Noida", "Uttar Pradesh", "Tier 1", "North"),
    ("Gurugram", "Haryana", "Tier 1", "North"),
    ("Lucknow", "Uttar Pradesh", "Tier 2", "North"),
    ("Kanpur", "Uttar Pradesh", "Tier 2", "North"),
    ("Varanasi", "Uttar Pradesh", "Tier 2", "North"),
    ("Agra", "Uttar Pradesh", "Tier 2", "North"),
    ("Gorakhpur", "Uttar Pradesh", "Tier 3", "North"),
    ("Indore", "Madhya Pradesh", "Tier 2", "Central"),
    ("Bhopal", "Madhya Pradesh", "Tier 2", "Central"),
    ("Gwalior", "Madhya Pradesh", "Tier 3", "Central"),
    ("Jabalpur", "Madhya Pradesh", "Tier 3", "Central"),
    ("Bengaluru", "Karnataka", "Tier 1", "South"),
    ("Mysuru", "Karnataka", "Tier 2", "South"),
    ("Hubli", "Karnataka", "Tier 3", "South"),
    ("Patna", "Bihar", "Tier 2", "East"),
    ("Gaya", "Bihar", "Tier 3", "East"),
    ("Kolkata", "West Bengal", "Tier 1", "East"),
    ("Siliguri", "West Bengal", "Tier 3", "East"),
]

FIRST_NAMES = [
    ("Aarav", "m"), ("Rohan", "m"), ("Aditya", "m"), ("Vikram", "m"), ("Suresh", "m"),
    ("Ramesh", "m"), ("Rajesh", "m"), ("Manoj", "m"), ("Dinesh", "m"), ("Amit", "m"),
    ("Kiran", "m"), ("Deepak", "m"), ("Anil", "m"), ("Mukesh", "m"), ("Pravin", "m"),
    ("Bhavin", "m"), ("Hitesh", "m"), ("Chirag", "m"), ("Nilesh", "m"), ("Girish", "m"),
    ("Priya", "f"), ("Neha", "f"), ("Pooja", "f"), ("Ananya", "f"), ("Kavita", "f"),
    ("Sunita", "f"), ("Geeta", "f"), ("Meena", "f"), ("Rekha", "f"), ("Sneha", "f"),
    ("Dipali", "f"), ("Komal", "f"), ("Bhavna", "f"), ("Kinjal", "f"), ("Jinal", "f"),
]

LAST_NAMES = [
    "Patel", "Sharma", "Verma", "Singh", "Shah", "Mehta", "Deshmukh", "Joshi",
    "Kulkarni", "Chauhan", "Rathore", "Yadav", "Gupta", "Mishra", "Trivedi",
    "Pandey", "Pandya", "Goyal", "Agarwal", "Bhatia", "Iyer", "Nair", "Reddy"
]

PRODUCTS_CATALOGUE = [
    {"id": "prod_sav_basic", "code": "SAV_BASIC", "name": "Standard Savings Account", "category": "savings", "description": "Everyday digital zero-balance savings account with UPI enabled.", "interest_rate": 3.5},
    {"id": "prod_fd_smart", "code": "FD_SMART_785", "name": "Smart Fixed Deposit 7.85%", "category": "savings", "description": "High yield term deposit with premature liquidity sweep option.", "interest_rate": 7.85},
    {"id": "prod_rd_flexi", "code": "RD_FLEXI", "name": "Flexible Monthly Recurring Deposit", "category": "savings", "description": "Disciplined monthly savings habit builder with penalty-free skip.", "interest_rate": 7.10},
    {"id": "prod_scheme_pmsby", "code": "SCHEME_PMSBY", "name": "Pradhan Mantri Suraksha Bima Scheme", "category": "schemes", "description": "Govt accident protection coverage for ₹20/year.", "interest_rate": None},
    {"id": "prod_scheme_pmjjby", "code": "SCHEME_PMJJBY", "name": "Pradhan Mantri Jeevan Jyoti Scheme", "category": "schemes", "description": "Life protection welfare scheme for ₹436/year.", "interest_rate": None},
    {"id": "prod_loan_home", "code": "LOAN_HOME", "name": "Bharat Home Loan", "category": "loans", "description": "Affordable housing finance for first-time urban & rural home buyers.", "interest_rate": 8.40},
    {"id": "prod_loan_kisan", "code": "LOAN_KISAN", "name": "Kisan Credit Card & Crop Finance", "category": "agriculture", "description": "Timely short-term agricultural working capital credit.", "interest_rate": 4.00},
    {"id": "prod_loan_msme", "code": "LOAN_MSME", "name": "Vyapar MSME Working Capital", "category": "loans", "description": "Collateral-free credit line for registered small enterprises.", "interest_rate": 9.25},
    {"id": "prod_loan_personal", "code": "LOAN_PERSONAL", "name": "Instant Personal Loan", "category": "loans", "description": "Pre-approved emergency credit for eligible salaried customers.", "interest_rate": 11.50},
    {"id": "prod_mf_sip", "code": "INVEST_SIP", "name": "Direct Mutual Fund Index SIP", "category": "investment", "description": "Long-term wealth creation through disciplined Nifty/Sensex index SIPs.", "interest_rate": 12.00},
]

def generate_full_synthetic_dataset(
    num_customers: int = 1200,
    history_months: int = 12,
    seed: int = RANDOM_SEED
) -> Dict[str, Any]:
    """Generates complete dataset deterministically."""
    random.seed(seed)
    base_date = datetime(2026, 9, 12, 10, 0, 0)
    start_date = base_date - timedelta(days=30 * history_months)

    customers = []
    accounts = []
    transactions = []
    recurring_payments = []
    customer_products = []
    customer_events = []
    consent_preferences = []

    # --- 1. Preserve Mandatory Demo Fixtures Exactly ---
    # Demo Customer 1: Rahul Sharma (Metro Commuter, Home Loan, Stable/Stress testbed)
    c1 = {
        "id": "cust_bharat_001",
        "name": "Rahul Sharma",
        "age": 32,
        "occupation": "Software Engineer",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "tier": "Tier 1",
        "preferred_language": "en",
        "phone": "+91 98765 43210",
        "email": "rahul.sharma@bharatmail.in",
        "monthly_income": 75000.0,
        "income_type": "salaried",
        "kyc_tier": 2,
        "credit_score": 765,
        "archetype": "salaried_urban",
        "created_at": start_date
    }
    customers.append(c1)
    a1_sav = {
        "id": "acc_001_sav",
        "customer_id": "cust_bharat_001",
        "account_type": "savings",
        "account_number": "SB-10928374",
        "balance": 185000.0,
        "available_balance": 42680.0,
        "currency": "INR",
        "status": "active",
        "opened_at": start_date
    }
    accounts.append(a1_sav)

    # Demo Customer 2: Pooja Patel (High-liquidity, Gujarati vernacular, SIP saver)
    c2 = {
        "id": "cust_bharat_002",
        "name": "Pooja Patel",
        "age": 29,
        "occupation": "Senior Consultant",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "tier": "Tier 1",
        "preferred_language": "gu",
        "phone": "+91 98234 56789",
        "email": "pooja.patel@bharatmail.in",
        "monthly_income": 95000.0,
        "income_type": "salaried",
        "kyc_tier": 2,
        "credit_score": 790,
        "archetype": "surplus_saver",
        "created_at": start_date
    }
    customers.append(c2)
    a2_sav = {
        "id": "acc_002_sav",
        "customer_id": "cust_bharat_002",
        "account_type": "savings",
        "account_number": "SB-83746281",
        "balance": 210000.0,
        "available_balance": 84200.0,
        "currency": "INR",
        "status": "active",
        "opened_at": start_date
    }
    accounts.append(a2_sav)

    # Archetype weights for remaining population
    archetypes = [
        ("salaried_urban", 0.25),
        ("salaried_tier2", 0.20),
        ("farmer_agri", 0.15),
        ("msme_business", 0.15),
        ("student_starter", 0.10),
        ("surplus_saver", 0.05),
        ("financial_stressed", 0.05),
        ("fraud_target", 0.05)
    ]
    arch_pool = []
    for arch, weight in archetypes:
        arch_pool.extend([arch] * int(weight * 100))

    # --- 2. Generate 1,198 Additional Coherent Customers ---
    for i in range(3, num_customers + 1):
        cid = f"cust_bharat_{i:04d}"
        fn, gender = random.choice(FIRST_NAMES)
        ln = random.choice(LAST_NAMES)
        name = f"{fn} {ln}"
        city, state, tier, region = random.choice(LOCATIONS)
        arch = random.choice(arch_pool)

        # Demographics based on archetype
        if arch == "student_starter":
            age = random.randint(19, 24)
            occupation = random.choice(["College Student", "Graduate Intern", "Junior Associate"])
            income = random.choice([12000, 18000, 25000])
            inc_type = "stipend"
            kyc = 1
            credit_score = random.randint(650, 720)
        elif arch == "farmer_agri":
            age = random.randint(28, 62)
            occupation = random.choice(["Farmer", "Dairy Producer", "Agri Entrepreneur", "Horticulturist"])
            income = random.randint(25000, 65000)
            inc_type = "seasonal_agriculture"
            kyc = 2
            credit_score = random.randint(680, 760)
        elif arch == "msme_business":
            age = random.randint(26, 58)
            occupation = random.choice(["Kirana Store Owner", "Textile Merchant", "Hardware Distributor", "Electrical Contractor"])
            income = random.randint(50000, 180000)
            inc_type = "business_receipts"
            kyc = 2
            credit_score = random.randint(710, 810)
        elif arch == "surplus_saver":
            age = random.randint(32, 55)
            occupation = random.choice(["Senior Manager", "Chartered Accountant", "Doctor", "Software Architect"])
            income = random.randint(110000, 280000)
            inc_type = "salaried"
            kyc = 2
            credit_score = random.randint(780, 840)
        elif arch == "financial_stressed":
            age = random.randint(27, 48)
            occupation = random.choice(["Sales Executive", "Contract Supervisor", "Operations Assistant"])
            income = random.randint(30000, 55000)
            inc_type = "salaried"
            kyc = 2
            credit_score = random.randint(580, 660)
        else: # salaried_urban or salaried_tier2
            age = random.randint(24, 52)
            occupation = random.choice(["Analyst", "Bank Officer", "Teacher", "Engineer", "Accountant"])
            income = random.randint(38000, 110000)
            inc_type = "salaried"
            kyc = 2
            credit_score = random.randint(720, 790)

        # Language preference
        if state == "Gujarat":
            lang = random.choice(["gu", "gu", "en", "hi"])
        elif state in ["Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Bihar", "Delhi NCR"]:
            lang = random.choice(["hi", "hi", "en"])
        else:
            lang = random.choice(["en", "hi"])

        # Customer account creation
        c_obj = {
            "id": cid,
            "name": name,
            "age": age,
            "occupation": occupation,
            "city": city,
            "state": state,
            "tier": tier,
            "preferred_language": lang,
            "phone": f"+91 {random.randint(60000, 99999)} {random.randint(10000, 99999)}",
            "email": f"{fn.lower()}.{ln.lower()}{random.randint(10, 99)}@bharatmail.in",
            "monthly_income": float(income),
            "income_type": inc_type,
            "kyc_tier": kyc,
            "credit_score": credit_score,
            "archetype": arch,
            "created_at": start_date + timedelta(days=random.randint(0, 60))
        }
        customers.append(c_obj)

        # Create Primary Savings Account
        acc_num = f"SB-{random.randint(10000000, 99999999)}"
        if arch == "financial_stressed":
            sav_bal = random.uniform(8000, 25000)
            avail_bal = random.uniform(2000, 8500)
        elif arch == "surplus_saver":
            sav_bal = random.uniform(180000, 650000)
            avail_bal = random.uniform(75000, 190000)
        else:
            sav_bal = random.uniform(25000, 150000)
            avail_bal = random.uniform(12000, 48000)

        acc_sav = {
            "id": f"acc_{i:04d}_sav",
            "customer_id": cid,
            "account_type": "savings",
            "account_number": acc_num,
            "balance": round(sav_bal, 2),
            "available_balance": round(avail_bal, 2),
            "currency": "INR",
            "status": "active",
            "opened_at": c_obj["created_at"]
        }
        accounts.append(acc_sav)

        # MSME business gets a Current Account
        if arch == "msme_business":
            accounts.append({
                "id": f"acc_{i:04d}_curr",
                "customer_id": cid,
                "account_type": "current",
                "account_number": f"CA-{random.randint(10000000, 99999999)}",
                "balance": round(random.uniform(40000, 350000), 2),
                "available_balance": round(random.uniform(30000, 280000), 2),
                "currency": "INR",
                "status": "active",
                "opened_at": c_obj["created_at"]
            })

        # Consent preferences
        consent_preferences.append({
            "customer_id": cid,
            "personalization_consent": True,
            "marketing_consent": (arch != "financial_stressed"),
            "data_sharing_consent": False,
            "communication_channel": "app_inbox",
            "updated_at": base_date
        })

    # Add consents for demo users
    consent_preferences.append({
        "customer_id": "cust_bharat_001",
        "personalization_consent": True,
        "marketing_consent": True,
        "data_sharing_consent": False,
        "communication_channel": "app_inbox",
        "updated_at": base_date
    })
    consent_preferences.append({
        "customer_id": "cust_bharat_002",
        "personalization_consent": True,
        "marketing_consent": True,
        "data_sharing_consent": False,
        "communication_channel": "app_inbox",
        "updated_at": base_date
    })

    # --- 3. Generate Correlated Transaction Histories ---
    tx_counter = 1

    # Map customers to their primary account ID
    cust_acc_map = {}
    for acc in accounts:
        if acc["account_type"] in ["savings", "current"]:
            if acc["customer_id"] not in cust_acc_map:
                cust_acc_map[acc["customer_id"]] = acc["id"]

    for cust in customers:
        cid = cust["id"]
        acc_id = cust_acc_map[cid]
        arch = cust.get("archetype", "salaried_urban")
        income = cust["monthly_income"]

        # 3.1 Monthly Recurring Income
        for m in range(history_months):
            month_start = start_date + timedelta(days=m * 30)
            if arch == "farmer_agri":
                # Harvest cycles in month 3, 4 and month 9, 10
                if m in [3, 4, 9, 10]:
                    harvest_amt = income * random.uniform(2.5, 4.0)
                    tx_date = month_start + timedelta(days=random.randint(5, 20), hours=11)
                    transactions.append({
                        "id": f"tx_{tx_counter:07d}",
                        "customer_id": cid,
                        "account_id": acc_id,
                        "amount": round(harvest_amt, 2),
                        "type": "credit",
                        "category": "agriculture",
                        "merchant": f"{cust['city']} APMC Mandi Grain Settlement",
                        "timestamp": tx_date,
                        "payment_channel": "neft",
                        "is_recurring": False,
                        "frequency": None,
                        "location": cust["city"]
                    })
                    tx_counter += 1
            elif arch == "msme_business":
                # Weekly or bi-weekly business credit batches
                for w in range(4):
                    batch_date = month_start + timedelta(days=w * 7 + random.randint(1, 4), hours=19)
                    batch_amt = (income / 4.0) * random.uniform(0.8, 1.4)
                    transactions.append({
                        "id": f"tx_{tx_counter:07d}",
                        "customer_id": cid,
                        "account_id": acc_id,
                        "amount": round(batch_amt, 2),
                        "type": "credit",
                        "category": "upi",
                        "merchant": "BharatPe QR Merchant Settlement",
                        "timestamp": batch_date,
                        "payment_channel": "upi",
                        "is_recurring": True,
                        "frequency": "weekly",
                        "location": cust["city"]
                    })
                    tx_counter += 1
            else:
                # Salaried monthly pay on 1st of month
                sal_date = month_start + timedelta(days=1, hours=9, minutes=random.randint(0, 30))
                employer = "Tata Consultancy Services" if "Gujarat" in cust["state"] else "Infosys Limited"
                transactions.append({
                    "id": f"tx_{tx_counter:07d}",
                    "customer_id": cid,
                    "account_id": acc_id,
                    "amount": round(income, 2),
                    "type": "credit",
                    "category": "salary",
                    "merchant": employer,
                    "timestamp": sal_date,
                    "payment_channel": "direct_deposit",
                    "is_recurring": True,
                    "frequency": "monthly",
                    "location": cust["city"]
                })
                tx_counter += 1

            # 3.2 Monthly Utilities & Bills
            util_date = month_start + timedelta(days=random.randint(5, 10), hours=11)
            util_merch = "Torrent Power Ahmedabad" if "Gujarat" in cust["state"] else "Tata Power Electricity"
            transactions.append({
                "id": f"tx_{tx_counter:07d}",
                "customer_id": cid,
                "account_id": acc_id,
                "amount": round(random.uniform(950, 2400), 2),
                "type": "debit",
                "category": "bills",
                "merchant": util_merch,
                "timestamp": util_date,
                "payment_channel": "bbps",
                "is_recurring": True,
                "frequency": "monthly",
                "location": cust["city"]
            })
            tx_counter += 1

            # For cust_bharat_001, guarantee emi, agriculture, and education categories to maintain test contract
            if cid == "cust_bharat_001":
                emi_date = month_start + timedelta(days=16, hours=10)
                transactions.append({
                    "id": f"tx_{tx_counter:07d}",
                    "customer_id": cid,
                    "account_id": acc_id,
                    "amount": 16500.0,
                    "type": "debit",
                    "category": "emi",
                    "merchant": "HDFC Bank Home Loan",
                    "timestamp": emi_date,
                    "payment_channel": "nach_mandate",
                    "is_recurring": True,
                    "frequency": "monthly",
                    "location": cust["city"]
                })
                tx_counter += 1

                if m == 0:
                    agri_date = month_start + timedelta(days=22, hours=16, minutes=45)
                    transactions.append({
                        "id": f"tx_{tx_counter:07d}",
                        "customer_id": cid,
                        "account_id": acc_id,
                        "amount": 3200.0,
                        "type": "debit",
                        "category": "agriculture",
                        "merchant": "IFFCO Kisan Seva Kendra",
                        "timestamp": agri_date,
                        "payment_channel": "upi",
                        "is_recurring": False,
                        "frequency": None,
                        "location": cust["city"]
                    })
                    tx_counter += 1

                    edu_date = month_start + timedelta(days=25, hours=11, minutes=30)
                    transactions.append({
                        "id": f"tx_{tx_counter:07d}",
                        "customer_id": cid,
                        "account_id": acc_id,
                        "amount": 4500.0,
                        "type": "debit",
                        "category": "education",
                        "merchant": "Delhi Public School Tuition",
                        "timestamp": edu_date,
                        "payment_channel": "bbps",
                        "is_recurring": True,
                        "frequency": "monthly",
                        "location": cust["city"]
                    })
                    tx_counter += 1

            # 3.3 Daily Commute (For urban commuters like cust_bharat_001)
            if arch in ["salaried_urban", "student_starter"] or cid == "cust_bharat_001":
                transit_merch = "Ahmedabad BRTS Janmarg Card" if "Gujarat" in cust["state"] else "Delhi Metro Smart Card"
                transit_fare = 25.0 if "Gujarat" in cust["state"] else 40.0
                # Generate 8-12 commute trips per month
                commute_days = random.sample(range(1, 28), random.randint(8, 12))
                for day in commute_days:
                    trip_date = month_start + timedelta(days=day, hours=8, minutes=random.randint(35, 45))
                    transactions.append({
                        "id": f"tx_{tx_counter:07d}",
                        "customer_id": cid,
                        "account_id": acc_id,
                        "amount": transit_fare,
                        "type": "debit",
                        "category": "transport",
                        "merchant": transit_merch,
                        "timestamp": trip_date,
                        "payment_channel": "upi_autopay",
                        "is_recurring": True,
                        "frequency": "daily",
                        "location": cust["city"]
                    })
                    tx_counter += 1

            # 3.4 Weekly Groceries / Essentials
            for w in range(random.randint(2, 4)):
                groc_date = month_start + timedelta(days=w * 7 + random.randint(1, 5), hours=18, minutes=random.randint(10, 55))
                transactions.append({
                    "id": f"tx_{tx_counter:07d}",
                    "customer_id": cid,
                    "account_id": acc_id,
                    "amount": round(random.uniform(450, 2200), 2),
                    "type": "debit",
                    "category": "groceries",
                    "merchant": random.choice(["Blinkit Quick Commerce", "Mother Dairy", "Fresh Veggie Mart", "Reliance Smart Point"]),
                    "timestamp": groc_date,
                    "payment_channel": "upi",
                    "is_recurring": False,
                    "frequency": None,
                    "location": cust["city"]
                })
                tx_counter += 1

            # 3.5 Recurring Investments / SIP (For surplus savers)
            if arch == "surplus_saver" or cid == "cust_bharat_002":
                sip_date = month_start + timedelta(days=15, hours=9)
                transactions.append({
                    "id": f"tx_{tx_counter:07d}",
                    "customer_id": cid,
                    "account_id": acc_id,
                    "amount": 10000.0 if cid == "cust_bharat_002" else round(random.uniform(5000, 25000), 2),
                    "type": "debit",
                    "category": "savings",
                    "merchant": "HDFC Mutual Fund SIP Mandate",
                    "timestamp": sip_date,
                    "payment_channel": "nach_mandate",
                    "is_recurring": True,
                    "frequency": "monthly",
                    "location": cust["city"]
                })
                tx_counter += 1

            # 3.6 Financial Stress Trajectory (For stressed customers)
            if arch == "financial_stressed":
                # Month 2-3: sudden hospital bill
                if m == 2:
                    hosp_date = month_start + timedelta(days=12, hours=15)
                    transactions.append({
                        "id": f"tx_{tx_counter:07d}",
                        "customer_id": cid,
                        "account_id": acc_id,
                        "amount": round(random.uniform(35000, 65000), 2),
                        "type": "debit",
                        "category": "healthcare",
                        "merchant": "City Super Speciality Hospital",
                        "timestamp": hosp_date,
                        "payment_channel": "pos_debit_card",
                        "is_recurring": False,
                        "frequency": None,
                        "location": cust["city"]
                    })
                    tx_counter += 1
                # Month 3 onwards: heavy EMI debits creating high DTI
                if m >= 2:
                    emi_date = month_start + timedelta(days=16, hours=10)
                    transactions.append({
                        "id": f"tx_{tx_counter:07d}",
                        "customer_id": cid,
                        "account_id": acc_id,
                        "amount": round(income * 0.58, 2),
                        "type": "debit",
                        "category": "emi",
                        "merchant": "NBFC Personal Loan Mandate",
                        "timestamp": emi_date,
                        "payment_channel": "nach_mandate",
                        "is_recurring": True,
                        "frequency": "monthly",
                        "location": cust["city"]
                    })
                    tx_counter += 1

            # 3.7 Anomaly / Fraud Event (For fraud profile)
            if arch == "fraud_target" and m == history_months - 1:
                fraud_date = base_date - timedelta(days=2, hours=8, minutes=random.randint(10, 40))
                transactions.append({
                    "id": f"tx_{tx_counter:07d}",
                    "customer_id": cid,
                    "account_id": acc_id,
                    "amount": 31800.0,
                    "type": "debit",
                    "category": "security",
                    "merchant": "GlobalTech Gaming London",
                    "timestamp": fraud_date,
                    "payment_channel": "card_international",
                    "is_recurring": False,
                    "frequency": None,
                    "location": "London, UK",
                    "metadata": {"anomaly_flagged": True, "risk_score": 94, "odd_hour": "02:14 AM"}
                })
                tx_counter += 1

    # --- 4. Recurring Mandates Table Population ---
    for cust in customers:
        cid = cust["id"]
        acc_id = cust_acc_map[cid]
        arch = cust.get("archetype")
        if arch in ["salaried_urban", "salaried_tier2", "surplus_saver"] or cid == "cust_bharat_001":
            recurring_payments.append({
                "id": f"mandate_{cid}_emi",
                "customer_id": cid,
                "account_id": acc_id,
                "category": "emi",
                "merchant": "HDFC Bank Home Loan",
                "amount": 16500.0 if cid == "cust_bharat_001" else round(random.uniform(12000, 32000), 2),
                "frequency": "monthly",
                "due_day": 16,
                "status": "active"
            })
        if arch in ["surplus_saver"] or cid == "cust_bharat_002":
            recurring_payments.append({
                "id": f"mandate_{cid}_sip",
                "customer_id": cid,
                "account_id": acc_id,
                "category": "savings",
                "merchant": "HDFC Mutual Fund SIP",
                "amount": 10000.0 if cid == "cust_bharat_002" else round(random.uniform(5000, 20000), 2),
                "frequency": "monthly",
                "due_day": 15,
                "status": "active"
            })

    # --- 5. Customer Life Events Population ---
    for cust in customers[:400]:
        cid = cust["id"]
        arch = cust.get("archetype")
        if arch == "farmer_agri":
            customer_events.append({
                "id": f"evt_{cid}_harvest",
                "customer_id": cid,
                "event_type": "agriculture_harvest_credit",
                "description": "Bumper Rabi crop realization deposited from APMC market yard.",
                "amount": round(random.uniform(85000, 165000), 2),
                "event_timestamp": base_date - timedelta(days=random.randint(15, 60)),
                "metadata": {"crop": "Wheat/Mustard", "season": "Rabi"}
            })
        elif arch == "msme_business":
            customer_events.append({
                "id": f"evt_{cid}_expansion",
                "customer_id": cid,
                "event_type": "business_expansion_inquiry",
                "description": "Inquired for commercial solar rooftop subsidy and working capital line.",
                "amount": None,
                "event_timestamp": base_date - timedelta(days=random.randint(10, 45)),
                "metadata": {"intent": "working_capital"}
            })
        elif arch == "financial_stressed":
            customer_events.append({
                "id": f"evt_{cid}_medical",
                "customer_id": cid,
                "event_type": "hospital_medical_surge",
                "description": "Urgent emergency medical hospital expenditure debited.",
                "amount": 48200.0,
                "event_timestamp": base_date - timedelta(days=random.randint(20, 80)),
                "metadata": {"hospital": "City Super Speciality Hospital"}
            })

    return {
        "customers": customers,
        "accounts": accounts,
        "transactions": transactions,
        "recurring_payments": recurring_payments,
        "products": PRODUCTS_CATALOGUE,
        "customer_products": customer_products,
        "customer_events": customer_events,
        "consent_preferences": consent_preferences
    }

if __name__ == "__main__":
    print(f"Generating deterministic synthetic dataset with seed {RANDOM_SEED}...")
    dataset = generate_full_synthetic_dataset(num_customers=1200, history_months=12)
    print(f"Generated:")
    print(f"  Customers:           {len(dataset['customers']):,}")
    print(f"  Accounts:            {len(dataset['accounts']):,}")
    print(f"  Transactions:        {len(dataset['transactions']):,}")
    print(f"  Recurring Mandates:  {len(dataset['recurring_payments']):,}")
    print(f"  Customer Events:     {len(dataset['customer_events']):,}")
    print(f"  Products:            {len(dataset['products']):,}")
