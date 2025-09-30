import { Phone } from "lucide-react";

const ContactButton = () => {
  return (
    <div>
      <div className="border border-gray-400 bg-gray-100 rounded-full p-[8px] flex items-center justify-center cursor-pointer">
        <Phone size={25} className="text-gray-600" />
      </div>
    </div>
  );
};
export default ContactButton;
