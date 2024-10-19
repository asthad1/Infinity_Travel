import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './FlightSearchForm.css';
import { airports } from '../data/airports';
import { flights } from '../data/flights'; // Import flight database
import { useNavigate } from 'react-router-dom';

function FlightSearchForm() {
 const navigate = useNavigate();
 const [departureAirport, setDepartureAirport] = useState(null);
 const [destinationAirport, setDestinationAirport] = useState(null);
 const [departureDate, setDepartureDate] = useState('');
 const [travelers, setTravelers] = useState(1);
 const [filteredFlights, setFilteredFlights] = useState([]); // To store filtered flights
 const [errorMessage, setErrorMessage] = useState(''); // To store error message
 const [minDate, setMinDate] = useState(''); // To store today's date as minDate
 const [showFilters, setShowFilters] = useState(false); // State to show/hide filters


 // Use effect to set today's date in yyyy-mm-dd format
 useEffect(() => {
   const today = new Date();
   const yyyy = today.getFullYear();
   const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
   const dd = String(today.getDate()).padStart(2, '0');
   setMinDate(`${yyyy}-${mm}-${dd}`);
 }, []);


 // Additional filter states
 const [numStops, setNumStops] = useState('');
 const [selectedAirline, setSelectedAirline] = useState('');
 const [maxPrice, setMaxPrice] = useState('');


 // Function to swap departure and destination
 const handleSwap = () => {
   const temp = departureAirport;
   setDepartureAirport(destinationAirport);
   setDestinationAirport(temp);
 };


 const handleSearch = (e) => {
   e.preventDefault();
  
   //  const apiUrl = `http://localhost/api/search/flights/${departureAirport?.value}/${destinationAirport?.value}/${departureDate.replaceAll('-', '')}/${travelers}?stops=${numStops || ''}&price_limit=${maxPrice || ''}`;


  //  try {
  //    // Dummy API request using fetch
  //    const response = fetch('http://localhost:9001/search/flights/INAP/MSAO/241111/1?stops=2&price_limit=244');
    
  //    if (!response.ok) {
  //      throw new Error('Failed to fetch flights');
  //    }
  //     const data = response.json();
    
  //    // Assuming the response contains an array of flight details
  //    setFilteredFlights(data); // Update state with the response data
  //    setErrorMessage(''); // Clear any existing error messages
  //  } catch (error) {
  //    setErrorMessage(error.message); // Show error message if request fails
  //  }


   // Get the current date and the date 6 months from now
   const currentDate = new Date();
   const maxDate = new Date();
   maxDate.setMonth(currentDate.getMonth() + 6); // Add 6 months to the current date


   // Convert the departureDate to a Date object
   const selectedDepartureDate = new Date(departureDate);


   // Validate if the selected date is within the next 6 months
   if (selectedDepartureDate > maxDate) {
     setErrorMessage('You can only search for flights up to 6 months in advance.');
     return;
   }


   // If date is valid, proceed with the search
   setErrorMessage(''); // Clear any existing error message


   // Filter flights based on search parameters and additional filters
   const results = flights.filter((flight) => {
     return (
       flight.departureAirport === departureAirport?.value &&
       flight.destinationAirport === destinationAirport?.value &&
       flight.departureTime.startsWith(departureDate) && // Matches date
       (!numStops || (numStops === '2' && flight.stops >= 2) || flight.stops === parseInt(numStops)) &&
       (!selectedAirline || flight.airline === selectedAirline) &&
       (!maxPrice || flight.price <= parseFloat(maxPrice)) &&
       flight.availableSeats >= travelers // Check if there are enough available seats
     );
   });


   setFilteredFlights(results); // Set the filtered flights
 };


 return (
   <div className="container mt-5">
     <h2 className="mb-4">Search Flights</h2>
     <form onSubmit={handleSearch}>
       {/* Search Parameters */}
       <div className="row g-3">
         <div className="col-md-6 col-lg-3 position-relative">
           <label htmlFor="departureAirport" className="form-label">
             <i className="fas fa-map-marker-alt me-2"></i> Leaving from
           </label>
           <Select
             options={airports}
             value={departureAirport}
             onChange={(option) => setDepartureAirport(option)}
             placeholder="Select Departure"
             isClearable={true}
           />
         </div>


         {/* Swap Button */}
         <div className="col-md-auto d-flex align-items-end">
           <button
             type="button"
             className="btn btn-outline-primary swap-button"
             onClick={handleSwap}
             style={{ height: '40px' }} // Adjust the height to match the input fields
           >
             <i className="fas fa-exchange-alt"></i> {/* Swap arrows icon */}
           </button>
         </div>


         <div className="col-md-6 col-lg-3 position-relative">
           <label htmlFor="destinationAirport" className="form-label">
             <i className="fas fa-map-marker-alt me-2"></i> Going to
           </label>
           <Select
             options={airports}
             value={destinationAirport}
             onChange={(option) => setDestinationAirport(option)}
             placeholder="Select Destination"
             isClearable={true}
           />
         </div>


         <div className="col-md-6 col-lg-3">
           <label htmlFor="departureDate" className="form-label">
             Departure Date
           </label>
           <input
             type="date"
             className="form-control"
             value={departureDate}
             onChange={(e) => setDepartureDate(e.target.value)}
             min={minDate}  // Set the minimum date to today's date
             required
           />
         </div>


         <div className="col-md-6 col-lg-2 d-flex align-items-end">
           <div className="w-75">
             <label htmlFor="travelers" className="form-label">
               Travelers
             </label>
             <input
               type="number"
               className="form-control travelers-input"
               value={travelers}
               onChange={(e) => setTravelers(e.target.value)}
               min="1"
               max="10"
               required
             />
           </div>
           <button
             type="button"
             className="btn btn-outline-primary ms-3"
             onClick={() => setShowFilters((prev) => !prev)}
             style={{ height: '40px' }} // Adjust the height to match the input field
           >
             Filter <i className= "fas fa-filter"></i> {/* Filter icon */}
           </button>
         </div>
       </div>


       {/* Additional Filters Section */}
       {showFilters && (
         <div className="row g-3 align-items-center mt-4">
           <div className="col-sm-4 col-lg-2">
           <label htmlFor="numStops" className="form-label">
   Stops
   <i className="fa-solid fa-hand" style={{ display: 'block', marginTop: '5px' }}></i>
   <span className="optional" style={{ display: 'block', marginTop: '5px' }}>(Optional)</span>
</label>


             <select
               className="form-control filter-input"
               value={numStops}
               onChange={(e) => setNumStops(e.target.value)}
             >
               <option value="">Any</option>
               <option value="0">Non-stop</option>
               <option value="1">1 Stop</option>
               <option value="2">2+ Stops</option>
             </select>
           </div>


           <div className="col-sm-4 col-lg-2">
           <label htmlFor="airline" className="form-label">
   Airline <i className="fa-solid fa-plane" style={{ marginLeft: '5px', verticalAlign: 'middle' }}></i>
   <span className="optional" style={{ display: 'block', marginTop: '5px' }}>(Optional)</span>
</label>


             <select
               className="form-control filter-input"
               value={selectedAirline}
               onChange={(e) => setSelectedAirline(e.target.value)}
             >
               <option value="">Any</option>
               {[...new Set(flights.map((flight) => flight.airline))].map((airline) => (
                 <option key={airline} value={airline}>
                   {airline}
                 </option>
               ))}
             </select>
           </div>


           <div className="col-sm-4 col-lg-2">
           <label htmlFor="maxPrice" className="form-label">
   Max
   <i className="fa-solid fa-dollar-sign" style={{ display: 'block', marginTop: '5px' }}></i>
   <span className="optional" style={{ display: 'block', marginTop: '5px' }}>(Optional)</span>
</label>


             <input
               type="number"
               className="form-control filter-input"
               value={maxPrice}
               onChange={(e) => setMaxPrice(e.target.value)}
               min="0"
             />
           </div>
         </div>
       )}


       {/* Search Button */}
       <div className="row mt-4">
         <div className="col text-start">
           <button type="submit" className="btn btn-primary btn-lg" onClick={handleSearch}>
             Search Flights
         </button>
         </div>
       </div>
     </form>


     {/* Display error message */}
     {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}


     {/* Display filtered flights */}
     <div className="mt-5">
       {filteredFlights.length > 0 ? (
         <div>
           <h3>Available Flights:</h3>
           <ul className="list-group">
             {filteredFlights.map((flight, index) => (
               <li key={index} className="list-group-item">
                 <strong>{flight.airline}</strong> | Flight {flight.flightNumber}
                 <br />
                 Departure: {flight.departureTime} | Arrival: {flight.arrivalTime}
                 <br />
                 Duration: {flight.duration} | Price: ${flight.price}
                 <br />
                 Number of Stops: {flight.stops} | Available Seats: {flight.availableSeats}
                 <br />
                 Number of Travelers: {travelers}
                 <br />
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => navigate('/checkout', { state: { flight, travelers  } })}
                >
                  Purchase Flight
                </button>
               </li>
             ))}
           </ul>
         </div>
       ) : (
         <h3>No flights found for the selected criteria</h3>
       )}
     </div>
   </div>
 );
}


export default FlightSearchForm;
