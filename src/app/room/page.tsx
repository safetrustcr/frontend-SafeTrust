"use client"

import RoomPhotos from "@/components/rooms/RoomPhotos";
import RoomDetails from "@/components/rooms/RoomDetails";
import AditionalRoomPhotos from "@/components/rooms/AditionalRoomPhotos";

const additionalImages = [
  "/img/room1.png?height=195&width=300",
  "/img/room1.png?height=195&width=300",
  "/img/room1.png?height=195&width=300",
]

export default function RoomPage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Room Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        {/* Main Room Photos - Takes 8 columns on desktop */}
        <div className="md:col-span-8">
          <RoomPhotos />
        </div>

        {/* Additional Hotel Images - Takes 4 columns on desktop */}
        <div className="md:col-span-4">
          <AditionalRoomPhotos images={additionalImages} />
        </div>

        {/* Room Details - Now takes 8 columns to match the main photo width */}
        <div className="md:col-span-8">
          <RoomDetails />
        </div>
      </div>
    </div>
  );
}