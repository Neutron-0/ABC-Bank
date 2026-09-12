const graphMeta = require('../apps/frontend/assets/models/minicpm5_graph_meta.json');

const INDIAN_NUMBER_WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000, lakh: 100000, crore: 10000000,
  'दस': 10, 'बीस': 20, 'तीस': 30, 'चालीस': 40, 'पचास': 50, 'सौ': 100, 'हज़ार': 1000, 'लाख': 100000, 'करोड़': 10000000,
  chaalis: 40, pachaas: 50, pachas: 50, sau: 100, hazaar: 1000, hazar: 1000, aath: 8, do: 2, teen: 3, char: 4, paanch: 5,
  'દસ': 10, 'વીસ': 20, 'ત્રીસ': 30, 'ચાલીસ': 40, 'પચાસ': 50, 'સો': 100, 'હજાર': 1000, 'લાખ': 100000
};

class OnDeviceIntentService {
  static classes = graphMeta.classes;
  static dim = graphMeta.dim;
  static centroids = graphMeta.centroids;
  static weights = graphMeta.weights;
  static w1 = graphMeta.w1;
  static b1 = graphMeta.b1;
  static w2 = graphMeta.w2;
  static b2 = graphMeta.b2;

  static detectLanguage(text) {
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
    const words = text.toLowerCase().split(/\s+/);
    if (words.some(w => ['chhe', 'kem', 'su', 'maru', 'tamaru', 'kyare', 'aapjo'].includes(w))) return 'gu';
    if (words.some(w => ['mera', 'meri', 'kya', 'hai', 'karo', 'kitna', 'batao'].includes(w))) return 'hi';
    return 'en';
  }

  static extractAmount(text) {
    const digitMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    if (digitMatch && digitMatch[1]) {
      const parsed = parseFloat(digitMatch[1].replace(/,/g, ''));
      if (!isNaN(parsed)) return parsed;
    }
    const words = text.toLowerCase().split(/\s+/);
    let multiplier = 1.0;
    let baseVal = 0.0;
    for (const w of words) {
      const cleanW = w.replace(/[^\w\u0900-\u097F\u0A80-\u0AFF]/g, '');
      if (cleanW in INDIAN_NUMBER_WORDS) {
        const num = INDIAN_NUMBER_WORDS[cleanW];
        if ([100, 1000, 100000, 10000000].includes(num)) {
          multiplier = num;
          if (baseVal === 0.0) baseVal = 1.0;
        } else {
          baseVal += num;
        }
      }
    }
    if (baseVal > 0.0) return baseVal * multiplier;
    return null;
  }

  static embedText(text) {
    const cleanT = text.toLowerCase().trim();
    const vec = new Array(this.dim).fill(0);
    let matched = false;
    for (const [kw, [clsIdx, weight]] of Object.entries(this.weights)) {
      if (cleanT.includes(kw)) {
        const centroid = this.centroids[clsIdx];
        for (let i = 0; i < this.dim; i++) {
          vec[i] += centroid[i] * weight;
        }
        matched = true;
      }
    }
    let norm = 0;
    for (let i = 0; i < this.dim; i++) norm += vec[i] * vec[i];
    norm = Math.sqrt(norm);
    if (!matched || norm < 1e-5) return [...this.centroids[8]];
    for (let i = 0; i < this.dim; i++) vec[i] /= norm;
    return vec;
  }

  static classifyIntent(query, language) {
    const t0 = performance.now();
    const cleanQ = (query || '').trim();
    const resolvedLang = language || this.detectLanguage(cleanQ);
    const embedding = this.embedText(cleanQ);

    const hidden = new Array(this.b1.length).fill(0);
    for (let j = 0; j < this.b1.length; j++) {
      let sum = this.b1[j];
      for (let i = 0; i < embedding.length; i++) {
        sum += embedding[i] * this.w1[i][j];
      }
      hidden[j] = Math.max(0, sum);
    }

    const logits = new Array(this.b2.length).fill(0);
    let maxLogit = -Infinity;
    for (let k = 0; k < this.b2.length; k++) {
      let sum = this.b2[k];
      for (let j = 0; j < hidden.length; j++) {
        sum += hidden[j] * this.w2[j][k];
      }
      logits[k] = sum;
      if (sum > maxLogit) maxLogit = sum;
    }

    let sumExp = 0;
    const expLogits = new Array(logits.length);
    for (let k = 0; k < logits.length; k++) {
      expLogits[k] = Math.exp(logits[k] - maxLogit);
      sumExp += expLogits[k];
    }

    let bestIdx = 0;
    let maxProb = -1;
    for (let k = 0; k < logits.length; k++) {
      const p = expLogits[k] / sumExp;
      if (p > maxProb) {
        maxProb = p;
        bestIdx = k;
      }
    }

    const t1 = performance.now();
    return {
      intent: this.classes[bestIdx],
      confidence: Math.round(maxProb * 1000) / 1000,
      language: resolvedLang,
      amount: this.extractAmount(cleanQ),
      latency_ms: Math.round((t1 - t0) * 100) / 100
    };
  }
}

const tests = [
  'Mera balance kitna hai?',
  'મારું બેલેન્સ બતાવો',
  'I want to see my recent transactions',
  'Pay chaalis rupaye for metro',
  'Mara EMI nu payment kyare che?',
  'Lock my card immediately',
  'Bijli ka bill bharna hai',
  'Hospital medical claim reimbursement'
];

for (const t of tests) {
  console.log(JSON.stringify({ query: t, result: OnDeviceIntentService.classifyIntent(t) }));
}
