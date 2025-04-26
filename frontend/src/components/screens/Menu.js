import React from 'react';
import menu1 from '../../menuImg/menu_1.jpg'; 
import menu2 from '../../menuImg/menu_2.jpg'; 
import './Menu.css';

const Menu = () => {
  return (
    <div className="menu-container">
      <h1 className="text-center my-4">Our Menu</h1>
      <div className="menu-photos">
        <div className="menu-photo-container">
          <img 
            src={menu1} // Use the imported image
            alt="Restaurant Menu Page 1" 
            className="menu-photo img-fluid"
          />
        </div>
        <div className="menu-photo-container">
          <img 
            src={menu2} // Use the imported image
            alt="Restaurant Menu Page 2" 
            className="menu-photo img-fluid"
          />
        </div>
      </div>
    </div>
  );
}

export default Menu;