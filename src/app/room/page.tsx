"use client"

import RoomPhotos from "@/components/rooms/RoomPhotos";
import RoomDetails, { RoomDetailsInfo } from "@/components/rooms/RoomDetails";
import AditionalRoomPhotos from "@/components/rooms/AditionalRoomPhotos";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";

const additionalImages = [
  "/img/room1.png?height=195&width=300",
  "/img/room1.png?height=195&width=300",
  "/img/room1.png?height=195&width=300",
]
const breadcrumbs = [
  { label: "Search", href: "/dashboard/search" },
  { label: "Shikara Hotel", isCurrentPage: true },
];

export default function RoomPage() {
  const detailsInfo: RoomDetailsInfo = {
    hotelName: "Shikara Hotel",
    address: "124 Colte Street, Downtown Center, San José",
    beds: 2,
    baths: 1,
    mapImageSrc: "/img/image 16.png?height=195&width=300",
    detailsDescription:
      "Lorem ipsum is simply random text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    payment: {
      priceLabel: "$40.18 / night",
      locationTag: "Limón",
      propertyTitle: "Puerto Viejo House",
      monthlyAmount: 18000,
      occupancyTaxes: 200,
      totalPerMonth: 18200,
      depositAmount: 14000,
      billingDescription: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      depositStatusText: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      rentalStatusText: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    },
  }
  return (
    <div className="container mx-auto pb-8 max-w-6xl">
      <NavigationHeader
        breadcrumbs={breadcrumbs}
        backButtonFallback="/search"
      />
      <h1 className="px-4 md:px-6 text-2xl font-bold my-4 lg:mb-6">Room Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        {/* Main Room Photos - Takes 8 columns on desktop */}
        <div className="md:col-span-8 px-2 md:px-6">
          <RoomPhotos />
        </div>

        {/* Additional Hotel Images - Takes 4 columns on desktop */}
        <div className="hidden lg:block md:col-span-4">
          <AditionalRoomPhotos images={additionalImages} />
        </div>

        {/* Room Details - Now takes 8 columns to match the main photo width */}
        <div className="md:col-span-8 md:px-6">
          <RoomDetails info={detailsInfo} />
        </div>
      </div>
    </div>
  );
}