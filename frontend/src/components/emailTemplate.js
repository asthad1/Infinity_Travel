export const createEmailContent = (bookings) => {
    if (!bookings || bookings.length === 0) return '';
  
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    };
  
    const formatTime = (timeString) => {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };
  
    let emailContent = 'My Travel Itinerary\n\n';
  
    // Group bookings by date
    const groupedBookings = bookings.reduce((acc, booking) => {
      const date = booking.start_date.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(booking);
      return acc;
    }, {});
  
    // Sort dates and create content
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
              emailContent += `Pickup: ${booking.details.pickup_time}\n`;
              emailContent += `Drop-off: ${booking.details.dropoff_time}\n`;
              emailContent += `Price: $${booking.price.toFixed(2)}\n`;
              break;
          }
          emailContent += '\n';
        });
        emailContent += '\n';
      });
  
    return emailContent;
  };