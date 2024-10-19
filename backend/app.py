from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, cast, Date  # Import the text, cast function and Date attribute
from sqlalchemy.orm import aliased
import random
import string
# from dotenv import load_dotenv
import os
import re
import uuid
from flask_cors import CORS
from models import *
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash


# Load environment variables
# load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://infinity_travel_owner:xxxxxx@ep-spring-frost-a4siuz5k.us-east-1.aws.neon.tech/infinity_travel?sslmode=require'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
# db = SQLAlchemy(app)

db.init_app(app)

# ===================== LOGIN ================================== #




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

def generate_membership_number():
    return ''.join(random.choices(string.digits, k=16))


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    role = data.get('role')
    password = data.get('password')

    # Generate membership number
    membership_number = generate_membership_number()

    if not all([name, email, phone, role, password]):
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
    # membership_number = str(uuid.uuid4())

    # Store user information
    # accounts[email] = {
    #     'name': name,
    #     'phone': phone,
    #     'membership_number': membership_number,
    #     'password': password  # Note: NEVER store plain text passwords in a real application
    # }

    # return jsonify({'message': 'Account created successfully', 'membership_number': membership_number}), 201
    user = User(name=name, email=email, phone=phone, role = role, password=password, membership_number=membership_number)
    db.session.add(user)
    db.session.commit()

    # Return membership number in the response
    return jsonify({'message': 'User registered successfully', 'membership_number': membership_number}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Print the received data
    print(f"Data is: {data}", flush=True)  # Use flush=True to force printing immediately
    
    # Fetch the user by email
    user = User.query.filter_by(email=username).first()  # Use .first() to fetch the user instance
    
    # Print the user object (or None if not found)
    print(f"User is : {user}", flush=True)
    
    # Check if user exists and compare passwords
    if user and user.password == password:
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401


# ===================== CRUD FOR USER MODEL ===================== #

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@app.route('/users/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get_or_404(id)
    return jsonify(user.to_dict()), 200

@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    new_user = User(
        firstname=data['firstname'],
        lastname=data['lastname'],
        address=data['address'],
        zipcode=data['zipcode'],
        phone_number=data['phone_number'],
        email=data['email'],
        is_active=data['is_active'],
        password=data['password'],  # Ideally hashed
        role=data['role']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.to_dict()), 201

@app.route('/users/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.json
    user = User.query.get_or_404(id)
    user.firstname = data.get('firstname', user.firstname)
    user.lastname = data.get('lastname', user.lastname)
    user.address = data.get('address', user.address)
    user.zipcode = data.get('zipcode', user.zipcode)
    user.phone_number = data.get('phone_number', user.phone_number)
    user.email = data.get('email', user.email)
    user.is_active = data.get('is_active', user.is_active)
    user.password = data.get('password', user.password)
    user.role = data.get('role', user.role)
    db.session.commit()
    return jsonify(user.to_dict()), 200

@app.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200


# ===================== CRUD FOR FLIGHT MODEL ===================== #

@app.route('/flights', methods=['GET'])
def get_flights():
    flights = Flight.query.all()
    return jsonify([flight.to_dict() for flight in flights]), 200

@app.route('/flights/<int:id>', methods=['GET'])
def get_flight(id):
    flight = Flight.query.get_or_404(id)
    return jsonify(flight.to_dict()), 200

@app.route('/flights', methods=['POST'])
def create_flight():
    data = request.json
    new_flight = Flight(
        flight_name=data['flight_name'],
        from_airport=data['from_airport'],
        to_airport=data['to_airport'],
        departure=data['departure'],
        arrival=data['arrival'],
        flight_class=data['flight_class'],
        fare=data['fare'],
        flight_number=data['flight_number'],
        duration=data['duration']
    )
    db.session.add(new_flight)
    db.session.commit()
    return jsonify(new_flight.to_dict()), 201

@app.route('/flights/<int:id>', methods=['PUT'])
def update_flight(id):
    data = request.json
    flight = Flight.query.get_or_404(id)
    flight.flight_name = data.get('flight_name', flight.flight_name)
    flight.from_airport = data.get('from_airport', flight.from_airport)
    flight.to_airport = data.get('to_airport', flight.to_airport)
    flight.departure = data.get('departure', flight.departure)
    flight.arrival = data.get('arrival', flight.arrival)
    flight.flight_class = data.get('flight_class', flight.flight_class)
    flight.fare = data.get('fare', flight.fare)
    flight.flight_number = data.get('flight_number', flight.flight_number)
    flight.duration = data.get('duration', flight.duration)
    db.session.commit()
    return jsonify(flight.to_dict()), 200

@app.route('/flights/<int:id>', methods=['DELETE'])
def delete_flight(id):
    flight = Flight.query.get_or_404(id)
    db.session.delete(flight)
    db.session.commit()
    return jsonify({'message': 'Flight deleted'}), 200


# ===================== CRUD FOR CITY MODEL ===================== #

@app.route('/cities', methods=['GET'])
def get_cities():
    cities = City.query.all()
    return jsonify([city.to_dict() for city in cities]), 200

@app.route('/cities/<int:id>', methods=['GET'])
def get_city(id):
    city = City.query.get_or_404(id)
    return jsonify(city.to_dict()), 200

@app.route('/cities', methods=['POST'])
def create_city():
    data = request.json
    new_city = City(city_name=data['city_name'], state_id=data['state_id'])
    db.session.add(new_city)
    db.session.commit()
    return jsonify(new_city.to_dict()), 201

@app.route('/cities/<int:id>', methods=['PUT'])
def update_city(id):
    data = request.json
    city = City.query.get_or_404(id)
    city.city_name = data.get('city_name', city.city_name)
    city.state_id = data.get('state_id', city.state_id)
    db.session.commit()
    return jsonify(city.to_dict()), 200

@app.route('/cities/<int:id>', methods=['DELETE'])
def delete_city(id):
    city = City.query.get_or_404(id)
    db.session.delete(city)
    db.session.commit()
    return jsonify({'message': 'City deleted'}), 200


# ===================== CRUD FOR STATE MODEL ===================== #

@app.route('/states', methods=['GET'])
def get_states():
    states = State.query.all()
    return jsonify([state.to_dict() for state in states]), 200

@app.route('/states/<int:id>', methods=['GET'])
def get_state(id):
    state = State.query.get_or_404(id)
    return jsonify(state.to_dict()), 200

@app.route('/states', methods=['POST'])
def create_state():
    data = request.json
    new_state = State(state_name=data['state_name'])
    db.session.add(new_state)
    db.session.commit()
    return jsonify(new_state.to_dict()), 201

@app.route('/states/<int:id>', methods=['PUT'])
def update_state(id):
    data = request.json
    state = State.query.get_or_404(id)
    state.state_name = data.get('state_name', state.state_name)
    db.session.commit()
    return jsonify(state.to_dict()), 200

@app.route('/states/<int:id>', methods=['DELETE'])
def delete_state(id):
    state = State.query.get_or_404(id)
    db.session.delete(state)
    db.session.commit()
    return jsonify({'message': 'State deleted'}), 200


# ===================== CRUD FOR AIRPORT MODEL ===================== #

@app.route('/airports', methods=['GET'])
def get_airports():
    airports = Airport.query.all()
    return jsonify([airport.to_dict() for airport in airports]), 200

@app.route('/airports/<int:id>', methods=['GET'])
def get_airport(id):
    airport = Airport.query.get_or_404(id)
    return jsonify(airport.to_dict()), 200

@app.route('/airports', methods=['POST'])
def create_airport():
    data = request.json
    new_airport = Airport(airport=data['airport'], city_id=data['city_id'])
    db.session.add(new_airport)
    db.session.commit()
    return jsonify(new_airport.to_dict()), 201

@app.route('/airports/<int:id>', methods=['PUT'])
def update_airport(id):
    data = request.json
    airport = Airport.query.get_or_404(id)
    airport.airport = data.get('airport', airport.airport)
    airport.city_id = data.get('city_id', airport.city_id)
    db.session.commit()
    return jsonify(airport.to_dict()), 200

@app.route('/airports/<int:id>', methods=['DELETE'])
def delete_airport(id):
    airport = Airport.query.get_or_404(id)
    db.session.delete(airport)
    db.session.commit()
    return jsonify({'message': 'Airport deleted'}), 200

# ===================== CRUD FOR FAVORITE MODEL ===================== #

@app.route('/favorites', methods=['GET'])
def get_favorites():
    favorites = Favorite.query.all()
    return jsonify([favorite.to_dict() for favorite in favorites]), 200

@app.route('/favorites/<int:id>', methods=['GET'])
def get_favorite(id):
    favorite = Favorite.query.get_or_404(id)
    return jsonify(favorite.to_dict()), 200

@app.route('/favorites', methods=['POST'])
def create_favorite():
    data = request.json
    # Validate that user and flight exist
    user = User.query.get_or_404(data['user_id'])
    flight = Flight.query.get_or_404(data['flight_id'])
    
    new_favorite = Favorite(
        flight_id=flight.id,
        user_id=user.id,
        airport_name=data.get('airport_name'),
        state_name=data.get('state_name'),
        city_name=data.get('city_name')
    )
    db.session.add(new_favorite)
    db.session.commit()
    return jsonify(new_favorite.to_dict()), 201

@app.route('/favorites/<int:id>', methods=['PUT'])
def update_favorite(id):
    data = request.json
    favorite = Favorite.query.get_or_404(id)
    
    # Update foreign key relationships
    if 'flight_id' in data:
        flight = Flight.query.get_or_404(data['flight_id'])
        favorite.flight_id = flight.id

    if 'user_id' in data:
        user = User.query.get_or_404(data['user_id'])
        favorite.user_id = user.id

    # Update optional fields
    favorite.airport_name = data.get('airport_name', favorite.airport_name)
    favorite.state_name = data.get('state_name', favorite.state_name)
    favorite.city_name = data.get('city_name', favorite.city_name)

    db.session.commit()
    return jsonify(favorite.to_dict()), 200

@app.route('/favorites/<int:id>', methods=['DELETE'])
def delete_favorite(id):
    favorite = Favorite.query.get_or_404(id)
    db.session.delete(favorite)
    db.session.commit()
    return jsonify({'message': 'Favorite deleted'}), 200


@app.route('/favorites/user/<int:user_id>', methods=['GET'])
def get_favorites_by_user(user_id):
    # Check if the user exists
    user = User.query.get_or_404(user_id)
    
    # Query all favorites for the given user
    favorites = Favorite.query.filter_by(user_id=user.id).all()
    
    return jsonify([favorite.to_dict() for favorite in favorites]), 200

# ===================== CRUD FOR COUPON MODEL ===================== #

# GET all coupons
@app.route('/coupons', methods=['GET'])
def get_coupons():
    coupons = Coupon.query.all()
    return jsonify([coupon.to_dict() for coupon in coupons]), 200

# GET a single coupon by ID
@app.route('/coupons/<int:coupon_id>', methods=['GET'])
def get_coupon(coupon_id):
    coupon = Coupon.query.get_or_404(coupon_id)
    return jsonify(coupon.to_dict()), 200

# CREATE a new coupon
@app.route('/coupons', methods=['POST'])
def create_coupon():
    data = request.json
    new_coupon = Coupon(
        coupon_code=data['coupon_code'],
        discount_percentage=data.get('discount_percentage'),
        discount_amount=data.get('discount_amount'),
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d %H:%M:%S'),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d %H:%M:%S'),
        minimum_order_amount=data.get('minimum_order_amount'),
        admin_id=data['admin_id'],
        user_roles=data.get('user_roles'),
        discount_type=data.get('discount_type')
    )
    db.session.add(new_coupon)
    db.session.commit()
    return jsonify(new_coupon.to_dict()), 201

# UPDATE an existing coupon by ID
@app.route('/coupons/<int:coupon_id>', methods=['PUT'])
def update_coupon(coupon_id):
    data = request.json
    coupon = Coupon.query.get_or_404(coupon_id)
    
    coupon.coupon_code = data.get('coupon_code', coupon.coupon_code)
    coupon.discount_percentage = data.get('discount_percentage', coupon.discount_percentage)
    coupon.discount_amount = data.get('discount_amount', coupon.discount_amount)
    coupon.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d %H:%M:%S')
    coupon.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d %H:%M:%S')
    coupon.minimum_order_amount = data.get('minimum_order_amount', coupon.minimum_order_amount)
    coupon.admin_id = data.get('admin_id', coupon.admin_id)
    coupon.user_roles = data.get('user_roles', coupon.user_roles)
    coupon.discount_type = data.get('discount_type', coupon.discount_type)
    
    db.session.commit()
    return jsonify(coupon.to_dict()), 200

# DELETE a coupon by ID
@app.route('/coupons/<int:coupon_id>', methods=['DELETE'])
def delete_coupon(coupon_id):
    coupon = Coupon.query.get_or_404(coupon_id)
    db.session.delete(coupon)
    db.session.commit()
    return jsonify({'message': 'Coupon deleted'}), 200

# ===================== SEARCH FLIGHTS API ===================== #
@app.route('/api/search/flights/<from_airport_code>/<to_airport_code>/<date>/<int:travellers>', methods=['GET'])
def search_flights(from_airport_code, to_airport_code, date, travellers):
    # Parse the date in YYMMDD format and convert to datetime
    try:
        # Convert YYMMDD to YYYY-MM-DD
        parsed_date = datetime.strptime(date, '%y%m%d').date()  # Get only the date part
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYMMDD.'}), 400

    # Get optional query parameters
    no_of_stops = request.args.get('stops', default=None)
    airlines = request.args.get('airlines', default=None)
    price_limit = request.args.get('price_limit', default=None)

    from_airport = aliased(Airport)
    to_airport = aliased(Airport)

    # Updated query using aliases
    flights = Flight.query \
        .join(from_airport, Flight.from_airport == from_airport.id) \
        .join(to_airport, Flight.to_airport == to_airport.id) \
        .filter(from_airport.airport_code == from_airport_code) \
        .filter(to_airport.airport_code == to_airport_code) \
        .filter(cast(Flight.departure, Date) == parsed_date) \
        .filter(Flight.available_seats >= travellers)

    # Apply filters for optional parameters
    if no_of_stops is not None:
        flights = flights.filter(Flight.stops == int(no_of_stops))
    if airlines is not None:
        flights = flights.filter(Flight.airline == airlines)
    if price_limit is not None:
        flights = flights.filter(Flight.fare <= float(price_limit))

    # Execute the query and get the results
    result_flights = flights.all()

    return jsonify([flight.to_dict() for flight in result_flights]), 200

@app.route('/api/validate_coupon', methods=['POST'])
def validate_coupon():
    data = request.json
    discount_code = data.get('discount_code')
    
    # Validate if the coupon code was provided
    if not discount_code:
        return jsonify({'error': 'No discount code provided'}), 400

    # Query the coupon from the database
    coupon = Coupon.query.filter_by(coupon_code=discount_code).first()

    if not coupon:
        # If the coupon does not exist
        return jsonify({'error': 'Invalid discount code'}), 404

    # Check if the coupon is expired
    current_time = datetime.utcnow()
    print(coupon.end_date, current_time)
    if coupon.end_date < current_time:
        return jsonify({'error': 'Coupon has expired'}), 400

    # Coupon is valid, calculate the discount percentage or amount
    discount = coupon.discount_percentage if coupon.discount_percentage else 0

    return jsonify({
        'success': 'Coupon applied successfully!',
        'discount_percentage': discount,
        'discount_amount': coupon.discount_amount,
        'message': f'You get a {discount}% discount with this coupon!'
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9001)
