import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-slate-900">
      <div className="flex items-center space-x-2 pb-6">
        <Image src="/img/logo.png" alt="SafeTrust" width={40} height={40} />
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          SafeTrust
        </span>
      </div>
      <h1 className="text-6xl font-extrabold text-orange-600 dark:text-orange-400">
        404
      </h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">
        Page Not Found
      </h2>
      <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
        The page or listing you are looking for does not exist.
      </p>
      <Link
        href="/rent"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        Back to Listings
      </Link>
    </div>
  );
}
