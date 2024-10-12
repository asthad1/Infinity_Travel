from faker import Faker
from app import db, app
from models import User, Flight, City, State, Airport  # Import your models
import random
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
def create_airports(num=10):
    cities = City.query.all()
    for _ in range(num):
        airport = Airport(airport=fake.company(), city_id=random.choice(cities).id)
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
            duration=f"{random.randint(1, 10)}h {random.randint(0, 59)}m"
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
