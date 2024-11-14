import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createEmailContent } from './emailTemplate';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState({ past: [], future: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('future');

  useEffect(() => {
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

        // Sort bookings into past and future
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

    fetchBookings();
  }, []);

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

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  const renderBookings = (bookingsList) => {
    if (!bookingsList || bookingsList.length === 0) {
      return <div className="text-center p-4 text-gray-500">No bookings found</div>;
    }

    // Group bookings by date
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
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedBookings.includes(`${booking.type}-${booking.id}`)}
                  onChange={() => toggleBooking(booking.id, booking.type)}
                  className="w-4 h-4"
                />

                {booking.type === 'flight' && '✈️'}
                {booking.type === 'hotel' && '🏨'}
                {booking.type === 'rental' && '🚗'}

                <div className="flex-grow">
                  <h3 className="font-medium">{booking.name}</h3>
                  {booking.type === 'flight' && (
                    <p className="text-sm text-gray-600">
                      {booking.details.from} → {booking.details.to}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-bold">${booking.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-2 ml-10 text-sm text-gray-600">
                {booking.type === 'flight' && (
                  <>
                    <p>Duration: {booking.details.duration}</p>
                    <p>Travelers: {booking.details.travelers}</p>
                  </>
                )}
                {booking.type === 'hotel' && (
                  <>
                    <p>Guests: {booking.details.num_guests}</p>
                    <p>Rooms: {booking.details.room_count}</p>
                    <p>Status: {booking.details.status}</p>
                  </>
                )}
                {booking.type === 'rental' && (
                  <>
                    <p>Pickup: {booking.details.pickup_time}</p>
                    <p>Drop-off: {booking.details.dropoff_time}</p>
                  </>
                )}
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