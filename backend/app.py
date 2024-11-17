import threading
import time
from flask import Flask, jsonify, request, redirect, current_app
from flask_sqlalchemy import SQLAlchemy
# Import the text, cast function and Date attribute
from sqlalchemy import text, cast, Date, or_
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
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from operator import itemgetter
from flask import jsonify

# Load environment variables
# load_dotenv()

# Near the top of your file, after the Flask app initialization
app = Flask(__name__)

# Update the CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Rest of your configuration
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


@app.route('/api/airport-details/<airport_code>', methods=['GET'])
def get_airport_details(airport_code):
    # Look up the airport based on the airport code
    airport = db.session.query(Airport).filter_by(
        airport_code=airport_code).first()
    if not airport:
        return jsonify({'city': 'Unknown', 'country': 'Unknown'}), 404

    # Fetch the city based on city_id from the airport
    city = db.session.query(City).filter_by(id=airport.city_id).first()
    if not city:
        return jsonify({'city': 'Unknown', 'country': 'Unknown'}), 404

    # Fetch the state using city.state_id
    state = db.session.query(State).filter_by(id=city.state_id).first()
    if not state:
        return jsonify({'city': city.city_name, 'country': 'Unknown'}), 404

    # Fetch the country using state.country_id
    country = db.session.query(Country).filter_by(id=state.country_id).first()

    # Return city and country information
    return jsonify({
        'city': city.city_name,
        'country': country.country_name if country else 'Unknown Country'
    })


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


@app.route('/api/places', methods=['GET'])
def get_places():
    # Replace the sample data with actual data as needed
    places = [
        {
            'id': 1,
            'name': 'Place 1',
            'description': 'Description of Place 1',
            'location': 'Location of Place 1',
            # ...additional fields...
        },
        {
            'id': 2,
            'name': 'Place 2',
            'description': 'Description of Place 2',
            'location': 'Location of Place 2',
            # ...additional fields...
        },
        # ...more places...
    ]
    return jsonify(places), 200


@app.route('/api/places/search', methods=['GET'])
def search_places():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City parameter is required'}), 400

    # Sample data - replace with actual data retrieval logic
    places = [
        {
            'id': 1,
            'name': f'Attraction 1 in {city}',
            'description': f'Description of Attraction 1 in {city}',
            'location': f'{city}',
            # ...additional fields...
        },
        {
            'id': 2,
            'name': f'Attraction 2 in {city}',
            'description': f'Description of Attraction 2 in {city}',
            'location': f'{city}',
            # ...additional fields...
        },
        # ...more places...
    ]

    return jsonify(places), 200


# ===================== CRUD FOR COUPON MODEL ===================== #

# GET all coupons
@app.route('/api/coupons', methods=['GET'])
def get_coupons():
    coupons = Coupon.query.all()
    return jsonify([coupon.to_dict() for coupon in coupons]), 200

# GET a single coupon by ID


@app.route('/api/coupons/<int:coupon_id>', methods=['GET'])
def get_coupon(coupon_id):
    coupon = Coupon.query.get_or_404(coupon_id)
    return jsonify(coupon.to_dict()), 200

# CREATE a new coupon


@app.route('/api/coupons', methods=['POST'])
def create_coupon():
    data = request.json
    new_coupon = Coupon(
        coupon_code=data['coupon_code'],
        coupon_code_name=re.split(
            '[-\s]', data.get('discount_type'))[0].upper() + data.get('discount_amount'),
        discount_amount=data.get('discount_amount'),
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d'),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d'),
        minimum_order_amount=data.get('minimum_order_amount'),
        user_roles=data.get('user_roles'),
        discount_type=data.get('discount_type')
    )
    db.session.add(new_coupon)
    db.session.commit()
    return jsonify(new_coupon.to_dict()), 201

# UPDATE an existing coupon by ID


@app.route('/api/coupons/<int:coupon_id>', methods=['PUT'])
def update_coupon(coupon_id):

    data = request.json
    coupon = Coupon.query.get_or_404(coupon_id)

    coupon.coupon_code = data.get('coupon_code', coupon.coupon_code)
    coupon.discount_amount = data.get(
        'discount_amount', coupon.discount_amount)
    coupon.start_date = datetime.strptime(
        data['start_date'], '%Y-%m-%d %H:%M:%S')
    coupon.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d %H:%M:%S')
    coupon.minimum_order_amount = data.get(
        'minimum_order_amount', coupon.minimum_order_amount)
    coupon.user_roles = data.get('user_roles', coupon.user_roles)
    coupon.discount_type = data.get('discount_type', coupon.discount_type)

    db.session.commit()
    return jsonify(coupon.to_dict()), 200

# DELETE a coupon by ID


