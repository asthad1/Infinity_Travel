from flask import Flask, jsonify, request, redirect
from flask_sqlalchemy import SQLAlchemy
# Import the text, cast function and Date attribute
from sqlalchemy import text, cast, Date
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
import logging

# Load environment variables
# load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://infinity_travel_owner:q9urkfXI7nGg@ep-spring-frost-a4siuz5k.us-east-1.aws.neon.tech/infinity_travel?sslmode=require'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(message)s')
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

    user = User(name=name, email=email, phone=phone, role=role,
                password=password, membership_number=membership_number)
    db.session.add(user)
    db.session.commit()

    # Return membership number in the response
    return jsonify({'message': 'User registered successfully', 'membership_number': membership_number}), 201

# *** Updated login route to include 'role' in the response ***
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')  # Use 'email' instead of 'username'
    password = data.get('password')

    # Assuming you're checking the email and password against your database
    # Query by email instead of username
    user = User.query.filter_by(email=email).first()

    if user and user.password == password:  # Assuming check_password method exists
        # Login successful, return user information including user_id and role
        return jsonify({
            'email': user.email,    # Return email instead of username
            'user_id': user.id,     # Return user_id
            'role': user.role       # Include the user's role
        }), 200
    else:
        # Login failed
        return jsonify({'message': 'Invalid credentials'}), 401

# Route to change password
@app.route('/api/change_password', methods=['POST'])
def change_password():
    data = request.get_json()
    user_id = data.get('user_id')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    user = User.query.get(user_id)

    if user and user.password == old_password:  # Replace this with proper password hashing
        user.password = new_password
        db.session.commit()
        return jsonify({'message': 'Password updated successfully'}), 200
    else:
        return jsonify({'message': 'Incorrect old password'}), 400


# ===================== USER COUNT ENDPOINT FOR NOTIFICATION BANNER ===================== #

@app.route('/api/users/count', methods=['GET'])
def get_user_count():
    count = User.query.count()
    return jsonify({'count': count}), 200


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

@app.route('/api/flights', methods=['GET'])
def get_flights():
    flights = Flight.query.all()
    flight_list = [
        {
            'id': flight.id,  # Ensure flight ID is included here
            'flight_number': flight.flight_name,
            'airline': flight.airline,
            'departure_airport': flight.from_airport,
            'destination_airport': flight.to_airport,
            'departure_time': flight.departure.strftime('%Y-%m-%d %H:%M:%S') if flight.departure else None,
            'arrival_time': flight.arrival.strftime('%Y-%m-%d %H:%M:%S') if flight.arrival else None,
            'duration': flight.duration,
            'price': flight.fare,
            'stops': flight.stops,
            'available_seats': flight.available_seats
        }
        for flight in flights
    ]
    return jsonify(flight_list), 200


@app.route('/api/flights/<int:id>', methods=['GET'])
def get_flight(id):
    flight = Flight.query.get_or_404(id)
    return jsonify(flight.to_dict()), 200


@app.route('/api/flights', methods=['POST'])
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
        # flight_number=data['flight_number'],
        duration=data['duration']
    )
    db.session.add(new_flight)
    db.session.commit()
    return jsonify(new_flight.to_dict()), 201


@app.route('/api/flights/<int:id>', methods=['PUT'])
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
    flight.flight_name = data.get('flight_number', flight.flight_name)
    flight.duration = data.get('duration', flight.duration)
    db.session.commit()
    return jsonify(flight.to_dict()), 200


@app.route('/api/flights/<int:id>', methods=['DELETE'])
def delete_flight(id):
    flight = Flight.query.get_or_404(id)
    db.session.delete(flight)
    db.session.commit()
    return jsonify({'message': 'Flight deleted'}), 200


