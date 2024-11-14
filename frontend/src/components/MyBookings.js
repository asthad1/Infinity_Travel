import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { 
  setDepartureAirport, 
  setDestinationAirport,
  setTravelers,
  setDepartureDate
} from '../store/searchSlice';
import { setFilteredFlights, setErrorMessage } from '../store/flightsSlice';
import { createEmailContent } from './emailTemplate';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState({ past: [], future: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('future');
  const [activeSearch, setActiveSearch] = useState(null);
  const [searchInProgress, setSearchInProgress] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.user_id) {
        setError('Please log in to view your bookings');
        return;
      }

      const response = await axios.get(`http://localhost:9001/api/combined-bookings/${user.user_id}`);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const pastBookings = [];
      const futureBookings = [];

      response.data.forEach(booking => {
        const startDate = new Date(booking.start_date);
        if (startDate < today) {
          pastBookings.push(booking);
        } else {
          futureBookings.push(booking);
        }
      });

      setBookings({
        past: pastBookings.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)),
        future: futureBookings.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      });
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSimilar = async (booking) => {
    setSearchInProgress(true);
    setActiveSearch(booking.id);

    try {
      switch (booking.type) {
        case 'flight':
          await handleFlightSearch(booking);
          break;
        case 'hotel':
          handleHotelSearch(booking);
          break;
        case 'rental':
          handleCarSearch(booking);
          break;
      }
    } catch (err) {
      console.error('Error executing search:', err);
      setError('Failed to execute search');
    } finally {
      setSearchInProgress(false);
      setActiveSearch(null);
    }
  };

  const handleFlightSearch = async (booking) => {
    dispatch(setDepartureAirport({ value: booking.details.from, label: booking.details.from }));
    dispatch(setDestinationAirport({ value: booking.details.to, label: booking.details.to }));
    dispatch(setTravelers(booking.details.travelers));
  
    const searchCriteria = {
      departureAirport: booking.details.from,
      destinationAirport: booking.details.to,
      numTravellers: booking.details.travelers
    };
  
    try {
      const response = await axios.post('http://localhost:9001/api/flights/search', searchCriteria);
  
      if (response.data.departureFlights.length === 0) {
        dispatch(setErrorMessage('No flights found for these criteria.'));
      } else {
        dispatch(setFilteredFlights(response.data.departureFlights));
        dispatch(setErrorMessage(''));
      }
  
      window.location.href = '/'; // Navigate to the home page with the search results
    } catch (error) {
      console.error('Error during flight search:', error);
      throw error;
    }
  };

  const handleHotelSearch = (booking) => {
    const searchParams = {
      city: booking.details.city,
      guests: booking.details.num_guests,
      rooms: booking.details.room_count
    };
    window.location.href = `/hotels?${new URLSearchParams(searchParams)}`;
  };

  const handleCarSearch = (booking) => {
    const searchParams = {
      pickup: booking.details.pickup_location,
      dropoff: booking.details.dropoff_location,
      pickupTime: booking.details.pickup_time,
      dropoffTime: booking.details.dropoff_time
    };
    window.location.href = `/cars?${new URLSearchParams(searchParams)}`;
  };

  const handleShare = () => {
    const activeBookings = bookings[activeTab] || [];
    const selectedItems = activeBookings.filter(booking =>
      selectedBookings.includes(`${booking.type}-${booking.id}`)
    );

    const emailContent = createEmailContent(selectedItems);
    const subject = "My Travel Itinerary";
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`;
    window.location.href = mailtoLink;
  };

  const toggleBooking = (bookingId, type) => {
    const key = `${type}-${bookingId}`;
    setSelectedBookings(prev =>
      prev.includes(key) ? prev.filter(id => id !== key) : [...prev, key]
    );
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const renderSearchButton = (booking) => (
    <button
      onClick={() => handleSearchSimilar(booking)}
      disabled={searchInProgress || activeSearch === booking.id}
      className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 
                 transition-colors duration-200 flex items-center gap-2 min-w-[120px] justify-center"
    >
      {activeSearch === booking.id ? (
        <>
          <span className="spinner-border spinner-border-sm me-2"></span>
          Searching...
        </>
      ) : (
        `Search Similar ${booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}`
      )}
    </button>
  );

  const renderBookingDetails = (booking) => {
    switch (booking.type) {
      case 'flight':
        return (
          <div className="flex justify-between items-center">
            <div>
              <p>Duration: {booking.details.duration}</p>
              <p>Travelers: {booking.details.travelers}</p>
            </div>
            {renderSearchButton(booking)}
          </div>
        );
      case 'hotel':
        return (
          <div className="flex justify-between items-center">
            <div>
              <p>Guests: {booking.details.num_guests}</p>
              <p>Rooms: {booking.details.room_count}</p>
              <p>Status: {booking.details.status}</p>
            </div>
            {renderSearchButton(booking)}
          </div>
        );
      case 'rental':
        return (
          <div className="flex justify-between items-center">
            <div>
              <p>Pickup: {booking.details.pickup_time}</p>
              <p>Drop-off: {booking.details.dropoff_time}</p>
            </div>
            {renderSearchButton(booking)}
          </div>
        );
      default:
        return null;
    }
  };

  const renderBookings = (bookingsList) => {
    if (!bookingsList || bookingsList.length === 0) {
      return <div className="text-center p-4 text-gray-500">No bookings found</div>;
    }

    const groupedBookings = bookingsList.reduce((acc, booking) => {
      const date = booking.start_date.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(booking);
      return acc;
    }, {});

    return Object.entries(groupedBookings).map(([date, dayBookings]) => (
      <div key={date} className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{formatDate(date)}</h2>
        <div className="space-y-3">
          {dayBookings.map(booking => (
            <div
              key={`${booking.type}-${booking.id}`}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(`${booking.type}-${booking.id}`)}
                    onChange={() => toggleBooking(booking.id, booking.type)}
                    className="w-4 h-4"
                  />
                  <span className="text-2xl">
                    {booking.type === 'flight' && '✈️'}
                    {booking.type === 'hotel' && '🏨'}
                    {booking.type === 'rental' && '🚗'}
                  </span>
                  <div>
                    <h3 className="font-medium">{booking.name}</h3>
                    {booking.type === 'flight' && (
                      <p className="text-sm text-gray-600">
                        {booking.details.from} → {booking.details.to}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold mb-2">${booking.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-2 ml-10">
                {renderBookingDetails(booking)}
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Travel Itinerary</h1>
        {selectedBookings.length > 0 && (
          <button
            onClick={handleShare}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full
                     flex items-center gap-2 transition-all duration-300 shadow hover:shadow-lg"
          >
            <span className="bg-white text-blue-500 rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {selectedBookings.length}
            </span>
            <span className="font-medium">Share Selected</span>
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-6 py-2 font-medium ${
              activeTab === 'future'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('future')}
          >
            My Future Trips
          </button>
          <button
            className={`px-6 py-2 font-medium ${
              activeTab === 'past'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('past')}
          >
            My Past Trips
          </button>
        </div>
      </div>

      {renderBookings(bookings[activeTab])}
    </div>
  );
};

export default MyBookings;