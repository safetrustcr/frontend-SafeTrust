"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { CheckCircle2, Info, Lock, MapPin } from "lucide-react"

export type RoomPaymentInfo = {
  priceLabel: string
  locationTag: string
  propertyTitle: string
  monthlyAmount: number
  occupancyTaxes: number
  totalPerMonth: number
  depositAmount: number
  billingDescription: string
  depositStatusText: string
  rentalStatusText: string
}

type RoomPaymentDrawerProps = {
  info: RoomPaymentInfo
}

const RoomPaymentDrawer = ({ info }: RoomPaymentDrawerProps) => {
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
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">{info.priceLabel}</Button>
      </DrawerTrigger>
      <DrawerContent>
        {step === "billing" && (
          <div className="space-y-4">
                  <div className="flex items-start justify-between px-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-2 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-lg"><MapPin className="h-3 w-3" /> {info.locationTag}</span>
                      <h2 className="text-2xl font-semibold">{info.propertyTitle}</h2>
                    </div>
                  </div>
                  <div className="w-full h-[0.5px] bg-[#BDBDBD]"></div>
                  <div className="pt-4 px-4">
                    <h3 className="font-semibold">Billing payment</h3>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Amount per month</span>
                        <span className="">$ {info.monthlyAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Occupancy taxes</span>
                        <span className="">$ {info.occupancyTaxes.toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{info.billingDescription}</p>
                  </div>

                  <div className="w-full h-[0.5px] bg-[#BDBDBD]"></div>
                  <Card className="border-none py-2 !shadow-none">
                    <CardContent className="px-4 py-0">
                      <div className="flex items-center justify-between text-blue-600 font-semibold text-lg">
                        <span>$ {info.totalPerMonth.toLocaleString()}/ month</span>
                        <span className="text-gray-600 text-sm font-normal">Deposit: ${""}{info.depositAmount.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="px-4 py-6 rounded-2xl shadow-[0_-5px_20px_0_#00000012]">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setStep("status")}>Pay</Button>
                  </div>
          </div>
        )}

        {step === "status" && (
          <div className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center gap-2 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">{info.propertyTitle}</span>
                    <div className="text-blue-600"><Info className="h-5 w-5" /></div>
                  </div>
                  <h2 className="text-2xl font-semibold">Deposit status</h2>

                  <div className="">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Deposit</h3>
                      <div className="flex items-center justify-between rounded-xl bg-gray-100 p-4">
                        <p className="text-sm text-gray-600 max-w-[75%]">{info.depositStatusText}</p>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                    </div>

                    <div className="flex flex-col py-6 items-center">
                      <svg width="32" height="109" viewBox="0 0 32 109" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 101C8 105.418 11.5817 109 16 109C20.4183 109 24 105.418 24 101C24 96.5817 20.4183 93 16 93C11.5817 93 8 96.5817 8 101ZM16 72H14.5V101H16H17.5V72H16Z" fill="#2563eb"/>
                        <path d="M7 8C7 12.4183 10.5817 16 15 16C19.4183 16 23 12.4183 23 8C23 3.58172 19.4183 -1.93129e-07 15 0C10.5817 1.93129e-07 7 3.58172 7 8ZM15 8L13.5 8L13.5 41L15 41L16.5 41L16.5 8L15 8Z" fill="#2563eb"/>
                        <path d="M28 54.5H26V48.5C26 44.088 22.412 40.5 18 40.5H14C9.588 40.5 6 44.088 6 48.5H10C10 46.294 11.794 44.5 14 44.5H18C20.206 44.5 22 46.294 22 48.5V54.5H16H4C2.9 54.5 2 55.4 2 56.5V70.5C2 71.6 2.9 72.5 4 72.5H28C29.1 72.5 30 71.6 30 70.5V56.5C30 55.4 29.1 54.5 28 54.5ZM18 65.962V67.5C18 68.6 17.1 69.5 16 69.5C14.9 69.5 14 68.6 14 67.5V65.962C12.806 65.268 12 63.982 12 62.5C12 60.294 13.794 58.5 16 58.5C18.206 58.5 20 60.294 20 62.5C20 63.982 19.194 65.268 18 65.962Z" fill="#2563eb"/>
                      </svg>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Rental time</h3>
                      <div className="flex items-center justify-between rounded-xl bg-gray-100 p-4">
                        <p className="text-sm text-gray-600 max-w-[75%]">{info.rentalStatusText}</p>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </div>

          <div className="pt-2 mb-2">
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default RoomPaymentDrawer


