'use client';

import React from 'react';
import HotelDetails from '@/components/hotels/payment/HotelDetails';
import ReservationSummary from '@/components/hotels/payment/ReservationSummary';

const HotelPage = () => {
  const hotelData = {
    hotelName: 'Shikara Hotel',
    description:
      'King bed stylish Apartment',
    details:
      'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    goodToKnow:
      'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    location: '329 Calle santos, paseo colón, San José',
    coordinates: [9.9281, -84.0907] as [number, number],
    rating: 5.0,
    beds: 2,
    baths: 1,
    price: 40.18,
    tax: 10.5,
    checkIn: new Date('2025-07-14'),
    checkOut: new Date('2025-08-02'),
    imageUrl: '/img/room2.png',
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="w-full px-4 md:px-10 py-8 mt-10">
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
          <div className="flex-grow">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <HotelDetails
                hotelName={hotelData.hotelName}
                description={hotelData.description}
                details={hotelData.details}
                goodToKnow={hotelData.goodToKnow}
                location={hotelData.location}
                coordinates={hotelData.coordinates}
                rating={hotelData.rating}
                beds={hotelData.beds}
                baths={hotelData.baths}
                imageUrl={hotelData.imageUrl}
              />
            </div>
          </div>
          <div className="w-full md:w-[400px] shrink-0">
            <ReservationSummary
              hotelName={hotelData.hotelName}
              description={hotelData.description}
              price={hotelData.price}
              tax={hotelData.tax}
              checkIn={hotelData.checkIn}
              checkOut={hotelData.checkOut}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelPage;
