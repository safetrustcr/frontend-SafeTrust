import type React from 'react';
import { Button } from '@/components/ui/button';
import { fundReservationEscrow, initializedReservationEscrow } from '@/services/escrow.service';

interface ReservationSummaryProps {
  hotelName: string;
  description: string;
  price: number;
  tax: number;
  checkIn: Date;
  checkOut: Date;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  hotelName,
  description,
  price,
  tax,
  checkIn,
  checkOut,
}) => {
  const totalAmount = price + tax;

  const formatDate = (date: Date) => {
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day} - ${year}`;
  };

  const onPayReservation = async () => {
    const { data } = await initializedReservationEscrow({
      hotelName,
      description,
      price: totalAmount,
      tax,
    })
    
    const contractId = data.contract_id;

    await fundReservationEscrow({ contractId, amount: totalAmount });
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Reservation Summary</h2>
      
      <div className="h-px bg-gray-200 w-full my-4" />
      
      <div className="flex justify-between">
        <div>
          <p className="font-semibold text-gray-800 mb-1">From</p>
          <p className="text-gray-600">July 14 - 2025</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">To</p>
          <p className="text-gray-600">Aug 2 - 2025</p>
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-gray-800">{hotelName}</h3>
        <p className="text-gray-600">King bed stylish Apartment</p>
      </div>
      
      <div className="h-px bg-gray-200 w-full my-4" />
      
      <div className="space-y-5">
        <h3 className="text-xl font-bold text-gray-800">Your price summary</h3>
        
        <div className="flex justify-between">
          <p className="text-gray-600">Price</p>
          <p className="text-gray-800">${price.toFixed(2)}</p>
        </div>
        
        <div className="flex justify-between">
          <p className="text-gray-600">% VA</p>
          <p className="text-gray-800">${tax.toFixed(1)}</p>
        </div>
        
        <div className="flex justify-between">
          <p className="text-green-600 font-semibold">Total ammount</p>
          <p className="text-green-600 font-semibold">$50.7</p>
        </div>
      </div>
      
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 rounded-md text-lg"
        onClick={onPayReservation}
      >
        Pay with wallet
      </Button>
    </div>
  );
};

export default ReservationSummary;
