import { Heart } from "lucide-react";

const FavoriteButton = () => {
  return (
    <div className="flex items-center gap-4 cursor-pointer">
      <div className="border border-gray-400 bg-gray-100 rounded-full p-[8px] flex items-center justify-center">
        <Heart size={24} className="text-gray-600" />
      </div>
      <div className="text-gray-800 font-medium text-[18px]">
        Add to favorites
      </div>
    </div>
  );
};

export default FavoriteButton;
