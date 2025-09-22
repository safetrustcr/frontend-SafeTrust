"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { CheckCircle2, Info, Lock, MapPin } from "lucide-react"

type RoomPaymentDrawerProps = {
  priceLabel?: string
  propertyTitle?: string
}

const RoomPaymentDrawer = ({ priceLabel = "$40.18 / night", propertyTitle = "Puerto Viejo House" }: RoomPaymentDrawerProps) => {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"billing" | "status">("billing")

  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => setStep("billing"), 200)
      return () => clearTimeout(id)
    }
  }, [open])

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">{priceLabel}</Button>
      </DrawerTrigger>
      <DrawerContent>
        {step === "billing" && (
          <div className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-2 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full"><MapPin className="h-3 w-3" /> Limón</span>
                      <h2 className="text-2xl font-semibold">{propertyTitle}</h2>
                    </div>
                    <div className="text-blue-600"><Info className="h-5 w-5" /></div>
                  </div>

                  <div className="pt-2">
                    <h3 className="font-semibold">Billing payment</h3>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Amount per month</span>
                        <span className="font-medium">$ 18,000</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Occupancy taxes</span>
                        <span className="font-medium">$ 200,00</span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                  </div>

                  <Card className="border-none shadow-none">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between text-orange-600 font-semibold text-lg">
                        <span>$ 18,200/ month</span>
                        <span className="text-gray-600 font-normal">Deposit: $14,000</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => setStep("status")}>Pay</Button>
          </div>
        )}

        {step === "status" && (
          <div className="p-4 space-y-6">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center gap-2 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full">Puerto Viejo House</span>
                    <div className="text-blue-600"><Info className="h-5 w-5" /></div>
                  </div>
                  <h2 className="text-2xl font-semibold">Deposit status</h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Deposit</h3>
                      <div className="flex items-center justify-between rounded-xl bg-gray-100 p-4">
                        <p className="text-sm text-gray-600 max-w-[75%]">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="h-16 w-1 bg-orange-400 rounded-full" />
                      <div className="-mt-4 flex flex-col items-center text-orange-500">
                        <Lock className="h-8 w-8" />
                      </div>
                      <div className="h-16 w-1 bg-orange-400 rounded-full" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Rental time</h3>
                      <div className="flex items-center justify-between rounded-xl bg-gray-100 p-4">
                        <p className="text-sm text-gray-600 max-w-[75%]">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </div>

          <div className="pt-2">
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default RoomPaymentDrawer


