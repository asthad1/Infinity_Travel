import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import bmwImage from '../assets/images/rentals/BMW.jpg';
import chevyImage from '../assets/images/rentals/Chevy-tahoe.jpg';
import ferrariImage from '../assets/images/rentals/Ferrari.jpg';
import fordEscapeImage from '../assets/images/rentals/Ford-escpae.jpg';
import hondaCivicImage from '../assets/images/rentals/Honda-civic.jpg';
import lamborghiniImage from '../assets/images/rentals/Lamborghini.jpg';
import nissanImage from '../assets/images/rentals/Nissan.jpg';
import teslaImage from '../assets/images/rentals/Tesla.jpg';
import toyotaImage from '../assets/images/rentals/toyota.jpg';
import hotel1 from '../assets/images/hotels/hotel-1.webp';
import hotel2 from '../assets/images/hotels/hotel-2.jpg';
import hotel3 from '../assets/images/hotels/hotel-3.jpg';
import hotel4 from '../assets/images/hotels/hotel-4.jpg';

const hotelImages = [hotel1, hotel2, hotel3, hotel4];

const imageMap = {
  'BMW 3 Series': bmwImage,
  'Chevrolet Tahoe': chevyImage,
  'Ferrari Portofino': ferrariImage,
  'Ford Escape': fordEscapeImage,
  'Honda Civic': hondaCivicImage,
  'Lamborghini Huracan': lamborghiniImage,
  'Nissan Altima': nissanImage,
  'Tesla Model S': teslaImage,
  'Toyota Corolla': toyotaImage,
};

const cityIdMap = {
  'Lake Thomasfort': 1,
  'Jamesmouth': 2,
  'Henryview': 3,
  'Murrayton': 4,
  'South Virginiamouth': 5,
  'East Keithborough': 6,
  'Allenview': 7,
  'Toddton': 8,
  'East Clinton': 9,
  'Lake Christopher': 10,
  'Los Angeles': 11,
  'New York': 12,
  'Chicago': 13,
  'San Francisco': 14,
  'Dallas': 15,
  'Miami': 16,
  'Toronto': 17,
  'Vancouver': 18,
  'Mexico City': 19,
  'Denver': 20,
  'Atlanta': 21,
  'Seattle': 22,
  'London': 23,
  'Paris': 24,
  'Frankfurt': 25,
  'Amsterdam': 26,
  'Zurich': 27,
  'Madrid': 28,
  'Rome': 29,
  'Barcelona': 30,
  'Munich': 31,
  'Istanbul': 32,
  'Vienna': 33,
  'Beijing': 34,
  'Shanghai': 35,
  'Tokyo': 36,
  'Singapore': 37,
  'Hong Kong': 38,
  'Seoul': 39,
  'Bangkok': 40,
  'Delhi': 41,
  'Mumbai': 42,
  'Kuala Lumpur': 43,
  'São Paulo': 44,
  'Bogotá': 45,
  'Buenos Aires': 46,
  'Lima': 47,
  'Rio de Janeiro': 48,
  'Santiago': 49,
  'Dubai': 50,
  'Abu Dhabi': 51,
  'Doha': 52,
  'Riyadh': 53,
  'Jeddah': 54,
  'Tel Aviv': 55,
  'Johannesburg': 56,
  'Cairo': 57,
  'Lagos': 58,
  'Casablanca': 59,
  'Nairobi': 60,
  'Cape Town': 61,
  'Sydney': 62,
  'Melbourne': 63,
  'Auckland': 64,
  'Brisbane': 65,
  'Perth': 66,
  'Nadi': 67,
};

