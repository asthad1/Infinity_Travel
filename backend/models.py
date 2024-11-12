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


class Country(BaseModel, db.Model):
    __tablename__ = 'countries'

    id = Column(Integer, primary_key=True)
    country_name = Column(String(100), nullable=False, unique=True)
    country_code = Column(String(100), nullable=False, unique=True)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)


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
    country_id = Column(Integer, ForeignKey('countries.id'), nullable=False)
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

    # New fields for country and city
    from_country = Column(String(100), nullable=True)  # Country of origin
    to_country = Column(String(100), nullable=True)    # Destination country
    from_city = Column(String(100), nullable=True)     # Origin city
    to_city = Column(String(100), nullable=True)       # Destination city

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
            'last_minimum_price': self.last_minimum_price,
            'from_country': self.from_country,
            'to_country': self.to_country,
            'from_city': self.from_city,
            'to_city': self.to_city
        }


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


class CouponRedemption(db.Model):
    __tablename__ = 'coupon_redemptions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    coupon_id = Column(Integer, ForeignKey(
        'coupons.coupon_id'), nullable=False)
    redeemed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship('User', back_populates='redemptions')
    coupon = relationship('Coupon', back_populates='redemptions')


class BookedFlight(BaseModel, db.Model):
    __tablename__ = 'booked_flights'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    airline = Column(String, nullable=False)
    flight_number = Column(String, nullable=False)
    from_airport = Column(String, nullable=False)
    to_airport = Column(String, nullable=False)
    departure_date = Column(DateTime, nullable=False)
    arrival_date = Column(DateTime, nullable=False)
    duration = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    travelers = Column(Integer, nullable=False)
    discount_applied = Column(Float, default=0.0)  # Total discount in dollars
    total_price = Column(Float, nullable=False)
    # e.g., "Credit Card", "PayPal", "Google Pay"
    payment_method = Column(String, nullable=False)
    booking_date = Column(DateTime, default=datetime.utcnow)


class Hotel(BaseModel, db.Model):
    __tablename__ = 'hotels'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    city_id = Column(Integer, ForeignKey('cities.id'), nullable=False)
    address = Column(String(255), nullable=False)
    neighborhood = Column(String(100), nullable=True)
    rating = Column(Float, nullable=False)  # e.g., 4.5
    price_per_night = Column(Float, nullable=False)
    description = Column(String(1000), nullable=True)
    check_in_time = Column(String(50), nullable=False,
                           default='15:00')  # Standard check-in time
    check_out_time = Column(String(50), nullable=False,
                            default='11:00')  # Standard check-out time
    total_rooms = Column(Integer, nullable=False)
    available_rooms = Column(Integer, nullable=False)
    # Store as comma-separated list
    amenities = Column(String(500), nullable=True)
    # Store as comma-separated URLs
    images = Column(String(1000), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    city = relationship('City', backref='hotels')

    def __repr__(self):
        return f'<Hotel {self.name} in {self.city.city_name}>'

    def to_dict(self):
        base_dict = super().to_dict()
        # Convert amenities string to list
        if base_dict['amenities']:
            base_dict['amenities'] = base_dict['amenities'].split(',')
        # Convert images string to list
        if base_dict['images']:
            base_dict['images'] = base_dict['images'].split(',')
        return base_dict


class HotelBooking(BaseModel, db.Model):
    __tablename__ = 'hotel_bookings'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    hotel_id = Column(Integer, ForeignKey('hotels.id'), nullable=False)
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    num_guests = Column(Integer, nullable=False)
    room_count = Column(Integer, nullable=False, default=1)
    total_price = Column(Float, nullable=False)
    discount_applied = Column(Float, default=0.0)
    payment_method = Column(String(50), nullable=False)
    booking_date = Column(DateTime, default=datetime.utcnow)
    # confirmed, cancelled, completed
    status = Column(String(20), nullable=False, default='confirmed')
    special_requests = Column(String(500), nullable=True)

    # Relationships
    user = relationship('User', backref='hotel_bookings')
    hotel = relationship('Hotel', backref='bookings')

    def __repr__(self):
        return f'<HotelBooking {self.id} for {self.user.name} at {self.hotel.name}>'


class HotelReview(BaseModel, db.Model):
    __tablename__ = 'hotel_reviews'

    id = Column(Integer, primary_key=True)
    hotel_id = Column(Integer, ForeignKey('hotels.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    booking_id = Column(Integer, ForeignKey(
        'hotel_bookings.id'), nullable=False)
    rating = Column(Float, nullable=False)  # 1-5 stars
    review_text = Column(String(1000), nullable=True)
    stay_date = Column(Date, nullable=False)
    created = Column(DateTime, default=datetime.utcnow)
    modified = Column(DateTime, onupdate=datetime.utcnow)
    # Verified if there's a matching booking
    is_verified = Column(Boolean, default=True)

    # Relationships
    hotel = relationship('Hotel', backref='reviews')
    user = relationship('User', backref='hotel_reviews')
    booking = relationship('HotelBooking', backref='review')

    def __repr__(self):
        return f'<HotelReview {self.id} by {self.user.name} for {self.hotel.name}>'
    

class Rental(db.Model):
    __tablename__ = 'rentals'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price_per_day = db.Column(db.Float, nullable=False)
    pickup_city_id = db.Column(db.Integer, db.ForeignKey('cities.id'), nullable=False)
    drop_off_city_id = db.Column(db.Integer, db.ForeignKey('cities.id'), nullable=False)
    available_from = db.Column(db.DateTime, nullable=False)
    available_until = db.Column(db.DateTime, nullable=False)
    min_driver_age = db.Column(db.Integer, nullable=False)

    # Relationships
    pickup_city = db.relationship("City", foreign_keys=[pickup_city_id])
    drop_off_city = db.relationship("City", foreign_keys=[drop_off_city_id])

    def __repr__(self):
        return f'<Rental {self.id} - {self.name} from {self.pickup_city.city_name} to {self.drop_off_city.city_name} available from {self.available_from} to {self.available_until}>'
    


class RentalBooking(db.Model):
    __tablename__ = 'rental_bookings'

    id = db.Column(db.Integer, primary_key=True)
    rental_id = db.Column(db.Integer, db.ForeignKey('rentals.id'), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)  # Assuming user info is available
    pickup_date = db.Column(db.Date, nullable=False)
    drop_off_date = db.Column(db.Date, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    booking_date = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships
    rental = db.relationship("Rental", backref="bookings")

    def __repr__(self):
        return f'<RentalBooking {self.id} for Rental {self.rental_id}>'


class BookedRental(db.Model):
    __tablename__ = 'booked_rentals'
    id = db.Column(db.Integer, primary_key=True)
    rental_id = db.Column(db.Integer, db.ForeignKey('rentals.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pickup_date = db.Column(db.Date, nullable=False)
    pickup_time = db.Column(db.Time, nullable=False)  # Add pickup_time
    drop_off_date = db.Column(db.Date, nullable=False)
    dropoff_time = db.Column(db.Time, nullable=False)  # Add dropoff_time
    total_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    rental = db.relationship('Rental', backref=db.backref('booked_rentals', lazy=True))
    user = db.relationship('User', backref=db.backref('booked_rentals', lazy=True))