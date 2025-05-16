from flask import Flask, request, jsonify
import face_recognition
import numpy as np
import cv2
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory database for demo (use a real DB or file in production)
registered_faces = {}  # name: encoding

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data['name']
    img_data = base64.b64decode(data['image'].split(',')[1])
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(rgb_img)
    if not encodings:
        return jsonify({'result': 'no_face'})
    registered_faces[name] = encodings[0].tolist()
    return jsonify({'result': 'registered', 'name': name})

@app.route('/recognize', methods=['POST'])
def recognize():
    data = request.json
    img_data = base64.b64decode(data['image'].split(',')[1])
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(rgb_img)
    if not encodings:
        return jsonify({'result': 'no_face'})
    encoding = encodings[0]
    for name, reg_encoding in registered_faces.items():
        matches = face_recognition.compare_faces([np.array(reg_encoding)], encoding)
        if matches[0]:
            return jsonify({'result': 'recognized', 'name': name})
    return jsonify({'result': 'unknown'})

if __name__ == '__main__':
    app.run(port=5001)