from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    
    # Simulate a successful login (no actual authentication logic here)
    if username:
        return jsonify({'message': 'Login successful', 'user': username}), 200
    else:
        return jsonify({'message': 'Login failed'}), 401

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
