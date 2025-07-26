interface ImageProps {
    src: string;
    alt?: string;
    className?: string;
  }
  
  export default function Image({ src, alt = "Image", className }: ImageProps) {
    return (
      <div className={`w-full h-auto rounded-lg overflow-hidden ${className}`}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }
  