import Image from "next/image";

interface IllustrationProps {
  className?: string;
}

export default function Illustration({ className }: IllustrationProps) {
  return (
    <div className="relative">
      <div className="absolute mt-[15rem] inset-0 flex items-center justify-center">
        <Image
          src="/img/hotels.png"
          alt="Hotels"
          width={1500}
          height={1200}
          className={`object-contain ${className || ''}`}
          priority
        />
      </div>
    </div>
  );
}
