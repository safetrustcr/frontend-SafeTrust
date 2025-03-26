import type React from 'react';
import Image from 'next/image';
import { Bed, Bath, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface HotelDetailsProps {
  hotelName: string;
  description: string;
  details: string;
  goodToKnow: string;
  location: string;
  coordinates: [number, number];
  rating: number;
  beds: number;
  baths: number;
  imageUrl: string;
}

const HotelDetails: React.FC<HotelDetailsProps> = ({
  hotelName,
  description,
  details,
  goodToKnow,
  location,
  coordinates,
  rating,
  beds,
  baths,
  imageUrl,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 mb-6">
        <div className="w-full md:w-1/3 flex-shrink-0">
          <Image
            src={imageUrl || "/img/hotel/hotel1.jpg"}
            alt={`${hotelName} view`}
            width={316}
            height={265}
            className="object-cover rounded-lg w-full h-auto"
            priority
          />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {hotelName}
          </h2>
          <p className="text-xl text-gray-600 mb-6">King bed stylish Apartment</p>
          <div className="flex items-center mb-6">
            {[...Array(5)].map((_, i) => (
              <svg
                key={`star-${i+1}`}
                className="w-7 h-7 text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-2xl font-medium text-gray-800">5.0</span>
          </div>
          
          <div className="flex mt-4 space-x-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center bg-blue-100 h-14 w-14 rounded-full">
                <Bed className="h-7 w-7 text-blue-600" />
              </div>
              <span className="text-gray-700 ml-4 text-lg">{beds} bd.</span>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center justify-center bg-blue-100 h-14 w-14 rounded-full">
                <Bath className="h-7 w-7 text-blue-600" />
              </div>
              <span className="text-gray-700 ml-4 text-lg">{baths} ba.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 w-full" />

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Hotel details
        </h3>
        <p className="text-gray-600 text-lg">
          {details}
        </p>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Location
        </h3>
        <div className="flex items-start mb-4">
          <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-600 ml-2">{location}</span>
        </div>
        <div className="h-64 w-full rounded-lg overflow-hidden relative">
          <Image
            src="/img/image 16.png"
            alt="Map location"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Good to know:
        </h3>
        <p className="text-gray-600 text-lg">
          {goodToKnow}
        </p>
      </div>
    </div>
  );
};

export default HotelDetails;