@app.route('/api/flights/search', methods=['POST'])
def search_flights():
    logging.debug(f"Headers: {request.headers}")
    logging.debug(f"Request Data: {request.data}")
    data = request.json

    # Extract search parameters for departure and return flights
    departure_airport = data.get('departureAirport')
    destination_airport = data.get('destinationAirport')
    departure_date = data.get('departureDate')

    return_date = data.get('returnDate') if 'returnDate' in data else None
    num_travellers = data.get('numTravellers', 1)
    num_stops = data.get('numStops') if data.get('numStops') != '' else None
    selected_airline = data.get('selectedAirline') if data.get(
        'selectedAirline') != '' else None
    max_price = data.get('maxPrice') if data.get('maxPrice') != '' else None

    # Start with base query for departure flights
    flights_query = Flight.query
    logging.debug(flights_query)
    # Apply filters based on input parameters for departure flights
    if departure_airport:
        flights_query = flights_query.filter(
            Flight.from_airport == departure_airport)

    if destination_airport:
        flights_query = flights_query.filter(
            Flight.to_airport == destination_airport)

    if departure_date:
        flights_query = flights_query.filter(
            Flight.departure_date == departure_date)

    if num_stops is not None:
        flights_query = flights_query.filter(Flight.stops == int(num_stops))

    if selected_airline:
        flights_query = flights_query.filter(
            Flight.airline == selected_airline)

    if max_price:
        flights_query = flights_query.filter(Flight.fare <= float(max_price))

    # Fetch all matching departure flights
    departure_flights = flights_query.all()

    # Filter out departure flights that don't have enough available seats
    available_departure_flights = [
        flight for flight in departure_flights if int(flight.available_seats) >= int(num_travellers)
    ]
    logging.debug(f"Number of travelers: {num_travellers}")
    # Search for return flights if round-trip is selected
    available_return_flights = []
    if return_date:
        return_flights_query = Flight.query

        # Apply filters for return flights
        return_flights_query = return_flights_query.filter(
            Flight.from_airport == destination_airport)
        return_flights_query = return_flights_query.filter(
            Flight.to_airport == departure_airport)
        return_flights_query = return_flights_query.filter(
            Flight.departure_date == return_date)

        if num_stops is not None:
            return_flights_query = return_flights_query.filter(
                Flight.stops == int(num_stops))

        if selected_airline:
            return_flights_query = return_flights_query.filter(
                Flight.airline == selected_airline)

        if max_price:
            return_flights_query = return_flights_query.filter(
                Flight.fare <= float(max_price))

        # Fetch all matching return flights
        return_flights = return_flights_query.all()

        # Filter out return flights that don't have enough available seats
        available_return_flights = [
            flight for flight in return_flights if int(flight.available_seats) >= int(num_travellers)
        ]

    # Convert departure flights to a JSON-serializable format
    departure_flight_list = [
        {
            'flight_id': flight.id,
            'flight_number': flight.flight_name,
            'airline': flight.airline,
            'departure_airport': flight.from_airport,
            'destination_airport': flight.to_airport,
            'departure_time': flight.departure.strftime('%Y-%m-%d %H:%M'),
            'arrival_time': flight.arrival.strftime('%Y-%m-%d %H:%M'),
            'price': flight.fare,
            'stops': flight.stops,
            'duration': flight.duration,
            'available_seats': flight.available_seats
        }
        for flight in available_departure_flights
    ]

    # Convert return flights to a JSON-serializable format
    return_flight_list = [
        {
            'flight_id': flight.id,
            'flight_number': flight.flight_name,
            'airline': flight.airline,
            'departure_airport': flight.from_airport,
            'destination_airport': flight.to_airport,
            'departure_time': flight.departure.strftime('%Y-%m-%d %H:%M'),
            'arrival_time': flight.arrival.strftime('%Y-%m-%d %H:%M'),
            'price': flight.fare,
            'stops': flight.stops,
            'duration': flight.duration,
            'available_seats': flight.available_seats
        }
        for flight in available_return_flights
    ]

    # Return both departure and return flights if applicable
    return jsonify({
        'departureFlights': departure_flight_list,
        'returnFlights': return_flight_list
    }), 200


# ===================== CRUD FOR CITY MODEL ===================== #

@app.route('/api/cities', methods=['GET'])
def get_cities():
    cities = City.query.all()
    return jsonify([city.to_dict() for city in cities]), 200


@app.route('/api/cities/<int:id>', methods=['GET'])
def get_city(id):
    city = City.query.get_or_404(id)
    return jsonify(city.to_dict()), 200


