from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services.face_service import FaceRecognitionService

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize face recognition service
face_service = FaceRecognitionService()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'OK',
        'message': 'Antigravity Face Recognition Service is running'
    }), 200

@app.route('/encode', methods=['POST'])
def encode_face():
    """Generate face encoding from image"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'message': 'Image data is required'
            }), 400
        
        image_data = data['image']
        
        # Generate encoding
        result = face_service.encode_face(image_data)
        
        if not result['success']:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error encoding face: {str(e)}'
        }), 500

@app.route('/match', methods=['POST'])
def match_face():
    """Match face against stored encodings"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data or 'encodings' not in data:
            return jsonify({
                'success': False,
                'message': 'Image data and encodings are required'
            }), 400
        
        image_data = data['image']
        known_encodings = data['encodings']
        
        # Match face
        result = face_service.match_face(image_data, known_encodings)
        
        if not result['success']:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error matching face: {str(e)}'
        }), 500

@app.route('/detect', methods=['POST'])
def detect_faces():
    """Detect faces in image"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'message': 'Image data is required'
            }), 400
        
        image_data = data['image']
        
        # Detect faces
        result = face_service.detect_faces(image_data)
        
        if not result['success']:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error detecting faces: {str(e)}'
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
