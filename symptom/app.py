from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from googletrans import Translator
import logging
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
CORS(app, origins=cors_origins)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Configure Gemini API
try:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    app.logger.info("Gemini API configured successfully")
except Exception as e:
    app.logger.error("Failed to configure Gemini API: %s", str(e))
    model = None

# Initialize translator
translator = Translator()

def clean_response(text):
    """Remove ** and format the response"""
    return text.replace('**', '').strip()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'model_status': 'available' if model else 'unavailable'
    })

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    """Main diagnosis endpoint"""
    try:
        if model is None:
            return jsonify({
                'error': 'AI model not available',
                'message': 'The Gemini AI model could not be loaded. Please check your API key.',
                'success': False
            }), 500

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided', 'success': False}), 400

        symptoms = data.get('symptoms', '').strip()
        language = data.get('language', 'en')
        force_english = data.get('force_english', False)
        
        if not symptoms:
            return jsonify({'error': 'Please enter symptoms', 'success': False}), 400

        # Create the prompt for medical analysis
        prompt = f"""Act as a medical expert analyzing these symptoms: {symptoms}
        
        Provide response in EXACTLY this format:
        
        [POSSIBLE CONDITIONS]
        1. Condition 1
        2. Condition 2
        
        [EXPLANATION]
        Brief explanation of the possible conditions
        
        [RISK LEVEL]
        Low/Medium/High
        
        [SELF-CARE ADVICE]
        - Advice 1
        - Advice 2
        - Advice 3
        
        [OTC MEDICINES]
        - Medicine 1 (with precautions)
        - Medicine 2 (with precautions)
        
        If life-threatening, add:
        [WARNING] This appears critical. Consult a doctor immediately.
        
        Keep the response concise and professional."""

        # Get initial response in English
        response = model.generate_content(prompt)
        english_response = clean_response(response.text)
        is_critical = "[WARNING]" in english_response

        # Handle translation if needed
        final_response = english_response
        if language in ['bn', 'hi'] and not force_english:
            try:
                # Translate to selected language
                translated = translator.translate(english_response, src='en', dest=language)
                final_response = clean_response(translated.text)
            except Exception as e:
                app.logger.error("Translation error: %s", str(e))
                # Fallback to English if translation fails
                language = 'en'

        return jsonify({
            'success': True,
            'diagnosis': final_response,
            'english_version': english_response if language != 'en' else None,
            'is_critical': is_critical,
            'language': language,
            'timestamp': datetime.utcnow().isoformat(),
            'disclaimer': "This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare professional for proper diagnosis and treatment."
        })
        
    except Exception as e:
        app.logger.error("Diagnosis error: %s", str(e))
        return jsonify({
            'error': str(e),
            'success': False,
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    """Text to speech endpoint"""
    try:
        from gtts import gTTS
        import base64
        from io import BytesIO
        
        data = request.get_json()
        text = data.get('text', '')
        lang = data.get('lang', 'en')
        
        if not text:
            return jsonify({'error': 'No text provided', 'success': False}), 400
        
        # Map language codes to gTTS codes
        lang_map = {
            'en': 'en',
            'hi': 'hi',
            'bn': 'bn'
        }
        
        tts = gTTS(
            text=text,
            lang=lang_map.get(lang, 'en'),
            slow=False
        )
        
        mp3_fp = BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        return jsonify({
            'success': True,
            'audio': base64.b64encode(mp3_fp.read()).decode('utf-8'),
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except ImportError:
        return jsonify({
            'error': 'Text-to-speech functionality not available. Please install gTTS.',
            'success': False
        }), 500
    except Exception as e:
        app.logger.error("Text-to-speech error: %s", str(e))
        return jsonify({
            'error': f'Could not generate audio: {str(e)}',
            'success': False
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    
    app.logger.info(f"Starting Symptom Prediction API on port {port}")
    app.logger.info(f"Model status: {'Available' if model else 'Unavailable'}")
    app.logger.info(f"CORS origins: {cors_origins}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
