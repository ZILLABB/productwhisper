from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import os

app = Flask(__name__)
CORS(app)

# Download VADER lexicon if not already downloaded
try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

# Initialize VADER sentiment analyzer
sid = SentimentIntensityAnalyzer()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'ProductWhisper Sentiment Analysis Service',
        'endpoints': {
            '/analyze': 'POST - Analyze sentiment of text',
            '/batch': 'POST - Analyze sentiment of multiple texts'
        }
    })

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text']
    
    if not text:
        return jsonify({'error': 'Empty text provided'}), 400
    
    # Get sentiment scores
    scores = sid.polarity_scores(text)
    
    # Convert to a -1 to 1 scale for consistency
    normalized_score = scores['compound']
    
    return jsonify({
        'score': normalized_score,
        'details': scores,
        'text_sample': text[:100] + '...' if len(text) > 100 else text
    })

@app.route('/batch', methods=['POST'])
def batch_analyze():
    data = request.json
    
    if not data or 'texts' not in data:
        return jsonify({'error': 'No texts provided'}), 400
    
    texts = data['texts']
    
    if not texts or not isinstance(texts, list):
        return jsonify({'error': 'Invalid texts format. Expected a list of strings'}), 400
    
    results = []
    
    for text in texts:
        if not text:
            results.append({
                'score': 0,
                'details': {'compound': 0, 'neg': 0, 'neu': 1, 'pos': 0},
                'text_sample': ''
            })
            continue
        
        scores = sid.polarity_scores(text)
        results.append({
            'score': scores['compound'],
            'details': scores,
            'text_sample': text[:100] + '...' if len(text) > 100 else text
        })
    
    return jsonify({
        'results': results,
        'count': len(results)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') == 'development')
