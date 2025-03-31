"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath } from "lucide-react"

const RoomDetails = () => {
  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="p-0">
        <div className="space-y-4">
          {/* Hotel Name and Price */}
          <div className="relative">
            <h2 className="text-2xl font-semibold">Shikara Hotel</h2>
            <div className="absolute top-0 right-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">$40.18 / night</Button>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
              <MapPin className="w-3 h-3" />
            </div>
            <span className="text-sm text-gray-600">124 Colte Street, Downtown Center, San José</span>
          </div>

          {/* Amenities */}
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                <Bed className="w-3 h-3" />
              </div>
              <span className="text-sm text-gray-600">2 bed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                <Bath className="w-3 h-3" />
              </div>
              <span className="text-sm text-gray-600">1 bathroom</span>
            </div>
          </div>

          {/* Hotel Details and Map - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Hotel Details */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Hotel details</h3>
              <p className="text-sm text-gray-600">
                Lorem ipsum is simply random text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                scrambled it to make a type specimen book.
              </p>
            </div>

            {/* Map */}
            <div className="relative h-32 overflow-hidden rounded-md">
              <Image
                src="/img/image 16.png?height=195&width=300"
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

