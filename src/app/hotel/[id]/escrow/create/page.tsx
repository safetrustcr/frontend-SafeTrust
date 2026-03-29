"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Bath, BedDouble, Dog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { InvoiceHeader } from "@/components/escrow/InvoiceHeader";
import { ProcessStepper } from "@/components/escrow/ProcessStepper";
import { OwnerContact } from "@/components/escrow/OwnerContact";
import { XDRSigningFlow } from "@/components/escrow/XDRSigningFlow";
import { EscrowAction } from "@/components/escrow/types";
import { Header } from "@/components/layouts/Header";

// Stub data
const STUB_INVOICE = {
  invoiceNumber: "INV4257-09-012",
  status: "pending",
  engagement_id: "stub-engagement-id",
  stubXDR: "AAAAAgAAAAB...stub...==",
};

const STUB_HOTEL = {
  name: "La sabana",
  address: "329 Calle santos, paseo colón, San José",
  price: 1500,
  details: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  images: [
    "/img/room1.png",
    "/img/room2.png",
    "/img/hotel/hotel1.jpg",
    "/img/room1.png",
  ],
  owner: {
    phone: "+506 64852179",
    email: "albertoCasas100@gmail.com"
  }
};

export default function CreateEscrowPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [showSigning, setShowSigning] = useState(false);

  // Escrow action for XDRSigningFlow
  const escrowAction: EscrowAction = {
    type: 'deploy',
    unsignedXDR: STUB_INVOICE.stubXDR,
    amount: String(STUB_HOTEL.price),
    title: STUB_HOTEL.name,
    contractId: STUB_INVOICE.engagement_id,
  };

  const handleSigningSuccess = (result: any) => {
    // On success, redirect to the new escrow page
    const newEscrowId = result.contractId || "new-escrow-id";
    router.push(`/hotel/${id}/escrow/${newEscrowId}`);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <Header />
      <div className="container mx-auto px-4 py-14 max-w-7xl">
        <div className="mb-24">
          <InvoiceHeader
            invoiceNumber={STUB_INVOICE.invoiceNumber}
            status={STUB_INVOICE.status}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <CardContent className="px-10 pt-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{STUB_HOTEL.name}</h2>
                  {!showSigning && (
                    <Button
                      onClick={() => setShowSigning(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 rounded-lg text-lg font-bold transition-all shadow-md hover:shadow-lg"
                    >
                      PAY
                    </Button>
                  )}
                </div>

                <Separator className="mb-10 bg-[#d4d4d4]" />

                {/* Image Gallery */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  {STUB_HOTEL.images.map((img, index) => (
                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden shadow-sm group">
                      <Image
                        src={img}
                        alt={`${STUB_HOTEL.name} image ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-500 mb-10">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100/50 text-orange-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{STUB_HOTEL.address}</span>
                </div>

                <Separator className="my-10 bg-[#d4d4d4]" />

                {/* Amenities */}
                <div className="flex flex-wrap gap-8 mb-10">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100/50 text-orange-500">
                      <BedDouble className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">2 bd.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100/50 text-orange-500">
                      <Dog className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">pet friendly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100/50 text-orange-500">
                      <Bath className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">1 ba.</span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Property details</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                    {STUB_HOTEL.details}
                  </p>
                </div>

                <Separator className="my-10 bg-[#d4d4d4]" />

                {/* Owner Contact */}
                <OwnerContact
                  phone={STUB_HOTEL.owner.phone}
                  email={STUB_HOTEL.owner.email}
                />
              </CardContent>
            </Card>

            {showSigning && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <XDRSigningFlow
                  escrowAction={escrowAction}
                  onSuccess={handleSigningSuccess}
                />
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Notes</h3>
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <Textarea
                  placeholder="Enter any additional notes here..."
                  className="min-h-[120px] bg-white border-none rounded-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none text-sm p-0 shadow-none hover:border-none"
                />
              </div>
            </div>

            <Separator className="bg-[#d4d4d4]" />

            <div className="space-y-6">
              <ProcessStepper currentStep={1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
