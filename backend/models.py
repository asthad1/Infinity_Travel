from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from extensions import db
from utils import to_dict

# db = SQLAlchemy()

class BaseModel:
    def to_dict(self):
        return to_dict(self)
    

class User(BaseModel, db.Model):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    firstname = Column(String(50), nullable=False)
    lastname = Column(String(50), nullable=False)
    address = Column(String(255), nullable=False)
    zipcode = Column(String(10), nullable=False)
    phone_number = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)
    password = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)  # To denote user type

    # Relationships
    favorites = relationship('Favorite', back_populates='user')

class Flight(BaseModel, db.Model):
    __tablename__ = 'flights'
    
    id = Column(Integer, primary_key=True)
    flight_name = Column(String(100), nullable=False)
    to_airport = Column(Integer, ForeignKey('airports.id'), nullable=False)
    from_airport = Column(Integer, ForeignKey('airports.id'), nullable=False)
    departure = Column(DateTime, nullable=False)
    arrival = Column(DateTime, nullable=False)
    flight_class = Column(String(50), nullable=False)  # First, Business, Economy
    fare = Column(Float, nullable=False)
    flight_number = Column(String(20), nullable=False)
    duration = Column(String(10), nullable=False)  # In hours or minutes
    stops = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)

    # Relationships
    to_airport_rel = relationship('Airport', foreign_keys=[to_airport])
    from_airport_rel = relationship('Airport', foreign_keys=[from_airport])
    favorites = relationship('Favorite', back_populates='flight')

class City(BaseModel, db.Model):
    __tablename__ = 'cities'
    
    id = Column(Integer, primary_key=True)
    city_name = Column(String(100), nullable=False)
    state_id = Column(Integer, ForeignKey('states.id'), nullable=False)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)

    # Relationships
    state = relationship('State', back_populates='cities')
    airports = relationship('Airport', back_populates='city')

class State(BaseModel, db.Model):
    __tablename__ = 'states'
    
    id = Column(Integer, primary_key=True)
    state_name = Column(String(100), nullable=False)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)

    # Relationships
    cities = relationship('City', back_populates='state')

class Airport(BaseModel, db.Model):
    __tablename__ = 'airports'
    
    id = Column(Integer, primary_key=True)
    airport = Column(String(100), nullable=False)
    airport_code = Column(String(5), unique=True, nullable=False)
    city_id = Column(Integer, ForeignKey('cities.id'), nullable=False)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)

    # Relationships
    city = relationship('City', back_populates='airports')

class Favorite(BaseModel, db.Model):
    __tablename__ = 'favorites'
    
    id = Column(Integer, primary_key=True)
    flight_id = Column(Integer, ForeignKey('flights.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    airport_name = Column(String(100), nullable=True)
    state_name = Column(String(100), nullable=True)  # Optional
    city_name = Column(String(100), nullable=True)   # Optional
    
    # Relationships
    user = relationship('User', back_populates='favorites')
    flight = relationship('Flight', back_populates='favorites')