@app.route('/api/cities', methods=['POST'])
def create_city():
    data = request.json
    new_city = City(city_name=data['city_name'], state_id=data['state_id'])
    db.session.add(new_city)
    db.session.commit()
    return jsonify(new_city.to_dict()), 201


@app.route('/api/cities/<int:id>', methods=['PUT'])
def update_city(id):
    data = request.json
    city = City.query.get_or_404(id)
    city.city_name = data.get('city_name', city.city_name)
    city.state_id = data.get('state_id', city.state_id)
    db.session.commit()
    return jsonify(city.to_dict()), 200


@app.route('/api/cities/<int:id>', methods=['DELETE'])
def delete_city(id):
    city = City.query.get_or_404(id)
    db.session.delete(city)
    db.session.commit()
    return jsonify({'message': 'City deleted'}), 200


# ===================== CRUD FOR STATE MODEL ===================== #

@app.route('/api/states', methods=['GET'])
def get_states():
    states = State.query.all()
    return jsonify([state.to_dict() for state in states]), 200


@app.route('/api/states/<int:id>', methods=['GET'])
def get_state(id):
    state = State.query.get_or_404(id)
    return jsonify(state.to_dict()), 200


@app.route('/api/states', methods=['POST'])
def create_state():
    data = request.json
    new_state = State(state_name=data['state_name'])
    db.session.add(new_state)
    db.session.commit()
    return jsonify(new_state.to_dict()), 201


@app.route('/api/states/<int:id>', methods=['PUT'])
def update_state(id):
    data = request.json
    state = State.query.get_or_404(id)
    state.state_name = data.get('state_name', state.state_name)
    db.session.commit()
    return jsonify(state.to_dict()), 200


@app.route('/api/states/<int:id>', methods=['DELETE'])
def delete_state(id):
    state = State.query.get_or_404(id)
    db.session.delete(state)
    db.session.commit()
    return jsonify({'message': 'State deleted'}), 200


# ===================== CRUD FOR AIRPORT MODEL ===================== #

@app.route('/api/airports', methods=['GET'])
def get_airports():
    airports = Airport.query.all()
    airport_list = [
        {'code': airport.airport_code, 'name': airport.airport}
        for airport in airports
    ]
    return jsonify(airport_list), 200


@app.route('/api/airports/<int:id>', methods=['GET'])
def get_airport(id):
    airport = Airport.query.get_or_404(id)
    return jsonify(airport.to_dict()), 200


@app.route('/api/airports', methods=['POST'])
def create_airport():
    data = request.json
    new_airport = Airport(airport=data['airport'], city_id=data['city_id'])
    db.session.add(new_airport)
    db.session.commit()
    return jsonify(new_airport.to_dict()), 201


@app.route('/api/airports/<int:id>', methods=['PUT'])
def update_airport(id):
    data = request.json
    airport = Airport.query.get_or_404(id)
    airport.airport = data.get('airport', airport.airport)
    airport.city_id = data.get('city_id', airport.city_id)
    db.session.commit()
    return jsonify(airport.to_dict()), 200


@app.route('/api/airports/<int:id>', methods=['DELETE'])
def delete_airport(id):
    airport = Airport.query.get_or_404(id)
    db.session.delete(airport)
    db.session.commit()
    return jsonify({'message': 'Airport deleted'}), 200


@app.route('/api/airlines', methods=['GET'])
def get_airlines():
    # Fetch unique airline names from the flights table
    airlines = db.session.query(Flight.airline).distinct().all()
    airline_list = [airline[0] for airline in airlines]
    return jsonify(airline_list), 200

# ===================== CRUD FOR FAVORITE MODEL ===================== #


@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    data = request.json
    user_id = data.get('user_id')
    flight_id = data.get('flight_id')

    favorite = Favorite(
        user_id=user_id,
        flight_id=flight_id,
        departure_airport=data.get('departure_airport'),
        arrival_airport=data.get('arrival_airport'),
        departure_time=data.get('departure_time'),
        arrival_time=data.get('arrival_time'),
        price=data.get('price'),
        label=data.get('label', 'Favorite Flight')
    )

    db.session.add(favorite)
    db.session.commit()

    return jsonify({'message': 'Flight added to favorites'}), 201

# Get all favorites for a user


