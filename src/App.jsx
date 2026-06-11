import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HeroBanner from './components/HeroBanner';

function App() {
  return (
     <div>
      <Navbar />
      <div style={{
        display: 'flex',        
        flexDirection: 'row',   
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <Sidebar />
        <HeroBanner />
      </div>
    </div>
  );
}

export default App;