const airportCityMap = {
  'LAX': 'Los Angeles',
  'JFK': 'New York',
  'ORD': 'Chicago',
  'SFO': 'San Francisco',
  'DFW': 'Dallas',
  'MIA': 'Miami',
  'YYZ': 'Toronto',
  'YVR': 'Vancouver',
  'MEX': 'Mexico City',
  'DEN': 'Denver',
  'ATL': 'Atlanta',
  'SEA': 'Seattle',
  'LHR': 'London',
  'CDG': 'Paris',
  'FRA': 'Frankfurt',
  'AMS': 'Amsterdam',
  'ZRH': 'Zurich',
  'MAD': 'Madrid',
  'FCO': 'Rome',
  'BCN': 'Barcelona',
  'MUC': 'Munich',
  'IST': 'Istanbul',
  'VIE': 'Vienna',
  'PEK': 'Beijing',
  'PVG': 'Shanghai',
  'HND': 'Tokyo',
  'NRT': 'Tokyo',
  'SIN': 'Singapore',
  'HKG': 'Hong Kong',
  'ICN': 'Seoul',
  'BKK': 'Bangkok',
  'DEL': 'Delhi',
  'BOM': 'Mumbai',
  'KUL': 'Kuala Lumpur',
  'GRU': 'São Paulo',
  'BOG': 'Bogotá',
  'EZE': 'Buenos Aires',
  'LIM': 'Lima',
  'GIG': 'Rio de Janeiro',
  'SCL': 'Santiago',
  'DXB': 'Dubai',
  'AUH': 'Abu Dhabi',
  'DOH': 'Doha',
  'RUH': 'Riyadh',
  'JED': 'Jeddah',
  'TLV': 'Tel Aviv',
  'JNB': 'Johannesburg',
  'CAI': 'Cairo',
  'LOS': 'Lagos',
  'CMN': 'Casablanca',
  'NBO': 'Nairobi',
  'CPT': 'Cape Town',
  'SYD': 'Sydney',
  'MEL': 'Melbourne',
  'AKL': 'Auckland',
  'BNE': 'Brisbane',
  'PER': 'Perth',
  'NAN': 'Nadi',
};

const getCityIdByName = (cityName) => {
  return cityIdMap[cityName] || null; // If city name doesn't exist, return null
};


