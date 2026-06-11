import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HeroBanner from './components/HeroBanner';

function App() {
  return (
     <div className="app-wrapper">
      <Navbar />
      <div className="main-container">
        <Sidebar />
        <HeroBanner />
      </div>
    </div>
  );
}


export default App;