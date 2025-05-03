'use client';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layouts/Header';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/hotels/search/datepicker';
import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';

export default function HotelSearch() {
    const searchData = [
        {
            image: "/img/room1.png",
            name: "Shikara Hotel",
            location: "329 calle santos, paseo collos, San Jose",
            price: "40.14"
        },
        {
            image: "/img/room1.png",
            name: "Shikara Hotel",
            location: "329 calle santos, paseo collos, San Jose",
            price: "40.14"
        },
        {
            image: "/img/room1.png",
            name: "Shikara Hotel",
            location: "329 calle santos, paseo collos, San Jose",
            price: "40.14"
        },
        {
            image: "/img/room1.png",
            name: "Shikara Hotel",
            location: "329 calle santos, paseo collos, San Jose",
            price: "40.14"
        },
        {
            image: "/img/room1.png",
            name: "Shikara Hotel",
            location: "329 calle santos, paseo collos, San Jose",
            price: "40.14"
        },
    ]
    return ( 
        <div className='mt-[20px]'>
             <Header />
             <h1 className="text-2xl font-bold">Find hotel to stay</h1>
            <div className="flex justify-between items-center mt-6">
            <div className='flex justify-between items-center gap-[10px]' >
                <div>
                    <label className='block mb-3'>
                        Date
                    </label>
                    <DatePicker />
                </div>
                <div>
                    <label className='block mb-3'>
                        Where to
                    </label>
                    <Input placeholder="San José, San Pedro" className="w-full" />   
                </div>
            
            </div>
            
            <Button>Search</Button>
        </div>
        <div className='flex justify-end'>
            <Link href={"#"} className='text-sky-600'>
                View all
            </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                {searchData.map((data, idx)=>(
                    <Card key={idx}>
                        <img
                        src={data.image}
                        alt={data.name}
                        className="w-full h-48 object-cover rounded-t-md"
                        />
                        <CardContent className="p-4">
                        <h3 className="text-lg font-semibold flex justify-between py-2">{data.name} <button><Heart className='text-rose-400'/></button></h3>
                        <p className="text-sm text-gray-600 flex gap-[5px]"> <MapPin className='text-sky-700' size={20}/> {data.location}</p>
                        <p className="mt-2 text-primary font-bold py-2">${data.price} <span className='text-xs italic text-gray-400'>/night</span></p>
                        
                        </CardContent>
                  </Card>
                ))}
                
            </div>
        </div>
     );
}
 