function Ad() {
  const [flights, setFlights] = useState([]);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [cityName, setCityName] = useState('');  // State for storing city name
  const [hotelIds, setHotelIds] = useState([]);
  const [randomCar, setRandomCar] = useState(null);
  const [flightCity, setFlightCity] = useState('');
  const [flightCity2, setFlightCity2] = useState('');
  const [carImage, setCarImage] = useState(null);
  const [randomCar2, setRandomCar2] = useState(null);
  const [carImage2, setCarImage2] = useState(null);
  const [randomFlight, setRandomFlight] = useState(null); // New state for the random flight
  const [randomHotel, setRandomHotel] = useState(null);
  const [hotelName, setHotelName] = useState('');
  const [randomHotelImage, setRandomHotelImage] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  // useRef to track if the effect has already run
  const hasFetched = useRef(false);

  const hasFetchedHotel = useRef(false);

  useEffect(() => {
    if (user?.user_id && !hasFetched.current) {
      hasFetched.current = true;

      // Fetch flights
      const fetchFlights = async () => {
        try {
          const response = await axios.get('http://localhost:9001/api/booked_flights', {
            params: { user_id: user?.user_id },
          });
          setFlights(response.data);
          // Pick a random flight from the fetched flights
          if (response.data.length > 0) {
            const randomFlight = response.data[Math.floor(Math.random() * response.data.length)];
            setRandomFlight(randomFlight);  // Set the random flight
            const flightCity = randomFlight ? airportCityMap[randomFlight.destination_airport] : null;
            const flightCity2 = randomFlight ? airportCityMap[randomFlight.destination_airport] : null;
            setFlightCity(flightCity);
            setFlightCity2(flightCity2);
            const flightCityId = getCityIdByName(flightCity);
            console.log("flight city id:", flightCityId)
            fetchHotelName(flightCityId);
            console.log("random hotel:", randomHotel);
            hasFetchedHotel.current = true;
            console.log(randomFlight);
          }
        } catch (error) {
          console.error('Error fetching booked flights:', error.response || error);
        }
      };

      fetchFlights();

      // Fetch hotel bookings and hotel info
      const fetchHotelBookings = async () => {
        try {
          const response = await axios.get(`http://localhost:9001/api/hotel-bookings/${user?.user_id}`);
          const hotelData = response.data;

          // Extract hotel IDs from the bookings
          const hotelIds = hotelData.map((booking) => booking.hotel_id);
          setHotelIds(hotelIds);

          // Pick a random hotel ID from the list of IDs
          if (hotelIds.length > 0) {
            const randomHotelId = hotelIds[Math.floor(Math.random() * hotelIds.length)];
            fetchHotelDetails(randomHotelId);  // Fetch details for the random hotel ID
          }
        } catch (error) {
          console.error('Error fetching hotel bookings:', error.response || error);
        }
      };

      // Fetch hotel details
      const fetchHotelDetails = async (hotelId) => {
        try {
          const response = await axios.get(`http://localhost:9001/api/hotels/${hotelId}`);
          setHotelInfo(response.data);

          // Fetch the city name based on the city_id
          fetchCityName(response.data.city_id);
        } catch (error) {
          console.error('Error fetching hotel info:', error.response || error);
        }
      };


 
      const fetchHotelName = async (flightCityId) => {
        try {
          const randomDaysInFuture = Math.floor(Math.random() * 30) + 1;
          const checkInDate = new Date();
          checkInDate.setDate(checkInDate.getDate() + randomDaysInFuture);
          const randomStayDuration = Math.floor(Math.random() * 7) + 1;
          const checkOutDate = new Date(checkInDate);
          checkOutDate.setDate(checkInDate.getDate() + randomStayDuration);
    
          const checkIn = checkInDate.toISOString().split('T')[0];
          const checkOut = checkOutDate.toISOString().split('T')[0];
    
          const response = await axios.post('http://localhost:9001/api/hotels/search', {
            city_id: flightCityId,
            check_in: checkIn,
            check_out: checkOut,
            guests: 1
          });
    
          const randomHotel = response.data[Math.floor(Math.random() * response.data.length)];
          setRandomHotel(randomHotel);
          setHotelName(randomHotel.name);
          console.log(randomHotel.name);
          console.log("random hotel2:", randomHotel);
        } catch (error) {
          console.error('Error searching hotels:', error);
        }
      };
    
     
 


      // Fetch city name by city_id
      const fetchCityName = async (cityId) => {
        try {
          const response = await axios.get(`http://localhost:9001/api/cities/${cityId}`);
          setCityName(response.data.city_name);
        } catch (error) {
          console.error('Error fetching city info:', error.response || error);
        }
      };

      // Fetch hotel bookings
      fetchHotelBookings();
    }
  }, [user]);

  useEffect(() => {
    // Pick a random car from the imageMap
    const carNames = Object.keys(imageMap);
    const randomCarName = carNames[Math.floor(Math.random() * carNames.length)];
    const randomCarImage = imageMap[randomCarName];

    const randomCarName2 = carNames[Math.floor(Math.random() * carNames.length)];
    const randomCarImage2 = imageMap[randomCarName2];

    const randomHotelImage = hotelImages[Math.floor(Math.random() * hotelImages.length)];
    setRandomHotelImage(randomHotelImage);

    setRandomCar(randomCarName);
    setCarImage(randomCarImage);

    setRandomCar2(randomCarName2);
    setCarImage2(randomCarImage2);
  }, []);  // This effect runs only once


    

  return (
    <div style={styles.container}>
      {randomCar2 && carImage2 && flightCity2 && (
        <div style={styles.horizontalAd}>
          <div style={styles.adText}>
            <h3>Drive a {randomCar2} in {flightCity2}!</h3>
            <p>Book your rental car today!</p>
          </div>
          <img src={carImage2} alt={randomCar2} style={styles.carImage2} />
        </div>
      )}

        {hotelName && randomHotelImage && flightCity && (
        <div style={styles.horizontalAd}>
          <div style={styles.adText}>
            <h3>Stay at {hotelName} in {flightCity}!</h3>
            <p>Book your hotel today!</p>
          </div>
          <img src={randomHotelImage} alt={randomHotelImage} style={styles.carImage2} />
        </div>
      )}

      {/* Car Rental Ad - Horizontal Rectangle */}
      {randomCar && carImage && cityName && (
        <div style={styles.horizontalAd}>
          <div style={styles.adText}>
            <h3>Drive a {randomCar} in {cityName}!</h3>
            <p>Book your rental car today!</p>
          </div>
          <img src={carImage} alt={randomCar} style={styles.carImage} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rectangle: {
    padding: '15px',
    border: '2px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '300px',
    backgroundColor: '#f9f9f9',
  },
  // New styles for horizontal rectangle ad
  horizontalAd: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '20px',
    border: '2px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    height: '200px',  // Fixed height for the horizontal rectangle
  },
  adText: {
    flex: 1,
    paddingRight: '20px',
    textAlign: 'left',
  },
  carImage: {
    width: '120px',
    height: 'auto',
    borderRadius: '8px',
  },
  carImage2: {
    width: '120px',
    height: 'auto',
    borderRadius: '8px',
  },
};

export default Ad;
