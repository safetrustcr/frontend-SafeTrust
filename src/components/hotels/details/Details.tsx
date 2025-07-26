import { Card } from "@/components/ui/card";
import { Bed, Bath } from "lucide-react";

interface DetailsProps {
  beds: number;
  baths: number;
  description: string;
}

export default function Details({ beds, baths, description }: DetailsProps) {
  return (
    <Card className="flex flex-col justify-between min-h-[200px] sm:min-h-[250px] md:min-h-[300px] p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-start gap-6 sm:gap-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-3 sm:p-4 bg-blue-100 dark:bg-blue-700 rounded-full">
            <Bed className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7 text-blue-600 dark:text-blue-300" />
          </div>
          <span className="text-base sm:text-lg md:text-xl font-medium">{beds} bd.</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-3 sm:p-4 bg-blue-100 dark:bg-blue-700 rounded-full">
            <Bath className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7 text-blue-600 dark:text-blue-300" />
          </div>
          <span className="text-base sm:text-lg md:text-xl font-medium">{baths} ba.</span>
        </div>
      </div>

      <div className="mt-auto">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Hotel details</h2>
        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base">
          {description}
        </p>
      </div>
    </Card>
  );
}
