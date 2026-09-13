"""Phonetic Speech-to-Text normalizer for Indian banking vocabulary and colloquial expressions."""

from __future__ import annotations
import re
import difflib
from typing import List, Tuple

# Multi-word phrase regex replacements (pattern, replacement)
PHRASE_PATTERNS: List[Tuple[str, str]] = [
    # Card limits & controls
    (r'\b(cart|cad|cod|kard)\s+limits?\b', 'card limit'),
    (r'\bcard\s+limts?\b', 'card limit'),
    (r'\b(cart|kard)\s+details?\b', 'card details'),
    (r'\b(creadit|credt)\s+cards?\b', 'credit card'),
    (r'\b(debit|devi|devit)\s+cards?\b', 'debit card'),
    (r'\b(green|atm)\s+pins?\b', 'green PIN'),
    (r'\b(see\s+vee\s+vee|c\s+v\s+v|cbb|cbv|c\s+b\s+v)\b', 'CVV'),
    (r'\bvirtual\s+cvv\b', 'virtual dynamic CVV'),

    # Credit Score / CIBIL
    (r'\b(civil|cibal|cibul|cebil)\s+scores?\b', 'CIBIL credit score'),
    (r'\b(civil|cibal|cibul|cebil)\s+report\b', 'CIBIL report'),
    (r'\b(creadit|credt)\s+scores?\b', 'credit score'),

    # Transactions & Statements
    (r'\b(transation|transection|transtion|transcation)s?\b', 'transactions'),
    (r'\b(stament|statment|state\s+ment|statemnt)s?\b', 'statement'),
    (r'\bbank\s+(stament|statment|state\s+ment)\b', 'bank statement'),
    (r'\bacc(ount)?\s+(stament|statment)\b', 'account statement'),
    (r'\bdownload\s+stament\b', 'download statement'),
    (r'\bpass\s+book\b', 'passbook'),
    (r'\b(pasbook|passbok)\b', 'passbook'),

    # Balance & Accounts
    (r'\b(balence|balans|balanse)\b', 'balance'),
    (r'\bacc(ount)?\s+bal(ance)?\b', 'account balance'),
    (r'\bcheque\s+bal(ance)?\b', 'check balance'),
    (r'\bcheck\s+bal(ance)?\b', 'check balance'),

    # Loans & EMI
    (r'\bhome\s+lone\b', 'home loan'),
    (r'\bhousing\s+lone\b', 'home loan'),
    (r'\bcar\s+lone\b', 'car loan'),
    (r'\bpersonal\s+lone\b', 'personal loan'),
    (r'\b(lone)\b', 'loan'),
    (r'\be\s+m\s+i\b', 'EMI'),
    (r'\bemi\s+restructur(e|ing)?\b', 'EMI restructuring'),
    (r'\brestructure\s+emi\b', 'restructure EMI'),
    (r'\bemi\s+grace\b', 'EMI grace'),
    (r'\bsplit\s+emi\b', 'split EMI'),

    # Deposits & Chequebook
    (r'\bfixed\s+deposite?\b', 'fixed deposit'),
    (r'\bterm\s+deposite?\b', 'fixed deposit'),
    (r'\b(f\s+d)\b', 'FD'),
    (r'\bcheck\s+books?\b', 'chequebook'),
    (r'\bcheckbook\b', 'chequebook'),
    (r'\bcheque\s+books?\b', 'chequebook'),
    (r'\bcheq\s+books?\b', 'chequebook'),

    # Transit, Fastag, Doorstep
    (r'\b(fast\s+tag|fastack|fas\s+tag|fastag)\b', 'FASTag'),
    (r'\brecharge\s+fastag\b', 'FASTag recharge'),
    (r'\bdoor\s+step\b', 'doorstep'),
    (r'\bdoorstep\s+banking\b', 'doorstep banking'),
    (r'\bmetro\s+recharge\b', 'metro recharge'),
    (r'\bmetro\s+smart\s+card\b', 'metro card'),

    # Payments & Transfers
    (r'\bu\s+p\s+i\b', 'UPI'),
    (r'\bi\s+f\s+s\s+c\b', 'IFSC'),
    (r'\bk\s+y\s+c\b', 'KYC'),
    (r'\bo\s+t\s+p\b', 'OTP'),
    (r'\bp\s+i\s+n\b', 'PIN'),
    (r'\bbeneficary\b|\bbenificiary\b', 'beneficiary'),
    (r'\bintrest\b', 'interest'),
    (r'\bintrest\s+rates?\b', 'interest rate'),

    # Insurance, Protection & Nominees
    (r'\b(insuranc|insurnce|inshurance)\b', 'insurance'),
    (r'\b(mediclaim|medi\s+claim)\b', 'mediclaim'),
    (r'\b(beema|beemah)\b', 'bima'),
    (r'\b(helth|helath)\s+cover\b', 'health cover'),
    (r'\b(term\s+life|term\s+insurance)\b', 'term life insurance'),
    (r'\b(nomne|nomine|nomny)\b', 'nominee'),

    # Digital Rupee (CBDC) & ASBA IPO
    (r'\b(e\s*rupee|digital\s*rupee|cbdc)\b', 'Digital Rupee e₹'),
    (r'\b(a\s+s\s+b\s+a|asba)\s+bid(ding)?\b', 'ASBA IPO bid'),
    (r'\bi\s+p\s+o\b', 'IPO'),
]

