from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, cast, Date  # Import the text, cast function and Date attribute
from sqlalchemy.orm import aliased
# from dotenv import load_dotenv
import os
from models import *
from extensions import db


# Load environment variables
# load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
# db = SQLAlchemy(app)

db.init_app(app)

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

# Search Flights
@app.route('/search/flights/<from_airport_code>/<to_airport_code>/<date>/<int:travellers>', methods=['GET'])
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9001)

