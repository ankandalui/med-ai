from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from googletrans import Translator
import logging
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Configure Gemini AI
try:
    # You should replace this with your actual API key or use environment variable
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyDNIFMMf99ovvEH65RnIQZf67rkZVm2VYk')
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    app.logger.info("Gemini AI configured successfully")
except Exception as e:
    app.logger.error("Failed to configure Gemini AI: %s", str(e))
    model = None

translator = Translator()

def clean_response(text):
    """Remove ** and format the response"""
    return text.replace('**', '').strip()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'symptom-prediction-api',
        'timestamp': datetime.now().isoformat(),
        'gemini_configured': model is not None
    })

@app.route('/diagnose', methods=['POST'])
def diagnose():
    """Main symptom diagnosis endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        symptoms = data.get('symptoms', '').strip()
        language = data.get('language', 'en')
        force_english = data.get('force_english', False)
        
        if not symptoms:
            return jsonify({'error': 'Please enter symptoms'}), 400

        if not model:
            return jsonify({'error': 'AI model not available'}), 503

        # Create structured prompt for medical analysis
        prompt = f"""Act as a medical expert analyzing these symptoms: {symptoms}
        
        Provide response in EXACTLY this format:
        
        [POSSIBLE CONDITIONS]
        1. Most likely condition with brief explanation
        2. Alternative condition with brief explanation
        3. Other possible condition with brief explanation
        
        [RISK LEVEL]
        Low/Medium/High - with brief justification
        
        [IMMEDIATE RECOMMENDATIONS]
        - Immediate action recommendation 1
        - Immediate action recommendation 2
        - When to seek medical care
        
        [SELF-CARE ADVICE]
        - Self-care tip 1
        - Self-care tip 2
        - Self-care tip 3
        
        [OTC MEDICINES]
        - Over-the-counter medicine 1 (with dosage and precautions)
        - Over-the-counter medicine 2 (with dosage and precautions)
        
        [RED FLAGS]
        - Warning sign 1 that requires immediate medical attention
        - Warning sign 2 that requires immediate medical attention
        
        If symptoms suggest a life-threatening condition, start with:
        [WARNING] This appears critical. Seek immediate medical attention.
        
        Keep explanations concise and medically accurate."""

        # Get response from Gemini AI
        response = model.generate_content(prompt)
        english_response = clean_response(response.text)
        is_critical = "[WARNING]" in english_response.upper() or any(word in english_response.upper() for word in ['EMERGENCY', 'CRITICAL', 'IMMEDIATELY', 'URGENT'])

        # Handle translation for non-English languages
        if language in ['bn', 'hi'] and not force_english:
            try:
                translated = translator.translate(english_response, src='en', dest=language)
                translated_response = clean_response(translated.text)
                
                return jsonify({
                    'diagnosis': translated_response,
                    'english_version': english_response,
                    'is_critical': is_critical,
                    'status': 'success',
                    'language': language,
                    'timestamp': datetime.now().isoformat()
                })
            except Exception as e:
                app.logger.error("Translation error: %s", str(e))
                # Fallback to English if translation fails
                return jsonify({
                    'diagnosis': english_response,
                    'is_critical': is_critical,
                    'status': 'success',
                    'language': 'en',
                    'timestamp': datetime.now().isoformat(),
                    'translation_error': 'Translation failed, showing English version'
                })
        
        # Return English response
        return jsonify({
            'diagnosis': english_response,
            'is_critical': is_critical,
            'status': 'success',
            'language': 'en',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error("Diagnosis error: %s", str(e))
        return jsonify({
            'error': f'Analysis failed: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Alias for diagnose endpoint for compatibility"""
    return diagnose()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))  # Use different port to avoid conflicts
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"Starting Symptom Prediction API on port {port}")
    print(f"Health check: http://localhost:{port}/health")
    print(f"Main endpoint: http://localhost:{port}/diagnose")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
