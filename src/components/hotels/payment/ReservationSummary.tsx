'use client'

import type React from 'react'
import { Button } from '@/components/ui/button'
import { fundReservationEscrow, initializedReservationEscrow } from '@/services/escrow.service'
import { v4 as uuidv4 } from 'uuid'
import { useState } from 'react'
import { toast } from 'sonner'

interface ReservationSummaryProps {
  hotelName: string
  description: string
  price: number
  tax: number
  checkIn: Date
  checkOut: Date
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  hotelName,
  description,
  price,
  tax,
  checkIn,
  checkOut,
}) => {
  const [loading, setLoading] = useState(false)
  const totalAmount = price + tax

  const onPayReservation = async () => {
    setLoading(true)
    try {
      const defaultWallet = '0xYourDefaultWallet'
      const clientWallet = '0xClientWallet'

      // Step 1: Initialize escrow
      const escrowPayload = {
        signer: defaultWallet,
        engagementId: uuidv4(),
        title: `Reservation: ${hotelName}`,
        description,
        roles: {
          approver: clientWallet,
          serviceProvider: defaultWallet,
          platformAddress: defaultWallet,
          releaseSigner: defaultWallet,
          disputeResolver: defaultWallet,
          receiver: defaultWallet,
        },
        amount: totalAmount,
        platformFee: 0,
        milestones: [
          {
            description: `Stay from ${checkIn.toDateString()} to ${checkOut.toDateString()}`,
          },
        ],
        trustline: {
          address: defaultWallet,
          decimals: 18,
        },
        receiverMemo: 'Hotel reservation',
      }

      const { data } = await initializedReservationEscrow(escrowPayload)
      const contractId = data.contract_id || data.id // adjust based on your API's return shape

      // Step 2: Fund escrow
      await fundReservationEscrow({
        contractId,
        signer: defaultWallet,
        amount: totalAmount,
      })

      toast.success('Reservation paid and escrow funded!')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to complete payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Reservation Summary</h2>

      <div className="h-px bg-gray-200 w-full my-4" />

      <div className="flex justify-between">
        <div>
          <p className="font-semibold text-gray-800 mb-1">From</p>
          <p className="text-gray-600">{checkIn.toDateString()}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">To</p>
          <p className="text-gray-600">{checkOut.toDateString()}</p>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-gray-800">{hotelName}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="h-px bg-gray-200 w-full my-4" />

      <div className="space-y-5">
        <h3 className="text-xl font-bold text-gray-800">Your price summary</h3>

        <div className="flex justify-between">
          <p className="text-gray-600">Price</p>
          <p className="text-gray-800">${price.toFixed(2)}</p>
        </div>

        <div className="flex justify-between">
          <p className="text-gray-600">% VAT</p>
          <p className="text-gray-800">${tax.toFixed(2)}</p>
        </div>

        <div className="flex justify-between">
          <p className="text-green-600 font-semibold">Total amount</p>
          <p className="text-green-600 font-semibold">${totalAmount.toFixed(2)}</p>
        </div>
      </div>

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 rounded-md text-lg"
        onClick={onPayReservation}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay with wallet'}
      </Button>
    </div>
  )
}

export default ReservationSummary
