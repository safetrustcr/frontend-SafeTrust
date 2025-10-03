// components/WalletConnectQR.tsx
"use client";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { createWalletConnectURI } from "@/lib/walletconnect";

export default function WalletConnectQR() {
  const [uri, setUri] = useState<string>("");

  useEffect(() => {
    const generateURI = async () => {
      const newUri = await createWalletConnectURI();
      setUri(newUri);
    };

    generateURI();
  }, []);

//   if (!uri) return <p>Loading QR code...</p>;

  return (
    <div className="flex flex-col items-center justify-center">
      <h3 className="text-center">Scan with your wallet</h3>
      <QRCode value={uri} size={256} />
    </div>
  );
}
