import cv2
import numpy as np
import base64
from PIL import Image
import io
import os

class FaceRecognitionService:
    def __init__(self):
        self.confidence_threshold = float(os.getenv('CONFIDENCE_THRESHOLD', 0.45))

        # Load OpenCV's pre-trained face detector
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        # Initialize ORB feature detector for face matching
        self.orb = cv2.ORB_create(nfeatures=500)
        self.bf_matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    
    def _decode_image(self, image_data):
        """Decode base64 image to numpy array"""
        try:
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            
            # Convert to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            image_array = np.array(image)
            
            return image_array
        except Exception as e:
            raise Exception(f"Error decoding image: {str(e)}")
    
    def encode_face(self, image_data):
        """Generate face encoding from image using OpenCV"""
        try:
            # Decode image
            image = self._decode_image(image_data)
            
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            if len(faces) == 0:
                return {
                    'success': False,
                    'message': 'No face detected in the image. Please ensure your face is clearly visible.'
                }
            
            if len(faces) > 1:
                return {
                    'success': False,
                    'message': 'Multiple faces detected. Please ensure only one face is visible.'
                }
            
            # Get the face region
            (x, y, w, h) = faces[0]
            face_roi = gray[y:y+h, x:x+w]
            
            # Resize face to standard size for consistent feature extraction
            face_roi = cv2.resize(face_roi, (128, 128))
            
            # Extract ORB features from the face
            keypoints, descriptors = self.orb.detectAndCompute(face_roi, None)
            
            if descriptors is None or len(descriptors) == 0:
                return {
                    'success': False,
                    'message': 'Could not generate face encoding. Please try again with better lighting.'
                }
            
            # Convert descriptors to list for JSON serialization
            encoding = descriptors.flatten().tolist()
            
            return {
                'success': True,
                'message': 'Face encoding generated successfully',
                'encoding': encoding,
                'face_location': (int(x), int(y), int(w), int(h))
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error encoding face: {str(e)}'
            }
    
    def match_face(self, image_data, known_encodings):
        """Match face against known encodings using feature matching"""
        try:
            # Decode image
            image = self._decode_image(image_data)
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            if len(faces) == 0:
                return {
                    'success': False,
                    'message': 'No face detected in the image'
                }
            
            # Get the first detected face
            (x, y, w, h) = faces[0]
            face_roi = gray[y:y+h, x:x+w]
            face_roi = cv2.resize(face_roi, (128, 128))
            
            # Extract features from detected face
            keypoints, descriptors = self.orb.detectAndCompute(face_roi, None)
            
            if descriptors is None or len(descriptors) == 0:
                return {
                    'success': False,
                    'message': 'Could not generate face encoding'
                }
            
            if len(known_encodings) == 0:
                return {
                    'success': False,
                    'message': 'No registered faces to match against'
                }
            
            # Match against all known faces
            best_match = None
            best_confidence = 0
            
            for item in known_encodings:
                if 'encoding' not in item or not item['encoding']:
                    continue
                
                try:
                    # Reconstruct the stored encoding
                    stored_encoding = np.array(item['encoding'], dtype=np.uint8)
                    
                    # Reshape to match ORB descriptor format
                    num_features = len(stored_encoding) // 32
                    if num_features == 0:
                        continue
                        
                    stored_descriptors = stored_encoding[:num_features*32].reshape(-1, 32)
                    
                    # Match features
                    matches = self.bf_matcher.match(descriptors, stored_descriptors)
                    
                    # Calculate confidence based on match quality
                    if len(matches) > 0:
                        # Sort matches by distance
                        matches = sorted(matches, key=lambda x: x.distance)
                        
                        # Calculate confidence (lower distance = higher confidence)
                        # Use average distance of best matches
                        num_best_matches = min(50, len(matches))
                        avg_distance = sum(m.distance for m in matches[:num_best_matches]) / num_best_matches
                        
                        # Normalize confidence (ORB distance typically 0-100)
                        confidence = max(0, 1 - (avg_distance / 100))
                        
                        if confidence > best_confidence:
                            best_confidence = confidence
                            best_match = {
                                'userId': item.get('userId'),
                                'studentId': item.get('studentId'),
                                'name': item.get('name')
                            }
                            print(f"Match candidate: {item.get('name')} - Confidence: {confidence:.2f}")
                
                except Exception as e:
                    print(f"Error matching against encoding: {str(e)}")
                    continue
            
            # Check if best match meets threshold
            if best_match is None or best_confidence < self.confidence_threshold:
                return {
                    'success': True,
                    'match': None,
                    'confidence': float(best_confidence),
                    'message': f'No confident match found (confidence: {best_confidence:.2f})'
                }
            
            return {
                'success': True,
                'match': best_match,
                'confidence': float(best_confidence),
                'message': f'Match found with {best_confidence:.2f} confidence'
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error matching face: {str(e)}'
            }
    
    def detect_faces(self, image_data):
        """Detect faces in image"""
        try:
            # Decode image
            image = self._decode_image(image_data)
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            # Convert face locations to list format
            face_locations = [(int(x), int(y), int(w), int(h)) for (x, y, w, h) in faces]
            
            return {
                'success': True,
                'face_count': len(faces),
                'face_locations': face_locations,
                'message': f'Detected {len(faces)} face(s)'
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error detecting faces: {str(e)}'
            }
