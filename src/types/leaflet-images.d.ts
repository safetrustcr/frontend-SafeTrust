// Leaflet marker PNGs, bundled as static assets (same shape as next/image imports).
declare module "leaflet/dist/images/*.png" {
  const image: { src: string; height: number; width: number };
  export default image;
}