# Canonical dictionary of banking terms for single-token spelling correction
CANONICAL_BANKING_VOCAB = {
    'transation': 'transaction',
    'transations': 'transactions',
    'transection': 'transaction',
    'transections': 'transactions',
    'stament': 'statement',
    'statment': 'statement',
    'balence': 'balance',
    'balans': 'balance',
    'creadit': 'credit',
    'credt': 'credit',
    'debite': 'debit',
    'cheq': 'cheque',
    'cheque': 'cheque',
    'deposite': 'deposit',
    'deposites': 'deposits',
    'benificiary': 'beneficiary',
    'beneficary': 'beneficiary',
    'passbok': 'passbook',
    'pasbook': 'passbook',
    'intrest': 'interest',
    'kyc': 'KYC',
    'cibil': 'CIBIL',
    'ifsc': 'IFSC',
    'emi': 'EMI',
    'upi': 'UPI',
    'cvv': 'CVV',
    'otp': 'OTP',
    'pin': 'PIN',
    'rupay': 'RuPay',
    'forex': 'Forex',
    'fastag': 'FASTag',
    'chequebook': 'chequebook',
    'doorstep': 'doorstep',
    'insuranc': 'insurance',
    'insurnce': 'insurance',
    'inshurance': 'insurance',
    'mediclaim': 'mediclaim',
    'asba': 'ASBA',
    'cbdc': 'CBDC',
    'irdai': 'IRDAI',
    'sebi': 'SEBI',
    'sgb': 'SGB',
}

# Hinglish intent mapping
HINGLISH_REPLACEMENTS = [
    (r'\b(paise|paisa)\s+(bhejna|transfer\s+karna|bhejo)\b', 'transfer money'),
    (r'\b(kitna|mera)\s+balance\s+(hai|batao|check\s+karo)\b', 'check account balance'),
    (r'\bstatement\s+(chahiye|dikhao|download\s+karna)\b', 'download bank statement'),
    (r'\bcard\s+block\s+karna\s+hai\b', 'block card'),
    (r'\bloan\s+(chahiye|lena\s+hai|apply\s+karna)\b', 'apply for loan'),
    (r'\bfd\s+(kholna|karna)\s+hai\b', 'open fixed deposit'),
    (r'\b(cheque\s*books?|check\s*books?)\s+(mangwani|chahiye|order\s+karna)\b', 'order chequebook'),
]


def autocorrect_stt_text(raw_text: str) -> str:
    """
    Intelligently autocorrects speech-to-text transcriptions for banking domain accuracy.
    Fixes phonetic misrecognitions, banking acronyms, colloquial pronunciations, and spelling typos.
    """
    if not raw_text or not raw_text.strip():
        return ""

    text = raw_text.strip()

    # 1. Apply multi-word phrase regex patterns
    for pattern, replacement in PHRASE_PATTERNS:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    # 2. Apply Hinglish phrase patterns
    for pattern, replacement in HINGLISH_REPLACEMENTS:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    # 3. Token-level dictionary & fuzzy correction
    words = text.split()
    corrected_words = []

    for word in words:
        # Separate trailing punctuation
        match = re.match(r'^([^\w]*)([\w\-\'\.]+?)([^\w]*)$', word, re.UNICODE)
        if match:
            prefix, core, suffix = match.groups()
            core_lower = core.lower()

            if core_lower in CANONICAL_BANKING_VOCAB:
                corrected_core = CANONICAL_BANKING_VOCAB[core_lower]
                corrected_words.append(f"{prefix}{corrected_core}{suffix}")
            else:
                # Check close match for spelling typos
                close_matches = difflib.get_close_matches(core_lower, CANONICAL_BANKING_VOCAB.keys(), n=1, cutoff=0.82)
                if close_matches:
                    corrected_core = CANONICAL_BANKING_VOCAB[close_matches[0]]
                    corrected_words.append(f"{prefix}{corrected_core}{suffix}")
                else:
                    corrected_words.append(word)
        else:
            corrected_words.append(word)

    result = " ".join(corrected_words)

    # 4. Normalize acronyms case
    acronyms = ["CVV", "PIN", "OTP", "CIBIL", "KYC", "IFSC", "UPI", "FASTag", "EMI", "FD", "RuPay", "ASBA", "CBDC", "IRDAI", "SEBI", "SGB", "IPO"]
    for acr in acronyms:
        pattern = rf'\b{re.escape(acr)}\b'
        result = re.sub(pattern, acr, result, flags=re.IGNORECASE)

    # Clean double spaces
    result = re.sub(r'\s+', ' ', result).strip()

    # Capitalize first character if lowercase
    if result and result[0].islower():
        result = result[0].upper() + result[1:]

    return result
