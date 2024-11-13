export const createEmailContent = (bookings) => {
  if (!bookings || bookings.length === 0) return '';

  const formatDate = (dateString) => {
    const options = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'  // Add UTC timezone handling
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'  // Add UTC timezone handling
      });
    } catch (error) {
      // Handle cases where timeString might be in HH:MM format
      try {
        const date = new Date(`2000-01-01T${timeString}`);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC'
        });
      } catch {
        return timeString; // Return original if parsing fails
      }
    }
  };

  let emailContent = 'My Travel Itinerary\n\n';

  // Group bookings by date using UTC dates
  const groupedBookings = bookings.reduce((acc, booking) => {
    // Create UTC date from start_date
    const bookingDate = new Date(booking.start_date);
    bookingDate.setUTCHours(0, 0, 0, 0);
    const date = bookingDate.toISOString().split('T')[0];
    
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {});

  // Sort dates in UTC and create content
  Object.keys(groupedBookings)
    .sort((a, b) => new Date(a) - new Date(b))
    .forEach(date => {
      emailContent += `${formatDate(date)}\n`;
      emailContent += '------------------------\n';

      groupedBookings[date].forEach(booking => {
        switch (booking.type) {
          case 'flight':
            emailContent += `✈️ ${booking.name}\n`;
            emailContent += `From: ${booking.details.from} To: ${booking.details.to}\n`;
            emailContent += `Duration: ${booking.details.duration}\n`;
            emailContent += `Travelers: ${booking.details.travelers}\n`;
            emailContent += `Price: $${booking.price.toFixed(2)}\n`;
            break;

          case 'hotel':
            emailContent += `🏨 ${booking.name}\n`;
            emailContent += `Guests: ${booking.details.num_guests}\n`;
            emailContent += `Rooms: ${booking.details.room_count}\n`;
            emailContent += `Status: ${booking.details.status}\n`;
            emailContent += `Price: $${booking.price.toFixed(2)}\n`;
            break;

          case 'rental':
            emailContent += `🚗 ${booking.name}\n`;
            emailContent += `Pickup: ${formatTime(booking.details.pickup_time)}\n`;
            emailContent += `Drop-off: ${formatTime(booking.details.dropoff_time)}\n`;
            emailContent += `Price: $${booking.price.toFixed(2)}\n`;
            break;
        }
        emailContent += '\n';
      });
      emailContent += '\n';
    });

  return emailContent;
};