import React from 'react';
import { Link } from 'react-router-dom';

const CarCard = ({ car, onRent }) => {
  const {
    id,
    name,
    brand,
    model,
    year,
    pricePerDay,
    image,
    category,
    seats,
    fuelType,
    transmission,
    available
  } = car;

  const handleRentClick = () => {
    if (onRent) {
      onRent(car);
    }
  };

  // Format price with Philippine Peso symbol
  const formattedPrice = pricePerDay ? `₱${pricePerDay.toLocaleString()}/day` : '₱0/day';

  return (
    <div className={`car-card-landing ${!available ? 'unavailable' : ''}`}>
      <div className="car-image-landing">
        <img 
          src={image || '/assets/images/car1.jpg'} 
          alt={`${brand} ${name}`}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Car+Image';
          }}
        />
      </div>

      <h3 className="car-name-landing">{name}</h3>

      <p className="price-landing">{formattedPrice}</p>

      <button 
        className="btn-view-details" 
        onClick={handleRentClick}
        disabled={!available}
      >
        {available ? 'View Details' : 'Not Available'}
      </button>
    </div>
  );
};

export default CarCard;

