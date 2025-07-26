import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface InformationProps {
  name: string;
  location: string;
  price: string;
}

export default function Information({ name, location, price }: InformationProps) {
  return (
    <Card className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-start gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{name}</h1>
        <span className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg font-semibold text-base sm:text-lg md:text-xl">
          {price} / night
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 text-gray-600 dark:text-gray-300 text-base sm:text-lg md:text-xl">
        <div className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center bg-blue-200 dark:bg-blue-700 rounded-full">
          <MapPin className="w-6 sm:w-7 h-6 sm:h-7 text-blue-600 dark:text-blue-300" />
        </div>
        <span className="text-sm sm:text-base md:text-lg">{location}</span>
      </div>
    </Card>
  );
}