@app.route('/api/coupons/<int:coupon_id>', methods=['DELETE'])
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
    coupon_code = data.get('coupon_code')
    email = data.get('user')  # Assuming user ID is passed in the request

    # Retrieve the user based on the provided email
    # Assuming user_email is passed into the function
    user = User.query.filter_by(email=email).first()

    if not coupon_code or not user:
        return jsonify({'error': 'No discount code or user ID provided'}), 400

    # Query the coupon from the database
    coupon = Coupon.query.filter(
        Coupon.coupon_code == coupon_code,
        or_(
            Coupon.user_roles == user.role,
            Coupon.user_roles == email
        )
    ).first()

    if not coupon:
        return jsonify({'error': 'Invalid discount code'}), 404

    current_time = datetime.utcnow()
    if coupon.end_date < current_time:
        return jsonify({'error': 'Coupon has expired'}), 400

    # Check if the user has already redeemed this coupon
    redemption = CouponRedemption.query.filter_by(
        user_id=user.id, coupon_id=coupon.coupon_id).first()
    if redemption:
        return jsonify({'error': 'Coupon has already been redeemed by this user'}), 400

    return jsonify({
        'success': 'Coupon applied successfully!',
        'discount_amount': coupon.discount_amount,
        'message': f'You get a ${coupon.discount_amount} discount with this coupon!',
        'coupon_code': coupon.coupon_code,
        'coupon_id': coupon.coupon_id,
        'user_id': user.id
    }), 200


