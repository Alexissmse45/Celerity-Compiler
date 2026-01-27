import React from 'react';
import CelerityLogo from '../icon/Celerity.png'; 

// Header Component
const Header = () => {
  return (
    <header className="bg-[#E8D4B8] px-8 py-6 flex items-center justify-between" style={{ height: '120px' }}>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 flex items-center justify-center">
            <img src={CelerityLogo} alt="Celerity Logo" />
        </div>
        <h1 className="text-[#E63946] text-5xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
          Celerity
        </h1>
      </div>
      <div className="grid grid-cols-3 gap-x-12 gap-y-1">
        {['Amper', 'Enriquez', 'Habana', 'Gorme', 'Tolin', 'Valdez'].map((name, i) => (
          <span key={i} className="text-[#333] text-base text-center">
            {name}
          </span>
        ))}
      </div>
    </header>
  );
};
export default Header;