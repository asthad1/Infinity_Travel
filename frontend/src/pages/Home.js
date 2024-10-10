import React from 'react';
import './Home.css';  // Import styles

const Home = () => {
  return (
    <div className="home">
      <div className="hero">
        <h1>Find Your Next Adventure</h1>
        <div className="search-bar">
          <input type="text" placeholder="From" />
          <input type="text" placeholder="To" />
          <input type="date" />
          <button>Search</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
