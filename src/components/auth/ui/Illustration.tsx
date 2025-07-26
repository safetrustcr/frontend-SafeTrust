import Image from "next/image";

export default function Illustration() {
  return (
    <div className="relative hidden md:block md:w-1/2">
      <div className="absolute mt-[15rem] inset-0 flex items-center justify-center">
        <Image
          src="/img/hotels.png"
          alt="Hotels"
          width={1500}
          height={1200}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
