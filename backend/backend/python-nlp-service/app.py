from flask import Flask, request, jsonify
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import spacy
import re
import os
import json
import logging
from logging.handlers import RotatingFileHandler
import time
from functools import wraps

# Initialize Flask app
app = Flask(__name__)

# Configure logging
if not os.path.exists('logs'):
    os.makedirs('logs')

file_handler = RotatingFileHandler('logs/nlp_service.log', maxBytes=10485760, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('NLP Service startup')

# Download NLTK data if not already downloaded
try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

try:
    nltk.data.find('punkt')
except LookupError:
    nltk.download('punkt')

# Initialize sentiment analyzer
sia = SentimentIntensityAnalyzer()

# Load spaCy model for entity recognition
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If model not found, download it
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# Custom product-related entities
PRODUCT_ENTITIES = [
    "product", "device", "gadget", "item", "model", "version", "edition",
    "smartphone", "phone", "laptop", "computer", "tablet", "watch", "headphones",
    "earbuds", "camera", "tv", "television", "monitor", "speaker", "console"
]

# Product features and aspects
PRODUCT_FEATURES = [
    "battery", "screen", "display", "camera", "processor", "performance", "speed",
    "memory", "storage", "design", "build", "quality", "durability", "price",
    "value", "software", "interface", "connectivity", "sound", "audio", "video",
    "weight", "size", "resolution", "color", "button", "port", "charging"
]

# Performance metrics decorator
def timing_decorator(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = f(*args, **kwargs)
        end_time = time.time()
        app.logger.info(f"Function {f.__name__} took {end_time - start_time:.2f} seconds to execute")
        return result
    return wrapper

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/analyze', methods=['POST'])
@timing_decorator
def analyze_text():
    """
    Analyze a single text for sentiment and entities
    """
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    
    text = data['text']
    product_name = data.get('product_name', None)
    
    try:
        # Analyze sentiment
        sentiment_scores = sia.polarity_scores(text)
        
        # Extract entities
        entities = extract_entities(text, product_name)
        
        # Extract aspects and their sentiments
        aspects = extract_aspect_sentiments(text, product_name)
        
        return jsonify({
            "sentiment": {
                "compound": sentiment_scores['compound'],
                "positive": sentiment_scores['pos'],
                "negative": sentiment_scores['neg'],
                "neutral": sentiment_scores['neu']
            },
            "entities": entities,
            "aspects": aspects
        })
    except Exception as e:
        app.logger.error(f"Error analyzing text: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/batch-analyze', methods=['POST'])
@timing_decorator
def batch_analyze():
    """
    Analyze multiple texts for sentiment and entities
    """
    data = request.json
    
    if not data or 'texts' not in data:
        return jsonify({"error": "No texts provided"}), 400
    
    texts = data['texts']
    product_names = data.get('product_names', [None] * len(texts))
    
    if len(product_names) != len(texts):
        product_names = [None] * len(texts)
    
    try:
        results = []
        
        for i, text in enumerate(texts):
            # Analyze sentiment
            sentiment_scores = sia.polarity_scores(text)
            
            # Extract entities
            entities = extract_entities(text, product_names[i])
            
            # Extract aspects and their sentiments
            aspects = extract_aspect_sentiments(text, product_names[i])
            
            results.append({
                "sentiment": {
                    "compound": sentiment_scores['compound'],
                    "positive": sentiment_scores['pos'],
                    "negative": sentiment_scores['neg'],
                    "neutral": sentiment_scores['neu']
                },
                "entities": entities,
                "aspects": aspects
            })
        
        return jsonify({"results": results})
    except Exception as e:
        app.logger.error(f"Error batch analyzing texts: {str(e)}")
        return jsonify({"error": str(e)}), 500

@timing_decorator
def extract_entities(text, product_name=None):
    """
    Extract entities from text using spaCy
    """
    doc = nlp(text)
    
    entities = []
    
    # Extract named entities from spaCy
    for ent in doc.ents:
        entities.append({
            "text": ent.text,
            "label": ent.label_,
            "start": ent.start_char,
            "end": ent.end_char
        })
    
    # Extract product-related entities
    for token in doc:
        if token.text.lower() in PRODUCT_ENTITIES and not any(e["text"] == token.text for e in entities):
            entities.append({
                "text": token.text,
                "label": "PRODUCT",
                "start": token.idx,
                "end": token.idx + len(token.text)
            })
    
    # Add product name as entity if provided and found in text
    if product_name:
        product_pattern = re.compile(re.escape(product_name), re.IGNORECASE)
        for match in product_pattern.finditer(text):
            entities.append({
                "text": match.group(),
                "label": "PRODUCT_NAME",
                "start": match.start(),
                "end": match.end()
            })
    
    return entities

@timing_decorator
def extract_aspect_sentiments(text, product_name=None):
    """
    Extract product aspects and their sentiments
    """
    doc = nlp(text)
    aspects = []
    
    # Find sentences
    sentences = list(doc.sents)
    
    for sentence in sentences:
        sentence_text = sentence.text
        
        # Check for product features in the sentence
        for feature in PRODUCT_FEATURES:
            feature_pattern = re.compile(r'\b' + re.escape(feature) + r'\b', re.IGNORECASE)
            
            for match in feature_pattern.finditer(sentence_text):
                # Get sentiment for this sentence
                sentiment_scores = sia.polarity_scores(sentence_text)
                
                # Find adjectives near the feature
                feature_doc = nlp(sentence_text)
                adjectives = []
                
                for token in feature_doc:
                    if token.pos_ == "ADJ":
                        # Check if adjective is close to the feature
                        feature_token = None
                        for t in feature_doc:
                            if t.idx <= match.start() < t.idx + len(t.text):
                                feature_token = t
                                break
                        
                        if feature_token and abs(token.i - feature_token.i) <= 3:
                            adjectives.append(token.text)
                
                aspects.append({
                    "aspect": feature,
                    "sentiment": sentiment_scores['compound'],
                    "sentence": sentence_text,
                    "adjectives": adjectives,
                    "start": match.start() + sentence.start_char,
                    "end": match.end() + sentence.start_char
                })
    
    return aspects

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