@app.route('/api/redeem_coupon', methods=['POST'])
def redeem_coupon():
    data = request.json
    coupon_code = data.get('coupon_code')
    email = data.get('user')  # Assuming user ID is passed in the request

    validate_payload = {
        "user": email,
        "coupon_code": coupon_code
    }

    with current_app.test_request_context('/api/validate_coupon', method='POST', json=validate_payload):
        # Call validate_coupon and get the response
        response = validate_coupon()

        if isinstance(response, tuple):
            validate_coupon_response, status_code = response
        else:
            status_code = 200

    # Check if validation was successful
    if status_code != 200:
        # Return the validation error message if unsuccessful
        return validate_coupon_response

    validate_data = validate_coupon_response.get_json()
    user_id = validate_data.get('user_id')
    coupon_id = validate_data.get('coupon_id')

    # Record the redemption
    new_redemption = CouponRedemption(
        user_id=user_id, coupon_id=coupon_id, redeemed_at=datetime.utcnow())
    db.session.add(new_redemption)
    db.session.commit()

    return jsonify({
        'success': 'Coupon redeemed by the user successfully!',
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
            # Map from_country and from_city to country_name and city_name for compatibility
            country_name = data.get('to_country', 'Unknown Country')
            city_name = data.get('to_city', 'Unknown City')

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
                last_search_date=datetime.now(),
                to_country=country_name,  # Save country information
                to_city=city_name         # Save city information
            )

            db.session.add(new_search)
            db.session.commit()

            # Modify response to include `country_name` and `city_name` for compatibility with `MyFavorites.js`
            response_data = new_search.to_dict()
            # Rename for compatibility
            response_data['country_name'] = country_name
            # Rename for compatibility
            response_data['city_name'] = city_name

            return jsonify(response_data), 201

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


@app.route('/api/metrics', methods=['POST'])
def save_search_metrics():
    data = request.get_json()

    # Validate required fields
    required_fields = ['from_airport',
                       'to_airport', 'departure_date', 'travelers']
    for field in required_fields:
        if field not in data or data[field] is None:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # Create a new SearchMetrics instance
    search_metric = SearchMetrics(
        user_id=data.get('user_id'),
        user_role=data.get('user_role', 'guest'),
        from_airport=data['from_airport'],
        to_airport=data['to_airport'],
        departure_date=datetime.strptime(
            data['departure_date'], '%Y-%m-%d').date(),
        return_date=datetime.strptime(
            data['return_date'], '%Y-%m-%d').date() if data.get('return_date') else None,
        travelers=data.get('travelers', 1),
        roundtrip=data.get('roundtrip', False),
        timestamp=datetime.utcnow(),
        max_stops=data.get('max_stops'),
        preferred_airline=data.get('preferred_airline'),
        max_price=data.get('max_price')
    )

    try:
        # Add the search metrics to the database
        db.session.add(search_metric)
        db.session.commit()
        return jsonify({'message': 'Search metrics saved successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/metrics', methods=['GET'])
def get_all_search_metrics():
    # Query all records from the SearchMetrics model
    metrics = SearchMetrics.query.all()

    # Return the list of metrics as JSON
    return jsonify([metric.to_dict() for metric in metrics]), 200

# ===================Booked Flights========================


@app.route('/api/book_flight', methods=['POST'])
def book_flight():
    try:
        data = request.get_json()

        # Validate that the required fields are present
        required_fields = [
            'user_id', 'airline', 'flight_number', 'from_airport',
            'to_airport', 'departure_date', 'arrival_date', 'duration',
            'price', 'travelers', 'discount_applied', 'total_price', 'payment_method'
        ]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        # Create a new BookedFlight record without converting the dates
        new_booking = BookedFlight(
            user_id=data['user_id'],
            airline=data['airline'],
            flight_number=data['flight_number'],
            from_airport=data['from_airport'],
            to_airport=data['to_airport'],
            departure_date=data['departure_date'],  # Store as string
            arrival_date=data['arrival_date'],      # Store as string
            duration=data['duration'],
            price=data['price'],
            travelers=data['travelers'],
            discount_applied=data['discount_applied'],
            total_price=data['total_price'],
            payment_method=data['payment_method'],
            booking_date=datetime.utcnow(),  # Keep booking date in UTC
            status='confirmed'
        )

        # Add and commit the booking to the database
        db.session.add(new_booking)
        db.session.commit()

        return jsonify({"message": "Flight booked successfully!", "booking_id": new_booking.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/cancel_flight', methods=['POST'])
def cancel_flight():
    """
    Cancel a booked flight and issue a refund based on the time-to-departure policy.
    """
    try:
        data = request.get_json()
        booking_id = data.get('booking_id')

        if not booking_id:
            return jsonify({"error": "Booking ID is required"}), 400

        # Use `db.session.get` instead of `Query.get` for SQLAlchemy 2.0 compatibility
        booking = db.session.get(BookedFlight, booking_id)

        if not booking:
            return jsonify({"error": "Booking not found"}), 404

        if booking.status != 'confirmed':
            return jsonify({"message": "Flight cannot be canceled as it is not confirmed"}), 400

        current_time = datetime.now()
        departure_time = booking.departure_date  # departure_date is already a datetime object
        time_to_departure = departure_time - current_time

        if time_to_departure.total_seconds() > 14400:  # > 4 hours
            refund_amount = booking.total_price
            refund_policy = "Full refund"
        elif 7200 <= time_to_departure.total_seconds() <= 14400:  # 2-4 hours
            refund_amount = booking.total_price * 0.5
            refund_policy = "50% refund"
        else:  # < 2 hours
            refund_amount = 0
            refund_policy = "No refund"

        # Update booking status
        booking.status = 'canceled'
        db.session.commit()

        # Issue refund as travel credit only if refund_amount > 0
        if refund_amount > 0:
            credit_response = update_travel_credit_internal(
                user_id=booking.user_id, credit_change=refund_amount
            )
            if credit_response.get("error"):
                raise Exception(credit_response["error"])

        return jsonify({
            "message": f"Flight {booking.flight_number} canceled successfully",
            "refund_amount": refund_amount,
            "refund_policy": refund_policy,
            "status": booking.status
        }), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error canceling flight: {str(e)}")
        return jsonify({"error": str(e)}), 500


def update_travel_credit_internal(user_id, credit_change):
    """
    Internal utility function to update travel credit.
    """
    try:
        travel_credit = TravelCredit.query.filter_by(user_id=user_id).first()

        if not travel_credit:
            if credit_change < 0:
                return {"error": "Cannot subtract credit for a new user entry"}
            travel_credit = TravelCredit(
                user_id=user_id, balance=credit_change)
            db.session.add(travel_credit)
        else:
            new_balance = travel_credit.balance + credit_change
            if new_balance < 0:
                return {"error": "Insufficient credit balance"}
            travel_credit.balance = new_balance

        db.session.commit()
        return {"message": "Travel credit updated successfully", "balance": travel_credit.balance}
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error updating travel credit: {str(e)}")
        return {"error": str(e)}


@app.route('/api/confirmation', methods=['GET'])
def confirmation():
    try:
        booking_id = request.args.get('booking_id')
        booking = BookedFlight.query.get(booking_id)

        if not booking:
            return jsonify({"error": "Booking not found"}), 404

        # Prepare booking details for confirmation
        booking_details = {
            "id": booking.id,
            "user_id": booking.user_id,
            "airline": booking.airline,
            "flight_number": booking.flight_number,
            "from_airport": booking.from_airport,
            "to_airport": booking.to_airport,
            "departure_date": booking.departure_date,
            "arrival_date": booking.arrival_date,
            "duration": booking.duration,
            "price": booking.price,
            "travelers": booking.travelers,
            "discount_applied": booking.discount_applied,
            "total_price": booking.total_price,
            "payment_method": booking.payment_method,
            "booking_date": booking.booking_date,
            "status": booking.status
        }

        return jsonify({"booking": booking_details}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/booked_flights', methods=['GET'])
def get_booked_flights():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        # Fetch only confirmed flights for the given user ID
        flights = BookedFlight.query.filter_by(
            user_id=user_id, status='confirmed').all()

        # Check if the user has any confirmed flights
        if not flights:
            return jsonify({"message": "No confirmed flights found for this user"}), 404

        flight_data = [
            {
                "id": flight.id,
                "airline": flight.airline,
                "flight_number": flight.flight_number,
                "departure_airport": flight.from_airport,
                "destination_airport": flight.to_airport,
                "departure_time": flight.departure_date.strftime('%Y-%m-%d %H:%M:%S'),
                "arrival_time": flight.arrival_date.strftime('%Y-%m-%d %H:%M:%S'),
                "duration": flight.duration,
                "price": flight.price,
                "travelers": flight.travelers,
                "total_price": flight.total_price,
                "payment_method": flight.payment_method,
                "status": flight.status,
            }
            for flight in flights
        ]
        return jsonify(flight_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===================== CRUD FOR HOTEL MODEL ===================== #

@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    hotels = Hotel.query.all()
    return jsonify([{
        'id': hotel.id,
        'name': hotel.name,
        'city_id': hotel.city_id,
        'address': hotel.address,
        'neighborhood': hotel.neighborhood,
        'rating': hotel.rating,
        'price_per_night': hotel.price_per_night,
        'amenities': hotel.amenities.split(',') if hotel.amenities else [],
        'total_rooms': hotel.total_rooms,
        'available_rooms': hotel.available_rooms,
        'images': hotel.images.split(',') if hotel.images else [],
        'description': hotel.description,
        'latitude': hotel.latitude,
        'longitude': hotel.longitude
    } for hotel in hotels]), 200


@app.route('/api/hotels/<int:hotel_id>', methods=['GET'])
def get_hotel(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    return jsonify(hotel.to_dict()), 200


@app.route('/api/hotels', methods=['POST'])
def create_hotel():
    data = request.json
    new_hotel = Hotel(
        name=data['name'],
        city_id=data['city_id'],
        address=data['address'],
        neighborhood=data.get('neighborhood'),
        rating=data['rating'],
        price_per_night=data['price_per_night'],
        description=data.get('description'),
        check_in_time=data.get('check_in_time', '15:00'),
        check_out_time=data.get('check_out_time', '11:00'),
        total_rooms=data['total_rooms'],
        available_rooms=data['total_rooms'],
        amenities=','.join(data.get('amenities', [])),
        images=','.join(data.get('images', [])),
        latitude=data.get('latitude'),
        longitude=data.get('longitude')
    )
    db.session.add(new_hotel)
    db.session.commit()
    return jsonify(new_hotel.to_dict()), 201


@app.route('/api/hotels/<int:hotel_id>', methods=['PUT'])
def update_hotel(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    data = request.json

    for key, value in data.items():
        if key == 'amenities' and value:
            value = ','.join(value)
        if key == 'images' and value:
            value = ','.join(value)
        if hasattr(hotel, key):
            setattr(hotel, key, value)

    db.session.commit()
    return jsonify(hotel.to_dict()), 200


@app.route('/api/hotels/<int:hotel_id>', methods=['DELETE'])
def delete_hotel(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    db.session.delete(hotel)
    db.session.commit()
    return jsonify({'message': 'Hotel deleted'}), 200

# ===================== HOTEL SEARCH ENDPOINT ===================== #


@app.route('/api/hotels/search', methods=['POST'])
def search_hotels():
    data = request.json
    city_id = data.get('city_id')
    check_in = data.get('check_in')
    check_out = data.get('check_out')
    guests = data.get('guests', 1)

    if not all([city_id, check_in, check_out]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Convert dates to datetime objects
    check_in_date = datetime.strptime(check_in, '%Y-%m-%d').date()
    check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()

    # Basic validation
    if check_out_date <= check_in_date:
        return jsonify({'error': 'Check-out date must be after check-in date'}), 400

    # Calculate number of nights
    nights = (check_out_date - check_in_date).days

    # Query hotels with availability
    hotels = Hotel.query.filter(
        Hotel.city_id == city_id,
        Hotel.available_rooms >= guests,
        Hotel.is_active == True
    ).all()

    # Format response with calculated total price
    results = [{
        'id': hotel.id,
        'name': hotel.name,
        'rating': hotel.rating,
        'address': hotel.address,
        'neighborhood': hotel.neighborhood,
        'amenities': hotel.amenities.split(',') if hotel.amenities else [],
        'price_per_night': hotel.price_per_night,
        'total_price': hotel.price_per_night * nights,
        'available_rooms': hotel.available_rooms,
        'images': hotel.images.split(',') if hotel.images else [],
        'description': hotel.description,
        'check_in_time': hotel.check_in_time,
        'check_out_time': hotel.check_out_time
    } for hotel in hotels]

    return jsonify(results), 200

# ===================== HOTEL BOOKING ENDPOINTS ===================== #


@app.route('/api/hotel-bookings', methods=['POST'])
def book_hotel():
    data = request.json

    # Validate required fields
    required_fields = ['user_id', 'hotel_id', 'check_in_date', 'check_out_date',
                       'num_guests', 'payment_method']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    # Verify hotel availability
    hotel = Hotel.query.get_or_404(data['hotel_id'])
    if hotel.available_rooms < data['room_count']:
        return jsonify({'error': 'Not enough rooms available'}), 400

    # Calculate total price
    check_in_date = datetime.strptime(data['check_in_date'], '%Y-%m-%d').date()
    check_out_date = datetime.strptime(
        data['check_out_date'], '%Y-%m-%d').date()
    nights = (check_out_date - check_in_date).days
    total_price = hotel.price_per_night * nights * data['room_count']

    # Create booking
    booking = HotelBooking(
        user_id=data['user_id'],
        hotel_id=data['hotel_id'],
        check_in_date=check_in_date,
        check_out_date=check_out_date,
        num_guests=data['num_guests'],
        room_count=data.get('room_count', 1),
        total_price=total_price,
        discount_applied=data.get('discount_applied', 0.0),
        payment_method=data['payment_method'],
        special_requests=data.get('special_requests'),
        status='confirmed'
    )

    # Update hotel availability
    hotel.available_rooms -= data['room_count']

    try:
        db.session.add(booking)
        db.session.commit()
        return jsonify(booking.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/hotel-bookings/<int:user_id>', methods=['GET'])
def get_user_hotel_bookings(user_id):
    bookings = HotelBooking.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': booking.id,
        'hotel_id': booking.hotel_id,
        'hotel_name': booking.hotel.name,
        'check_in_date': booking.check_in_date.isoformat(),
        'check_out_date': booking.check_out_date.isoformat(),
        'num_guests': booking.num_guests,
        'room_count': booking.room_count,
        'total_price': booking.total_price,
        'status': booking.status,
        'booking_date': booking.booking_date.isoformat()
    } for booking in bookings]), 200

# ===================== HOTEL REVIEW ENDPOINTS ===================== #


@app.route('/api/hotel-reviews', methods=['POST'])
def create_hotel_review():
    data = request.json
    booking = HotelBooking.query.get_or_404(data['booking_id'])

    review = HotelReview(
        hotel_id=booking.hotel_id,
        user_id=booking.user_id,
        booking_id=booking.id,
        rating=data['rating'],
        review_text=data.get('review_text'),
        stay_date=booking.check_out_date
    )

    db.session.add(review)
    db.session.commit()
    return jsonify(review.to_dict()), 201


@app.route('/api/hotels/<int:hotel_id>/reviews', methods=['GET'])
def get_hotel_reviews(hotel_id):
    reviews = HotelReview.query.filter_by(hotel_id=hotel_id).all()
    return jsonify([{
        'id': review.id,
        'user_name': review.user.name,
        'rating': review.rating,
        'review_text': review.review_text,
        'stay_date': review.stay_date.isoformat(),
        'created': review.created.isoformat()
    } for review in reviews]), 200


@app.route('/api/rentals/search', methods=['POST'])
def search_rentals():
    data = request.get_json()
    pickup_city = data.get('pickupLocation')
    drop_off_city = data.get('dropOffLocation')
    pickup_date = data.get('pickupDate')
    drop_off_date = data.get('dropOffDate')
    pickup_time = data.get('pickupTime')
    drop_off_time = data.get('dropOffTime')
    driver_age = data.get('driverAge')

    rentals = Rental.query.filter(
        Rental.pickup_city_id == pickup_city,
        Rental.drop_off_city_id == drop_off_city,
        Rental.available_from <= f"{pickup_date} {pickup_time}",
        Rental.available_until >= f"{drop_off_date} {drop_off_time}",
        Rental.min_driver_age <= driver_age
    ).all()

    rental_data = [
        {
            "id": rental.id,
            "name": rental.name,
            "price_per_day": rental.price_per_day,
            "pickup_city": rental.pickup_city.city_name,
            "drop_off_city": rental.drop_off_city.city_name,
            "available_from": rental.available_from,
            "available_until": rental.available_until
        }
        for rental in rentals
    ]

    return jsonify(rental_data)


@app.route('/api/rentals/book', methods=['POST'])
def book_rental():
    data = request.get_json()
    rental_id = data.get('rental_id')
    user_id = data.get('user_id')
    pickup_date = data.get('pickup_date')
    pickup_time = data.get('pickup_time')  # Retrieve pickup_time
    drop_off_date = data.get('drop_off_date')
    dropoff_time = data.get('dropoff_time')  # Retrieve dropoff_time

    if not all([rental_id, user_id, pickup_date, pickup_time, drop_off_date, dropoff_time]):
        return jsonify({"error": "Missing required booking information"}), 400

    rental = Rental.query.get(rental_id)
    if not rental:
        return jsonify({"error": "Rental not found"}), 404

    pickup_datetime = datetime.strptime(
        f"{pickup_date} {pickup_time}", '%Y-%m-%d %H:%M')
    dropoff_datetime = datetime.strptime(
        f"{drop_off_date} {dropoff_time}", '%Y-%m-%d %H:%M')
    days = (dropoff_datetime - pickup_datetime).days

    if days < 1:
        return jsonify({"error": "Drop-off date must be after pickup date"}), 400

    total_price = days * rental.price_per_day

    booking = BookedRental(
        rental_id=rental_id,
        user_id=user_id,
        pickup_date=pickup_datetime.date(),
        pickup_time=pickup_datetime.time(),  # Save pickup_time
        drop_off_date=dropoff_datetime.date(),
        dropoff_time=dropoff_datetime.time(),  # Save dropoff_time
        total_price=total_price
    )

    db.session.add(booking)
    db.session.commit()

    return jsonify({
        "message": "Booking successful",
        "booking_id": booking.id,
        "rental_id": rental_id,
        "pickup_date": pickup_date,
        "pickup_time": pickup_time,
        "drop_off_date": drop_off_date,
        "dropoff_time": dropoff_time,
        "total_price": total_price
    })


@app.route('/api/rentals/my-rentals/<int:user_id>', methods=['GET'])
def get_user_rentals(user_id):
    try:
        rentals = BookedRental.query.filter_by(user_id=user_id).all()
        rental_data = [{
            "id": rental.id,
            "rental_id": rental.rental_id,
            "pickup_date": rental.pickup_date,
            # Include pickup_time
            "pickup_time": rental.pickup_time.strftime("%H:%M"),
            "drop_off_date": rental.drop_off_date,
            # Include dropoff_time
            "dropoff_time": rental.dropoff_time.strftime("%H:%M"),
            "total_price": float(rental.total_price),
            "rental_name": rental.rental.name
        } for rental in rentals]

        return jsonify(rental_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/combined-bookings/<int:user_id>', methods=['GET'])
def get_combined_bookings(user_id):
    try:
        # Get current date at midnight UTC
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        print(f"Current UTC date for filtering: {today}")  # Debug log

        # Get rentals
        rentals = BookedRental.query.filter(
            BookedRental.user_id == user_id,
            BookedRental.pickup_date >= today
        ).all()

        rental_bookings = [{
            "id": rental.id,
            "type": "rental",
            "rental_id": rental.rental_id,
            "name": rental.rental.name,
            "start_date": rental.pickup_date.isoformat(),
            "end_date": rental.drop_off_date.isoformat(),
            "price": float(rental.total_price),
            "details": {
                "pickup_time": rental.pickup_time.strftime("%H:%M"),
                "dropoff_time": rental.dropoff_time.strftime("%H:%M")
            }
        } for rental in rentals]

        # Get hotel bookings
        hotel_bookings = HotelBooking.query.filter(
            HotelBooking.user_id == user_id,
            HotelBooking.check_in_date >= today
        ).all()

        hotel_data = [{
            "id": booking.id,
            "type": "hotel",
            "name": booking.hotel.name,
            "start_date": booking.check_in_date.isoformat(),
            "end_date": booking.check_out_date.isoformat(),
            "price": float(booking.total_price),
            "details": {
                "num_guests": booking.num_guests,
                "room_count": booking.room_count,
                "status": booking.status
            }
        } for booking in hotel_bookings]

        # Get flight bookings
        flights = BookedFlight.query.filter(
            BookedFlight.user_id == user_id,
            BookedFlight.departure_date >= today
        ).all()

        flight_data = [{
            "id": flight.id,
            "type": "flight",
            "name": f"{flight.airline} {flight.flight_number}",
            "start_date": flight.departure_date.isoformat(),
            "end_date": flight.arrival_date.isoformat(),
            "price": float(flight.total_price),
            "details": {
                "airline": flight.airline,
                "flight_number": flight.flight_number,
                "from": flight.from_airport,
                "to": flight.to_airport,
                "duration": flight.duration,
                "travelers": flight.travelers,
                "payment_method": flight.payment_method,
                "status": flight.status
            }
        } for flight in flights]

        # Combine all bookings
        all_bookings = rental_bookings + hotel_data + flight_data

        # Sort by start_date
        sorted_bookings = sorted(
            all_bookings,
            key=lambda x: x['start_date']
        )

        print(f"Found {len(sorted_bookings)} upcoming bookings")  # Debug log
        for booking in sorted_bookings:
            # Debug log
            print(f"Booking: {booking['type']} - {booking['start_date']}")

        return jsonify(sorted_bookings), 200

    except Exception as e:
        print(f"Error in get_combined_bookings: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500


# ===================Send email notifications========================

# Create a new email notification
@app.route('/api/email_notifications', methods=['POST'])
def create_email_notifications():
    data = request.get_json()
    user_id = data.get('user_id')
    email = data.get('email')

    # Ensure both user_id and email are provided
    if not user_id or not email:
        return jsonify({"error": "user_id and email are required"}), 400

    # Create new EmailNotifications entry
    email_notification = EmailNotifications(user_id=user_id, email=email)
    db.session.add(email_notification)
    db.session.commit()

    return jsonify({"message": "Email notification created successfully"}), 201

# Retrieve all email notifications for a user


@app.route('/api/email_notifications', methods=['GET'])
def get_email_notifications():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    # Filter email notifications by user_id
    email_notifications = EmailNotifications.query.filter_by(
        user_id=user_id).all()
    results = [{"user_id": en.user_id, "email": en.email}
               for en in email_notifications]

    return jsonify(results), 200

# Update an existing email notification


@app.route('/api/email_notifications', methods=['PUT'])
def update_email_notifications():
    data = request.get_json()
    user_id = data.get('user_id')
    email = data.get('email')

    # Ensure both user_id and email are provided
    if not user_id or not email:
        return jsonify({"error": "user_id and email are required"}), 400

    # Find the existing email notification by user_id
    email_notification = EmailNotifications.query.filter_by(
        user_id=user_id).first()
    if not email_notification:
        return jsonify({"error": "Email notification not found"}), 404

    # Update email field
    email_notification.email = email
    db.session.commit()

    return jsonify({"message": "Email notification updated successfully"}), 200

# Delete an email notification


@app.route('/api/email_notifications', methods=['DELETE'])
def delete_email_notifications():
    data = request.get_json()
    user_id = data.get('user_id')

    # Ensure user_id is provided
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    # Find and delete the email notification by user_id
    email_notification = EmailNotifications.query.filter_by(
        user_id=user_id).first()
    if not email_notification:
        return jsonify({"error": "Email notification not found"}), 404

    db.session.delete(email_notification)
    db.session.commit()

    return jsonify({"message": "Email notification deleted successfully"}), 200


@app.route('/api/send_email_notifications', methods=['POST'])
def send_email_notifications():
    user_id = request.json.get('user_id')
    booking_id = request.json.get('booking_id')

    if not user_id or not booking_id:
        return jsonify({"error": "user_id and booking_id are required"}), 400

    # Step 1: Retrieve booking details from the confirmation API
    with current_app.test_request_context(f'/api/confirmation?booking_id={booking_id}', method='GET'):
        response = confirmation()
        if isinstance(response, tuple):
            booking_response, status_code = response
        else:
            status_code = 200

    if status_code != 200:
        return jsonify({"error": "Failed to retrieve booking details"}), 500

    booking_data = booking_response.get_json().get("booking")
    if not booking_data:
        return jsonify({"error": "Booking data not found"}), 404

    # Step 2: Retrieve emails to notify for this user
    with current_app.test_request_context(f'/api/email_notifications?user_id={user_id}', method='GET'):
        response = get_email_notifications()
        if isinstance(response, tuple):
            email_notifications_response, status_code = response
        else:
            status_code = 200

    if status_code != 200:
        return jsonify({"error": "Failed to retrieve email notifications"}), 500

    emails_to_notify = email_notifications_response.get_json()
    if not emails_to_notify:
        return jsonify({"message": "No emails to notify"}), 200

    # Step 3: Compose email content with booking details
    errors = []
    for item in emails_to_notify:
        email = item.get("email")
        if not email:
            continue

        user = User.query.get(user_id)

        # Format email content with booking details
        message = Mail(
            from_email='adityars@vt.edu',
            to_emails=email,
            subject="Booking Confirmation",
            html_content=f"""
                <strong>Dear {user.name},</strong><br>
                Your booking for flight {booking_data['flight_number']} with {booking_data['airline']}
                from {booking_data['from_airport']} to {booking_data['to_airport']} has been confirmed!<br>
                <br><strong>Booking Details:</strong><br>
                Departure: {booking_data['departure_date']}<br>
                Arrival: {booking_data['arrival_date']}<br>
                Duration: {booking_data['duration']}<br>
                Travelers: {booking_data['travelers']}<br>
                Total Price: ${booking_data['total_price']}<br>
                Payment Method: {booking_data['payment_method']}<br>
                <br>Thank you for booking with us!
            """
        )

        # Step 4: Send the email
        try:
            sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
            response = sg.send(message)
            print(f"Email sent to {email} - Status: {response.status_code}")
        except Exception as e:
            print(f"Failed to send email to {email}: {e}")
            errors.append({"email": email, "error": str(e)})

    if errors:
        return jsonify({"message": "Some emails failed to send", "errors": errors}), 207
    else:
        return jsonify({"message": "Emails sent successfully"}), 200


def send_reminder_emails():
    with app.app_context():
        print("Running send_reminder_emails....")
        # Calculate the date two days from now
        reminder_date = datetime.utcnow()
        reminder_date_start = reminder_date.replace(
            hour=0, minute=0, second=0, microsecond=0)
        reminder_date = datetime.utcnow() + timedelta(days=2)
        reminder_date_end = reminder_date.replace(
            hour=23, minute=59, second=59, microsecond=999999)

        print("Sending the remainders from " +
              str(reminder_date_start) + " to " + str(reminder_date_end))
        # Query for all booked flights departing two days from now
        try:

            flights = BookedFlight.query.filter(
                BookedFlight.departure_date.between(
                    reminder_date_start, reminder_date_end)
            ).all()
            print(flights)

            if not flights:
                return jsonify({"message": "No flights scheduled for departure in two days."}), 200

            # Collect users and their associated emails
            user_emails = {}
            for flight in flights:
                user_id = flight.user_id

                # Check if we've already retrieved emails for this user
                if user_id not in user_emails:
                    with current_app.test_request_context(f'/api/email_notifications?user_id={user_id}', method='GET'):
                        response = get_email_notifications()
                        if isinstance(response, tuple):
                            email_notifications_response, status_code = response
                        else:
                            status_code = 200

                    if status_code != 200:
                        continue  # Skip this user if emails couldn't be retrieved

                    emails = email_notifications_response.get_json()
                    user_emails[user_id] = [email['email'] for email in emails]

                # Send reminder emails to each email for this user
                errors = []
                print(user_emails[user_id])
                for email in user_emails[user_id]:
                    message = Mail(
                        from_email='adityars@vt.edu',
                        to_emails=email,
                        subject=f"Reminder: Upcoming Flight {
                            flight.flight_number} with {flight.airline}",
                        html_content=f"""
                            <strong>Dear User,</strong><br>
                            This is a reminder that you have an upcoming flight:<br><br>
                            <strong>Flight Details:</strong><br>
                            Airline: {flight.airline}<br>
                            Flight Number: {flight.flight_number}<br>
                            Departure: {flight.from_airport} at {flight.departure_date}<br>
                            Arrival: {flight.to_airport} at {flight.arrival_date}<br>
                            Duration: {flight.duration}<br>
                            Travelers: {flight.travelers}<br>
                            <br>Safe travels!<br>
                            Best regards,<br> Your Booking Team
                        """
                    )

                    try:
                        sg = SendGridAPIClient(
                            os.environ.get('SENDGRID_API_KEY'))
                        response = sg.send(message)
                        print(f"Reminder email sent to {
                              email} - Status: {response.status_code}")
                    except Exception as e:
                        print(f"Failed to send email to {email}: {e}")
                        errors.append(
                            {"email": email, "flight_id": flight.id, "error": str(e)})

            if errors:
                return jsonify({"message": "Some emails failed to send", "errors": errors}), 207
            else:
                return jsonify({"message": "Reminder emails sent successfully"}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500


def start_post_startup_task():
    # Give the server time to fully start up (adjust the sleep time if necessary)
    time.sleep(5)  # Wait 5 seconds after the server starts
    send_reminder_emails()  # Invoke your function

# =================== Travel Credit ========================


@app.route('/api/travel_credit', methods=['POST'])
def update_travel_credit():
    """
    Update or add travel credit for a user.
    The credit balance cannot be negative.
    """
    data = request.get_json()
    user_id = data.get('user_id')
    credit_change = data.get('credit_change')

    if not user_id or credit_change is None:
        return jsonify({'error': 'user_id and credit_change are required'}), 400

    try:
        travel_credit = TravelCredit.query.filter_by(user_id=user_id).first()

        if not travel_credit:
            if credit_change < 0:
                return jsonify({'error': 'Cannot subtract credit for a new user entry'}), 400
            travel_credit = TravelCredit(
                user_id=user_id, balance=credit_change)
            db.session.add(travel_credit)
        else:
            new_balance = travel_credit.balance + credit_change
            if new_balance < 0:
                return jsonify({'error': 'Insufficient credit balance'}), 400
            travel_credit.balance = new_balance

        db.session.commit()
        return jsonify({
            'message': 'Travel credit updated successfully',
            'user_id': travel_credit.user_id,
            'balance': travel_credit.balance
        }), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error updating travel credit: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/travel_credits/<int:user_id>', methods=['GET'])
def get_travel_credit(user_id):
    """
    Retrieve travel credit balance for a user.
    """
    try:
        travel_credit = TravelCredit.query.filter_by(user_id=user_id).first()
        if travel_credit:
            return jsonify({
                'user_id': travel_credit.user_id,
                'balance': travel_credit.balance
            }), 200
        else:
            # If no travel credit found, return balance 0
            return jsonify({
                'user_id': user_id,
                'balance': 0
            }), 200
    except Exception as e:
        app.logger.error(f"Error retrieving travel credit: {str(e)}")
        return jsonify({'error': 'An error occurred while retrieving travel credit'}), 500


# ===================Run the Flask Application========================

if __name__ == '__main__':
    # Start the post-startup task in a separate thread
    thread = threading.Thread(target=start_post_startup_task)
    thread.start()
    app.run(host='0.0.0.0', port=9001, debug=True)
