"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import RoomPaymentDrawer, { RoomPaymentInfo } from "./RoomPaymentDrawer"
import { MapPin, Bed, Bath } from "lucide-react"

export type RoomDetailsInfo = {
  hotelName: string
  address: string
  beds: number
  baths: number
  mapImageSrc: string
  detailsDescription: string
  payment: RoomPaymentInfo
}

type RoomDetailsProps = {
  info: RoomDetailsInfo
}

const RoomDetails = ({ info }: RoomDetailsProps) => {
  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="p-4 md:p-0">
        <div className="space-y-4">
          {/* Hotel Name and Price */}
          <div className="flex justify-between items-center flex-wrap gap-x-4 gap-y-2">
            <h2 className="text-2xl font-semibold">{info.hotelName}</h2>
            <div className="">
              <RoomPaymentDrawer info={info.payment} />
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
              <MapPin className="w-3 h-3" />
            </div>
            <span className="text-sm text-gray-600">{info.address}</span>
          </div>

          {/* Amenities */}
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                <Bed className="w-3 h-3" />
              </div>
              <span className="text-sm text-gray-600">{info.beds} bed{info.beds !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                <Bath className="w-3 h-3" />
              </div>
              <span className="text-sm text-gray-600">{info.baths} bathroom{info.baths !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Hotel Details and Map - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Hotel Details */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Hotel details</h3>
              <p className="text-sm text-gray-600">{info.detailsDescription}</p>
            </div>

            {/* Map */}
            <div className="relative h-32 overflow-hidden rounded-md">
              <Image
                src={info.mapImageSrc}
                alt="Hotel location map"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RoomDetails

