import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FlightSearchForm from '../components/FlightSearchForm';
import FlightSearchResults from '../components/FlightSearchResults';
import { fetchFlights, setErrorMessage } from '../store/flightsSlice'; // Import fetchFlights

const FlightSearches = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.flights.loading);
  const errorMessage = useSelector((state) => state.flights.errorMessage);

  // Fetch flights when the component mounts
  useEffect(() => {
    dispatch(fetchFlights()); // Fetch flights using the thunk
  }, [dispatch]);

  return (
    <div className="container my-5">
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <FlightSearchForm />
          {errorMessage && <div className="alert alert-danger mt-4">{errorMessage}</div>}
          <FlightSearchResults />
        </>
      )}
    </div>
  );
};

export default FlightSearches;
