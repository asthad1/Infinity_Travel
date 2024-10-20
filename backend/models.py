from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from extensions import db
from utils import to_dict
from sqlalchemy.inspection import inspect


class BaseModel:
    def to_dict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}

    

class User(BaseModel, db.Model):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    # lastname = Column(String(50), nullable=False)
    address = Column(String(255), nullable=True)
    zipcode = Column(String(10), nullable=True)
    phone = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # To denote user type
    membership_number = db.Column(db.String(45), unique=True, nullable=False)


class Flight(BaseModel, db.Model):
    __tablename__ = 'flights'

    id = Column(Integer, primary_key=True)
    flight_name = Column(String(10), nullable=False)
    airline = Column(String(100), nullable=False)  # Airline name
    from_airport = Column(String(5), nullable=False)  # IATA code for departure airport (e.g., LAX)
    to_airport = Column(String(5), nullable=False)  # IATA code for destination airport (e.g., JFK)
    departure = Column(DateTime, nullable=False)  # Departure time and date
    arrival = Column(DateTime, nullable=False)  # Arrival time and date
    duration = Column(String(10), nullable=False)  # Flight duration
    fare = Column(Integer, nullable=False)  # Flight price in USD
    stops = Column(Integer, nullable=False)  # Number of stops
    available_seats = Column(Integer, nullable=False)  # Available seats for the flight
    departure_date = Column(Date, nullable=False)  # Departure date for search filtering

    def __repr__(self):
        return f'<Flight {self.flight_name} from {self.from_airport} to {self.to_airport}>'


class City(BaseModel, db.Model):
    __tablename__ = 'cities'
    
    id = Column(Integer, primary_key=True)
    city_name = Column(String(100), nullable=False)
    state_id = Column(Integer, ForeignKey('states.id'), nullable=False)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)


class State(BaseModel, db.Model):
    __tablename__ = 'states'
    
    id = Column(Integer, primary_key=True)
    state_name = Column(String(100), nullable=False)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)


class Airport(BaseModel, db.Model):
    __tablename__ = 'airports'
    
    id = Column(Integer, primary_key=True)
    airport = Column(String(100), nullable=False)
    airport_code = Column(String(5), unique=True, nullable=False)
    city_id = Column(Integer, ForeignKey('cities.id'), nullable=False)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Airport {self.airport_code}>'

class Favorite(BaseModel, db.Model):
    __tablename__ = 'favorites'
    
    id = Column(Integer, primary_key=True)
    flight_id = Column(Integer, ForeignKey('flights.id'), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    departure_airport = Column(String(255), nullable=False)  # Use snake_case
    arrival_airport = Column(String(255), nullable=False)    # Use snake_case
    label = db.Column(db.String(255), nullable=True)
    departure_time = Column(DateTime, default=datetime.utcnow)  # Correct: snake_case
    arrival_time = Column(DateTime, default=datetime.utcnow) 
    price = Column(Integer, nullable=False)

    flight = db.relationship('Flight')