@app.route('/api/favorites/<int:user_id>', methods=['GET'])
def get_favorites(user_id):
    # Retrieve all favorites for the given user
    favorites = Favorite.query.filter_by(user_id=user_id).all()

    # Build a response including flight details for each favorite
    favorite_list = [
        {
            'favorite_id': fav.id,
            'flight_id': fav.flight.id,
            'flight_number': fav.flight.flight_name,
            'airline': fav.flight.airline,
            'departure_airport': fav.flight.from_airport,
            'destination_airport': fav.flight.to_airport,
            'departure_time': fav.flight.departure,
            'arrival_time': fav.flight.arrival,
            'duration': fav.flight.duration,
            'price': fav.flight.fare,
            'stops': fav.flight.stops,
            'available_seats': fav.flight.available_seats,
            'label': fav.label  # The custom label the user added
        }
        for fav in favorites
    ]

    return jsonify(favorite_list), 200

# Update a favorite (label)


@app.route('/api/favorites/<int:favorite_id>', methods=['PUT'])
def update_favorite(favorite_id):
    data = request.json
    favorite = Favorite.query.get(favorite_id)

    if not favorite:
        return jsonify({'error': 'Favorite not found'}), 404

    # Update the label if provided
    favorite.label = data.get('label', favorite.label)
    db.session.commit()

    return jsonify({'message': 'Favorite updated successfully!'}), 200

# Delete a favorite


@app.route('/api/favorites/<int:favorite_id>', methods=['DELETE'])
def delete_favorite(favorite_id):
    favorite = Favorite.query.get(favorite_id)

    if not favorite:
        return jsonify({'error': 'Favorite not found'}), 404

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({'message': 'Favorite deleted successfully!'}), 200
# Route to generate and share a favorite search


# @app.route('/api/favorites/<int:id>/share', methods=['POST'])
# def share_favorite(id):
#     favorite = Favorite.query.get_or_404(id)

#     # Generate the shareable URL if it doesn't exist
#     if not favorite.shared_url:
#         favorite.generate_shareable_url()

#     # Generate full shareable link
#     shareable_link = url_for('view_shared_search',
#                              url=favorite.shared_url, _external=True)

#     return jsonify({'shareable_link': shareable_link}), 200

# Route to view shared favorite search via URL


@app.route('/api/favorites/shared/<url>', methods=['GET'])
def view_shared_search(url):
    favorite = Favorite.query.filter_by(shared_url=url).first_or_404()

    # Return favorite search details, excluding sensitive user info
    return jsonify({
        'flight_id': favorite.flight_id,
        'airport_name': favorite.airport_name,
        'state_name': favorite.state_name,
        'city_name': favorite.city_name
    }), 200


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
    coupon.discount_percentage = data.get(
        'discount_percentage', coupon.discount_percentage)
    coupon.discount_amount = data.get(
        'discount_amount', coupon.discount_amount)
    coupon.start_date = datetime.strptime(
        data['start_date'], '%Y-%m-%d %H:%M:%S')
    coupon.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d %H:%M:%S')
    coupon.minimum_order_amount = data.get(
        'minimum_order_amount', coupon.minimum_order_amount)
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


@app.route('/api/search/flights/<from_airport_code>/<to_airport_code>/<date>/<int:travellers>', methods=['GET'])
def get_flights_by_airports(from_airport_code, to_airport_code, date, travellers):
    # Parse the date in YYMMDD format and convert to datetime

    try:
        # Convert YYMMDD to YYYY-MM-DD
        parsed_date = datetime.strptime(
            date, '%y%m%d').date()  # Get only the date part
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

# Redirect traffic to your frontend application (React)


@app.route('/shared-flights/<flight_id>')
def shared_flights(flight_id):
    # Replace 'localhost:3000' with the production URL if necessary
    return redirect(f"http://localhost:3000/shared-flights/{flight_id}")


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

# ===================== CRUD FOR SAVEDSEARCH MODEL ===================== #


@app.route('/api/saved-searches', methods=['GET'])
def get_saved_searches():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    saved_searches = SavedSearch.query.filter_by(
        user_id=user_id).order_by(SavedSearch.created.desc()).all()
    return jsonify([search.to_dict() for search in saved_searches]), 200


