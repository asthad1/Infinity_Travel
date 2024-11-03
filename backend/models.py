from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Date
from sqlalchemy.orm import relationship
from datetime import date, datetime
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
    
    redemptions = relationship('CouponRedemption', back_populates='user')


class Flight(BaseModel, db.Model):
    __tablename__ = 'flights'

    id = Column(Integer, primary_key=True)
    flight_name = Column(String(10), nullable=False)
    airline = Column(String(100), nullable=False)  # Airline name
    # IATA code for departure airport (e.g., LAX)
    from_airport = Column(String(5), nullable=False)
    # IATA code for destination airport (e.g., JFK)
    to_airport = Column(String(5), nullable=False)
    departure = Column(DateTime, nullable=False)  # Departure time and date
    arrival = Column(DateTime, nullable=False)  # Arrival time and date
    duration = Column(String(10), nullable=False)  # Flight duration
    fare = Column(Float, nullable=False)  # Flight price in USD
    stops = Column(Integer, nullable=False)  # Number of stops
    # Available seats for the flight
    available_seats = Column(Integer, nullable=False)
    # Departure date for search filtering
    departure_date = Column(Date, nullable=False)

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
    # Correct: snake_case
    departure_time = Column(DateTime, default=datetime.utcnow)
    arrival_time = Column(DateTime, default=datetime.utcnow)
    price = Column(Integer, nullable=False)

    flight = db.relationship('Flight')


class Coupon(BaseModel, db.Model):
    __tablename__ = 'coupons'

    coupon_id = Column(Integer, primary_key=True)
    coupon_code = Column(String(15), nullable=False, unique=True)
    coupon_code_name = Column(String(50), nullable=False, unique=True)
    discount_amount = Column(Float, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    minimum_order_amount = Column(Float, nullable=True)
    # ForeignKey can be added if needed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    user_roles = Column(String(50), nullable=True)  # Customer, Vendor, etc.
    # Holiday, First-time User, etc.
    discount_type = Column(String(50), nullable=True)
    
    redemptions = relationship('CouponRedemption', back_populates='coupon')


class SavedSearch(BaseModel, db.Model):
    __tablename__ = 'saved_searches'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), nullable=False)
    from_airport = Column(String(5), nullable=False)
    to_airport = Column(String(5), nullable=False)
    # Store as string 'YYYY-MM-DD'
    departure_date = Column(String(10), nullable=False)
    # Store as string 'YYYY-MM-DD'
    return_date = Column(String(10), nullable=True)
    adults = Column(Integer, default=1)
    created = Column(DateTime, default=datetime.now)
    modified = Column(DateTime, onupdate=datetime.now)

    # Optional filters
    max_price = Column(Integer, nullable=True)
    max_stops = Column(Integer, nullable=True)
    preferred_airline = Column(String(100), nullable=True)

    # Last search results
    last_search_date = Column(DateTime, nullable=True)
    last_minimum_price = Column(Integer, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'from_airport': self.from_airport,
            'to_airport': self.to_airport,
            'departure_date': self.departure_date,
            'return_date': self.return_date,
            'adults': self.adults,
            'max_price': self.max_price,
            'max_stops': self.max_stops,
            'preferred_airline': self.preferred_airline,
            'created': self.created.isoformat() if self.created else None,
            'modified': self.modified.isoformat() if self.modified else None,
            'last_search_date': self.last_search_date.isoformat() if self.last_search_date else None,
            'last_minimum_price': self.last_minimum_price
        }

class CouponRedemption(db.Model):
    __tablename__ = 'coupon_redemptions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    coupon_id = Column(Integer, ForeignKey('coupons.coupon_id'), nullable=False)
    redeemed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship('User', back_populates='redemptions')
    coupon = relationship('Coupon', back_populates='redemptions')
    

class SearchMetrics(db.Model):
    __tablename__ = 'search_metrics'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    user_role = db.Column(db.String(50), default='guest')
    from_airport = db.Column(db.String(5), nullable=False)
    to_airport = db.Column(db.String(5), nullable=False)
    departure_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=True)
    travelers = db.Column(db.Integer, default=1)
    roundtrip = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    max_stops = db.Column(db.Integer, nullable=True)
    preferred_airline = db.Column(db.String(100), nullable=True)
    max_price = db.Column(db.Numeric(10, 2), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_role': self.user_role,
            'from_airport': self.from_airport,
            'to_airport': self.to_airport,
            'departure_date': self.departure_date,
            'return_date': self.return_date,
            'travelers': self.travelers,
            'roundtrip': self.roundtrip,
            'timestamp': self.timestamp,
            'max_stops': self.max_stops,
            'preferred_airline': self.preferred_airline,
            'max_price': float(self.max_price) if self.max_price else None,
        }
