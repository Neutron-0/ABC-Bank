import json
import sys
from pathlib import Path

ROOT = Path('.').resolve()
sys.path.insert(0, str(ROOT))

from ai.voice.model.neural_slm import IndicSubwordTokenizer, MiniCPM5ONNXModel

MiniCPM5ONNXModel._train_weights()
data = {
    'classes': IndicSubwordTokenizer.INTENT_CLASSES,
    'dim': IndicSubwordTokenizer.EMBEDDING_DIM,
    'centroids': IndicSubwordTokenizer.CENTROIDS.tolist(),
    'weights': IndicSubwordTokenizer.KEYWORD_WEIGHTS,
    'w1': MiniCPM5ONNXModel._w1.tolist(),
    'b1': MiniCPM5ONNXModel._b1.tolist(),
    'w2': MiniCPM5ONNXModel._w2.tolist(),
    'b2': MiniCPM5ONNXModel._b2.tolist()
}

out_path = Path('apps/frontend/assets/models/minicpm5_graph_meta.json')
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(data, indent=2), encoding='utf-8')
print('Exported', out_path, 'size:', out_path.stat().st_size)
