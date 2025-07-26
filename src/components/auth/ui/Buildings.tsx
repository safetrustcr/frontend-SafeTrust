import Image from "next/image";

export default function Buildings() {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center">
      <Image
        src="/img/buildings.png"
        alt="Buildings"
        width={1600}
        height={1000}
        className="object-cover"
        priority
      />
    </div>
  );
}
