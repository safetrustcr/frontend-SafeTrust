'use client';
import Header from '@/components/layouts/Header';
import { SideBar } from '@/components/layouts/SideBar';
import Gallery from '@/components/hotels/details/Gallery';
import Information from '@/components/hotels/details/Information';
import Details from '@/components/hotels/details/Details';
import HotelMap from '@/components/hotels/payment/Map';

export default function HotelPage() {
  const images = [
    "/img/room1.png",
    "/img/room2.png",
    "/img/room2.png",
    "/img/room2.png",
  ];

  const coordinates: [number, number] = [9.9333, -84.0833];

  return (
    <div className="bg-gray-100 min-h-screen dark:bg-dark-background text-black dark:text-white text-sm">
      <Header />
      <div className="flex flex-col lg:flex-row mt-8">
        <SideBar className="hidden md:block" notificationCount={2} />
        <div className="flex-grow p-4 flex flex-col items-center gap-6">
          
          <div className="w-full md:w-2/3">
            <Gallery images={images} />
          </div>

          <div className="w-full md:w-2/3 flex flex-wrap">
            <div className="w-full md:w-3/4 lg:w-3/4">
              <Information 
                name="Shikara Hotel" 
                location="329 Calle Santos, Paseo Colón, San José, Costa Rica" 
                price="$40.18" 
              />
            </div>
            <div className="hidden md:block md:w-1/4 lg:w-1/4"></div>
          </div>

          <div className="w-full md:w-2/3 flex flex-wrap gap-4">
            <div className="w-full md:w-3/4 lg:w-3/4 flex gap-4">
              <div className="w-full md:w-1/2 min-h-[250px]">
                <Details 
                  beds={2} 
                  baths={1} 
                  description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
                />
              </div>
              <div className="w-full md:w-1/2 min-h-[250px]">
                <HotelMap coordinates={coordinates} hotelName="Shikara Hotel" />
              </div>
            </div>
            <div className="hidden md:block md:w-1/4 lg:w-1/4"></div>
          </div>

        </div>
      </div>
    </div>
  );
}
