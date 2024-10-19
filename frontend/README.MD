# Frontend Folder - ReadMe

Welcome to the Frontend of this travel web application! The frontend is built using React, Redux, and React Bootstrap for UI, and Docker for containerization. This document will provide you with the basic understanding needed to continue development on the frontend.

## Project Overview

The frontend folder structure is as follows:

```
frontend
├── Dockerfile
├── package-lock.json
├── package.json
├── public
│   └── index.html
└── src
    ├── App.js
    ├── assets
    │   └── images
    │       ├── airlines
    │       │   ├── air-france.jpg
    │       │   ├── american-airlines.png
    │       │   ├── british.png
    │       │   ├── cathay.jpg
    │       │   ├── default-logo.png
    │       │   ├── delta.png
    │       │   ├── emirates.png
    │       │   ├── lufthansa.png
    │       │   ├── qatar.jpg
    │       │   ├── singapore.png
    │       │   └── united.png
    │       └── ladyonboat.jpg
    ├── components
    │   ├── FlightFilter.css
    │   ├── FlightFilter.js
    │   ├── FlightSearchForm.css
    │   ├── FlightSearchForm.js
    │   ├── FlightSearchResults.css
    │   ├── FlightSearchResults.js
    │   ├── Footer.css
    │   ├── Footer.js
    │   ├── Login.js
    │   ├── MyFlights.css
    │   ├── MyFlights.js
    │   ├── Navbar.css
    │   ├── Navbar.js
    │   ├── Register.js
    │   ├── SavedFlights.js
    │   ├── SharedFlightDetails.js
    │   └── Welcome.js
    ├── data
    │   ├── airports.js
    │   └── flights.js
    ├── index.js
    ├── pages
    │   ├── FlightSearches.js
    │   ├── Home.css
    │   ├── Home.js
    │   ├── Support.css
    │   └── Support.js
    └── store
        ├── flightsSlice.js
        ├── searchSlice.js
        ├── store.js
        └── userSlice.js
```

## Key Components and Files

### 1. **App.js**
   - This is the root component of the frontend application. It contains the main routing logic for navigating between different pages of the site.

### 2. **Components**
   - **Navbar.js**: Navigation bar for easy movement between different pages.
   - **FlightSearchForm.js**: Handles the flight search input from users.
   - **FlightSearchResults.js**: Displays the flight search results using Bootstrap cards.
   - **MyFlights.js**: Shows the saved flights with sharing options. Here, users can save their searches and share them using a link.
   - **Login.js / Register.js**: Handle user authentication.
   - **Footer.js**: Displays the footer of the website.

### 3. **Images**
   - Located in `src/assets/images/airlines` directory, images for different airlines are used to make the UI more visually appealing.

### 4. **Pages**
   - **Home.js**: This is the landing page for the application.
   - **FlightSearches.js**: Displays detailed flight search options.
   - **Support.js**: A page dedicated to customer support.

### 5. **Redux Store**
   - The global state management is handled using Redux.
   - **store.js**: Configures and creates the Redux store.
   - **flightsSlice.js, searchSlice.js, userSlice.js**: Each of these files contains a slice of the global store for flights, search parameters, and user-related data respectively.

### 6. **CSS Files**
   - All the styling is located in corresponding CSS files in the `components` and `pages` folders. This makes sure each component/page is styled individually and is easy to maintain.

## Development Guidelines

1. **Component-based Architecture**: Follow the React component architecture to ensure modular and reusable components.

2. **Bootstrap and FontAwesome**: The project uses Bootstrap and FontAwesome for styling and icons. Make sure to use these libraries consistently across the UI to ensure a cohesive look and feel.

3. **Redux**: When you need to manage state across components, use the existing Redux slices or create a new slice if appropriate. Always ensure that state management follows a logical flow.

4. **Image Usage**: When adding new airline logos or images, place them in `src/assets/images/airlines`. This helps keep the project organized and all assets in a consistent place.

## Key Features to Implement or Improve

1. **My Flights Page Enhancements**: This page allows users to save and share their flight searches. It could be improved by adding more visual feedback for the user, such as a loading state or animations when sharing.

2. **Improve Error Handling**: The app currently displays error messages for searches that don’t return results. Look into improving the user experience by adding more detailed explanations or suggestions when errors occur.