@app.route('/api/saved-searches', methods=['POST'])
def save_search():
    try:
        data = request.json
        app.logger.info(f"Received save search request with data: {data}")

        # Validate required fields
        required_fields = {
            'user_id': int,
            'from_airport': str,
            'to_airport': str,
            'departure_date': str
        }

        # Validate each required field
        for field, field_type in required_fields.items():
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
            try:
                if field_type == int:
                    data[field] = int(data[field])
                elif field_type == str and not data[field]:
                    return jsonify({'error': f'Field cannot be empty: {field}'}), 400
            except ValueError:
                return jsonify({'error': f'Invalid value for field: {field}'}), 400

        try:
            new_search = SavedSearch(
                user_id=data['user_id'],
                name=data.get('name', f"{data['from_airport']} to {
                              data['to_airport']}"),
                from_airport=data['from_airport'],
                to_airport=data['to_airport'],
                departure_date=data['departure_date'],
                return_date=data.get('return_date'),
                adults=data.get('adults', 1),
                max_price=data.get('max_price'),
                max_stops=data.get('max_stops'),
                preferred_airline=data.get('preferred_airline'),
                created=datetime.now(),
                modified=datetime.now(),
                last_search_date=datetime.now()
            )

            db.session.add(new_search)
            db.session.commit()

            return jsonify(new_search.to_dict()), 201

        except Exception as e:
            app.logger.error(f"Error creating saved search: {str(e)}")
            db.session.rollback()
            return jsonify({'error': str(e)}), 400

    except Exception as e:
        app.logger.error(f"Unexpected error in save_search: {str(e)}")
        return jsonify({'error': str(e)}), 400


@app.route('/api/saved-searches/<int:search_id>', methods=['PUT'])
def update_saved_search(search_id):
    search = SavedSearch.query.get_or_404(search_id)
    data = request.json

    # Update fields if they exist in the request
    if 'name' in data:
        search.name = data['name']
    if 'max_price' in data:
        search.max_price = data['max_price']
    if 'max_stops' in data:
        search.max_stops = data['max_stops']
    if 'preferred_airline' in data:
        search.preferred_airline = data['preferred_airline']

    try:
        db.session.commit()
        return jsonify(search.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/saved-searches/<int:search_id>', methods=['DELETE'])
def delete_saved_search(search_id):
    search = SavedSearch.query.get_or_404(search_id)

    try:
        db.session.delete(search)
        db.session.commit()
        return jsonify({'message': 'Saved search deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/saved-searches/<int:search_id>/execute', methods=['GET'])
def execute_saved_search(search_id):
    search = SavedSearch.query.get_or_404(search_id)

    # Build search query based on saved parameters
    flights_query = Flight.query.filter(
        Flight.from_airport == search.from_airport,
        Flight.to_airport == search.to_airport,
        Flight.departure_date == search.departure_date
    )

    # Apply saved filters
    if search.max_price:
        flights_query = flights_query.filter(Flight.fare <= search.max_price)
    if search.max_stops is not None:
        flights_query = flights_query.filter(Flight.stops <= search.max_stops)
    if search.preferred_airline:
        flights_query = flights_query.filter(
            Flight.airline == search.preferred_airline)

    # Execute the search
    flights = flights_query.all()

    # Update last search information
    search.last_search_date = datetime.utcnow()
    if flights:
        search.last_minimum_price = min(flight.fare for flight in flights)
    db.session.commit()

    # Format flight results
    flight_results = [
        {
            'flight_id': flight.id,
            'flight_number': flight.flight_name,
            'airline': flight.airline,
            'departure_airport': flight.from_airport,
            'destination_airport': flight.to_airport,
            'departure_time': flight.departure.strftime('%Y-%m-%d %H:%M'),
            'arrival_time': flight.arrival.strftime('%Y-%m-%d %H:%M'),
            'price': flight.fare,
            'stops': flight.stops,
            'duration': flight.duration,
            'available_seats': flight.available_seats
        }
        for flight in flights
    ]

    return jsonify({
        'search': search.to_dict(),
        'results': flight_results,
        'total_results': len(flights)
    }), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9001, debug=True)
