import { Send } from "lucide-react";

const ShareButton = () => {
  return (
    <div>
      <div className="border border-gray-400 bg-gray-100 rounded-full p-[8px] flex items-center justify-center cursor-pointer">
        <Send size={24} className="text-gray-600" />
      </div>
    </div>
  );
};
export default ShareButton;
