from flask import Flask, jsonify, request
import re
import uuid
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory store for accounts (for example purposes; ideally use a database)
accounts = {}

def validate_password(password):
    errors = []
    if len(password) < 8:
        errors.append("At least 8 characters")
    if not re.search(r'[A-Z]', password):
        errors.append("At least one uppercase letter")
    if not re.search(r'[a-z]', password):
        errors.append("At least one lowercase letter")
    if not re.search(r'[0-9]', password):
        errors.append("At least one number")
    if not re.search(r'[!@#?$]', password):
        errors.append("At least one special character (! @ # ? $)")
    return errors

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not all([name, email, phone, password]):
        return jsonify({'message': 'All fields are required'}), 400

    password_errors = validate_password(password)
    if password_errors:
        return jsonify({
            'message': 'Password does not meet the following requirements. Please try again:',
            'requirements': password_errors
        }), 400

    # Check if email is already used
    if email in accounts:
        return jsonify({'message': 'Email already registered'}), 400

    # Generate a unique membership number
    membership_number = str(uuid.uuid4())

    # Store user information
    accounts[email] = {
        'name': name,
        'phone': phone,
        'membership_number': membership_number,
        'password': password  # Note: NEVER store plain text passwords in a real application
    }

    return jsonify({'message': 'Account created successfully', 'membership_number': membership_number}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Check if user exists and password matches
    user = accounts.get(username)
    if user and user['password'] == password:
        return jsonify({'message': 'Login successful', 'user': username}), 200
    else:
        return jsonify({'message': 'Login failed'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


