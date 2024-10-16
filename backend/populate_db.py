from faker import Faker
from app import db, app
from models import User, Flight, City, State, Airport  # Import your models
import random
import re
from datetime import datetime, timedelta

fake = Faker()

# Create fake data for states
def create_states(num=5):
    for _ in range(num):
        state = State(state_name=fake.state())
        db.session.add(state)
    db.session.commit()

# Create fake data for cities
def create_cities(num=10):
    states = State.query.all()
    for _ in range(num):
        city = City(city_name=fake.city(), state_id=random.choice(states).id)
        db.session.add(city)
    db.session.commit()

# Create fake data for airports
def generate_unique_airport_code(airport_name):
    # Function to generate airport code based on first letters
    airport_code = ''.join(word[0].upper() for word in re.split(r'[\s,-]+', airport_name) if word)
    
    # Check if the generated code already exists
    existing_airport = Airport.query.filter_by(airport_code=airport_code).first()

    # If it exists, add a number at the end or regenerate until it's unique
    suffix = 1
    while existing_airport:
        # Add or increment a numeric suffix to make it unique
        new_code = airport_code + str(suffix)
        existing_airport = Airport.query.filter_by(airport_code=new_code).first()
        suffix += 1
    
    return new_code if suffix > 1 else airport_code

def create_airports(num=10):
    cities = City.query.all()
    for _ in range(num):
        airport_name = fake.company()
        
        airport_code = generate_unique_airport_code(airport_name)
        
        airport = Airport(airport=airport_name, city_id=random.choice(cities).id, airport_code=airport_code)
        db.session.add(airport)
    
    db.session.commit()

# Create fake data for users
def create_users(num=10):
    for _ in range(num):
        user = User(
            firstname=fake.first_name(),
            lastname=fake.last_name(),
            address=fake.address(),
            zipcode=fake.zipcode(),
            phone_number=fake.phone_number(),
            email=fake.email(),
            is_active=True,
            password=fake.password(),
            role=random.choice(['general_user', 'admin'])
        )
        db.session.add(user)
    db.session.commit()

# Create fake data for flights
def create_flights(num=10):
    airports = Airport.query.all()
    for _ in range(num):
        flight = Flight(
            flight_name=fake.company() + " Airlines",
            from_airport=random.choice(airports).id,
            to_airport=random.choice(airports).id,
            departure=datetime.utcnow() + timedelta(days=random.randint(1, 30)),
            arrival=datetime.utcnow() + timedelta(days=random.randint(31, 60)),
            flight_class=random.choice(['Economy', 'Business', 'First']),
            fare=random.uniform(100.0, 1500.0),
            flight_number=fake.unique.ean8(),
            duration=f"{random.randint(1, 10)}h {random.randint(0, 59)}m",
            stops=random.randint(0,3),
            available_seats=random.randint(0,100)
        )
        db.session.add(flight)
    db.session.commit()

# Populate the database
def populate_database():
    with app.app_context():
        create_states(5)
        create_cities(10)
        create_airports(10)
        create_users(10)
        create_flights(10)
        print("Database populated with fake data!")

if __name__ == '__main__':
    populate_database()
